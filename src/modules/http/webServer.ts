import express, {Express, NextFunction, Request, Response} from "express"
import {Logger} from "../logging"
import {Server} from "http"
import axios from 'axios'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import {Main} from "../../index"
import {
    IChannelPointsAddReward,
    IChannelPointsRedeemReward,
    IChannelPointsRemoveReward,
    IChannelPointsUpdateRedemption,
    IChannelPointsUpdateReward,
    IFollow,
    Notification
} from "./interfaces"
import {EventTypes} from "./constants/eventTypes"
import {
    HMAC_PREFIX,
    MESSAGE_TYPE,
    MESSAGE_TYPE_NOTIFICATION,
    TWITCH_MESSAGE_ID,
    TWITCH_MESSAGE_SIGNATURE,
    TWITCH_MESSAGE_TIMESTAMP
} from "./constants/eventsub"
import {
    IChannelPointsAddRewardEvent,
    IChannelPointsRedeemRewardEvent,
    IChannelPointsRemoveRewardEvent,
    IChannelPointsUpdateRedemptionEvent,
    IChannelPointsUpdateRewardEvent,
    IFollowEvent
} from "../pubsub/interfaces/messages"
import {MessageTypes} from "../pubsub/constants/messageTypes"
import * as crypto from 'crypto'
import {Buffer} from "buffer"
import {IUserData} from "./interfaces/IUserData";
import MySQLStore from "express-mysql-session";

declare module 'express-session' {
    interface SessionData {
        userId: number
    }
}

export class WebServer {
    public readonly app: Express
    public readonly server: Server
    private readonly logger: Logger
    private readonly main: Main

    constructor(main: Main, port: number) {
        let self = this
        this.main = main
        this.logger = main.logManager.getLogger('http')

        this.app = express()

        this.app.set('view engine', 'ejs')

        this.app.use(cookieParser())

        // @ts-ignore
        const MySQLStoreClass = MySQLStore(session)
        const sessionStore = new MySQLStoreClass({}, this.main.database.pool);

        this.app.use(session({
            secret: process.env.SESSION_SECRET ?? '',
            saveUninitialized: true,
            cookie: { maxAge: 1000 * 60 * 60 * 24 },
            resave: false,
            store: sessionStore,
        }))


        this.initializeRoutes()

        this.server = this.app.listen(port, () => {
            self.logger.info(`Server running at http://localhost:${port}`)
        })
    }

    ///////////////
    /// Routing ///
    ///////////////

    private readonly publicRoutes = express.Router()
    private readonly eventsubRoutes = express.Router()

    private static injectUrl(req: Request, res: Response, next: NextFunction) {
       res.locals.url = req.url
       next()
    }

    private injectUser(self: WebServer) {
    return async function
        injectUser(req: Request, res: Response, next: NextFunction) {
            res.locals.user = req!.session!.userId ? await self.main.database.userDAO.getUser(req.session.userId) : undefined
            res.locals.authenticated = !!res.locals.user
            next()
        }
    }

    private initializeRoutes() {
        let self: WebServer = this

        this.publicRoutes.use(WebServer.injectUrl)
        this.publicRoutes.use(self.injectUser(self))

        this.publicRoutes.get('/', async function (req, res) {
            self.logger.info(req.session.id)

            res.render('index')
        })

        this.publicRoutes.get('/preferences', async function (req, res) {
            if (!res.locals.authenticated) {
                res.redirect('/')
                return
            }

            res.render('preferences')
        })

        this.publicRoutes.get('/loading', async function (req, res) {
            res.render('loading')
        })

        this.publicRoutes.get('/auth', function (req, res) {
            let url = `https://id.twitch.tv/oauth2/authorize?client_id=${process.env.TWITCH_CLIENT_ID}&redirect_uri=${process.env.TWITCH_REDIRECT_URI}&response_type=code&scope=user:read:email`
            res.redirect(url)
        })
        
        this.publicRoutes.get('/auth/callback', function (req: Request, res) {
            // res.render('loading', data)
            let code = req.query.code
            axios({
                method: 'post',
                url: `https://id.twitch.tv/oauth2/token?client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=authorization_code&redirect_uri=${process.env.TWITCH_REDIRECT_URI}&code=${code}`,
                headers: {
                    accept: 'application/json',
                },
            }).then((response) => {
                let tokenData = response.data
                self.logger.debug(tokenData)

                WebServer.getUserData(tokenData.access_token).then((userData) => {
                    self.logger.debug(userData)

                    req!.session!.userId = userData.userId

                    self.main.database.userDAO.exists(userData.userId).then(exists => {
                        if (!exists) {
                            self.main.database.userDAO.insertUser({
                                id: userData.userId,
                                displayName: userData.displayName,
                                email: userData.email,
                                profileImage: userData.profileImage,
                                apiToken: null
                            }).catch(err => {
                                self.logger.error(err)
                            })
                        }
                    })

                    res.redirect('/')
                }).catch((err) => {
                    self.logger.error(err)
                    res.redirect('/')
                })

            }).catch((err) => {
                self.logger.error(err)
                res.redirect('/')
            })
        })

        this.publicRoutes.get('/logout', function (req, res) {
            req.session.destroy(() => {})
            res.redirect('/')
        })

        this.eventsubRoutes.use(express.json())

        this.eventsubRoutes.post('/', function (req, res) {
            let secret = WebServer.getSecret()
            let hmacMessage = WebServer.getHmacMessage(req)
            let hmac = HMAC_PREFIX + WebServer.getHmac(secret, hmacMessage)

            if (!WebServer.verifyMessage(hmac, req.headers[TWITCH_MESSAGE_SIGNATURE] as string)) {
                res.sendStatus(403)
                res.end()
                self.logger.warn(`Received invalid eventsub signature`)
                return
            }

            if (MESSAGE_TYPE_NOTIFICATION === req.headers[MESSAGE_TYPE]) {
                self.logger.info(`Event type: ${req.body.subscription.type}`)

                let notification: Notification = req.body

                switch (notification.subscription.type) {
                    case EventTypes.follow:
                        self.followHandler(notification.event as IFollow)
                        break
                    case EventTypes.channelPointsAddReward:
                        self.channelPointsAddRewardHandler(notification.event as IChannelPointsAddReward)
                        break
                    case EventTypes.channelPointsUpdateReward:
                        self.channelPointsUpdateRewardHandler(notification.event as IChannelPointsUpdateReward)
                        break
                    case EventTypes.channelPointsRemoveReward:
                        self.channelPointsRemoveRewardHandler(notification.event as IChannelPointsRemoveReward)
                        break
                    case EventTypes.channelPointsRedeemReward:
                        self.channelPointsRedeemRewardHandler(notification.event as IChannelPointsRedeemReward)
                        break
                    case EventTypes.channelPointsUpdateRedemption:
                        self.channelPointsUpdateRedemptionHandler(notification.event as IChannelPointsUpdateRedemption)
                        break
                    default:
                        self.logger.warn(`Unhandled event type: ${notification.subscription.type}`)
                        break
                }

                res.sendStatus(204)
                res.end()
            }
            else {
                res.sendStatus(403)
                res.end()
            }
        })

        self.app.use('/', self.publicRoutes)
        self.app.use('/eventsub', self.eventsubRoutes)
    }

    /////////////////////////////
    /// Notification Handlers ///
    /////////////////////////////

    private followHandler(event: IFollow) {
        let self = this
        self.logger.info(`${event.user_name} just followed ${event.broadcaster_user_name}`)

        let pubsubMessage: IFollowEvent = {
            type: MessageTypes.channelPointsAddReward,
            event: {
                user: {
                    id: parseInt(event.user_id),
                    displayName: event.user_name,
                    login: event.user_login,
                },
                broadcaster: {
                    id: parseInt(event.broadcaster_user_id),
                    displayName: event.broadcaster_user_name,
                    login: event.broadcaster_user_login,
                },
                followedAt: Date.parse(event.followed_at)
            }
        }

        // self.main.pubsubServer.broadcastRaw(JSON.stringify(pubsubMessage))
        self.main.pubsubServer.sendRaw(JSON.stringify(pubsubMessage), pubsubMessage.event.broadcaster.id)
    }

    private channelPointsAddRewardHandler(event: IChannelPointsAddReward) {
        let self = this
        self.logger.info(`${event.title} added as a reward to ${event.broadcaster_user_name} for ${event.cost} points`)

        let pubsubMessage: IChannelPointsAddRewardEvent = {
            type: MessageTypes.follow,
            event: {
                broadcaster: {
                    id: parseInt(event.broadcaster_user_id),
                    displayName: event.broadcaster_user_name,
                    login: event.broadcaster_user_login,
                },
                cost: event.cost,
                backgroundColor: event.background_color,
                cooldownExpiresAt: event.cooldown_expires_at ? Date.parse(event.cooldown_expires_at) : undefined,
                defaultImage: {
                    url1x: event.default_image.url_1x,
                    url2x: event.default_image.url_2x,
                    url4x: event.default_image.url_4x,
                },
                globalCooldown: {
                    isEnabled: event.global_cooldown.is_enabled,
                    seconds: event.global_cooldown.seconds,
                },
                image: event.image ? {
                    url1x: event.image.url_1x,
                    url2x: event.image.url_2x,
                    url4x: event.image.url_4x,
                } : undefined,
                isEnabled: event.is_enabled,
                isInStock: event.is_in_stock,
                isPaused: event.is_paused,
                isUserInputRequired: event.is_user_input_required,
                maxPerStream: {
                    isEnabled: event.max_per_stream.is_enabled,
                    value: event.max_per_stream.value,
                },
                rewardId: event.id,
                maxPerUserPerStream: {
                    isEnabled: event.max_per_user_per_stream.is_enabled,
                    value: event.max_per_user_per_stream.value,
                },
                prompt: event.prompt,
                title: event.title,
                redemptionsRedeemedCurrentStream: event.redemptions_redeemed_current_stream,
                shouldRedemptionsSkipRequestQueue: event.should_redemptions_skip_request_queue,
            }
        }

        // self.main.pubsubServer.broadcastRaw(JSON.stringify(pubsubMessage))
        self.main.pubsubServer.sendRaw(JSON.stringify(pubsubMessage), pubsubMessage.event.broadcaster.id)
    }

    private channelPointsUpdateRewardHandler(event: IChannelPointsUpdateReward) {
        let self = this
        self.logger.info(`Reward ${event.title} updated on ${event.broadcaster_user_name}`)

        let pubsubMessage: IChannelPointsUpdateRewardEvent = {
            type: MessageTypes.channelPointsUpdateReward,
            event: {
                broadcaster: {
                    id: parseInt(event.broadcaster_user_id),
                    displayName: event.broadcaster_user_name,
                    login: event.broadcaster_user_login,
                },
                cost: event.cost,
                backgroundColor: event.background_color,
                cooldownExpiresAt: event.cooldown_expires_at ? Date.parse(event.cooldown_expires_at) : undefined,
                defaultImage: {
                    url1x: event.default_image.url_1x,
                    url2x: event.default_image.url_2x,
                    url4x: event.default_image.url_4x,
                },
                globalCooldown: {
                    isEnabled: event.global_cooldown.is_enabled,
                    seconds: event.global_cooldown.seconds,
                },
                image: event.image ? {
                    url1x: event.image.url_1x,
                    url2x: event.image.url_2x,
                    url4x: event.image.url_4x,
                } : undefined,
                isEnabled: event.is_enabled,
                isInStock: event.is_in_stock,
                isPaused: event.is_paused,
                isUserInputRequired: event.is_user_input_required,
                maxPerStream: {
                    isEnabled: event.max_per_stream.is_enabled,
                    value: event.max_per_stream.value,
                },
                rewardId: event.id,
                maxPerUserPerStream: {
                    isEnabled: event.max_per_user_per_stream.is_enabled,
                    value: event.max_per_user_per_stream.value,
                },
                prompt: event.prompt,
                title: event.title,
                redemptionsRedeemedCurrentStream: event.redemptions_redeemed_current_stream,
                shouldRedemptionsSkipRequestQueue: event.should_redemptions_skip_request_queue,
            }
        }

        // self.main.pubsubServer.broadcastRaw(JSON.stringify(pubsubMessage))
        self.main.pubsubServer.sendRaw(JSON.stringify(pubsubMessage), pubsubMessage.event.broadcaster.id)
    }

    private channelPointsRemoveRewardHandler(event: IChannelPointsRemoveReward) {
        let self = this
        self.logger.info(`Reward ${event.title} removed from ${event.broadcaster_user_name}`)

        let pubsubMessage: IChannelPointsRemoveRewardEvent = {
            type: MessageTypes.channelPointsRemoveReward,
            event: {
                broadcaster: {
                    id: parseInt(event.broadcaster_user_id),
                    displayName: event.broadcaster_user_name,
                    login: event.broadcaster_user_login,
                },
                cost: event.cost,
                backgroundColor: event.background_color,
                cooldownExpiresAt: event.cooldown_expires_at ? Date.parse(event.cooldown_expires_at) : undefined,
                defaultImage: {
                    url1x: event.default_image.url_1x,
                    url2x: event.default_image.url_2x,
                    url4x: event.default_image.url_4x,
                },
                globalCooldown: {
                    isEnabled: event.global_cooldown.is_enabled,
                    seconds: event.global_cooldown.seconds,
                },
                image: event.image ? {
                    url1x: event.image.url_1x,
                    url2x: event.image.url_2x,
                    url4x: event.image.url_4x,
                } : undefined,
                isEnabled: event.is_enabled,
                isInStock: event.is_in_stock,
                isPaused: event.is_paused,
                isUserInputRequired: event.is_user_input_required,
                maxPerStream: {
                    isEnabled: event.max_per_stream.is_enabled,
                    value: event.max_per_stream.value,
                },
                rewardId: event.id,
                maxPerUserPerStream: {
                    isEnabled: event.max_per_user_per_stream.is_enabled,
                    value: event.max_per_user_per_stream.value,
                },
                prompt: event.prompt,
                title: event.title,
                redemptionsRedeemedCurrentStream: event.redemptions_redeemed_current_stream,
                shouldRedemptionsSkipRequestQueue: event.should_redemptions_skip_request_queue,
            }
        }

        // self.main.pubsubServer.broadcastRaw(JSON.stringify(pubsubMessage))
        self.main.pubsubServer.sendRaw(JSON.stringify(pubsubMessage), pubsubMessage.event.broadcaster.id)
    }

    private channelPointsRedeemRewardHandler(event: IChannelPointsRedeemReward) {
        let self = this
        self.logger.info(`${event.reward.title} redeemed by ${event.user_name} on ${event.broadcaster_user_name}`)

        let pubsubMessage: IChannelPointsRedeemRewardEvent = {
            type: MessageTypes.channelPointsRedeemReward,
            event: {
                broadcaster: {
                    id: parseInt(event.broadcaster_user_id),
                    displayName: event.broadcaster_user_name,
                    login: event.broadcaster_user_login,
                },
                user: {
                    id: parseInt(event.user_id),
                    displayName: event.user_name,
                    login: event.user_login,
                },
                reward: {
                    rewardId: event.reward.id,
                    title: event.reward.title,
                    cost: event.reward.cost,
                    prompt: event.reward.prompt,
                },
                redeemedAt: Date.parse(event.redeemed_at),
                redemptionId: event.id,
                status: event.status,
                userInput: event.user_input,
            }
        }

        // self.main.pubsubServer.broadcastRaw(JSON.stringify(pubsubMessage))
        self.main.pubsubServer.sendRaw(JSON.stringify(pubsubMessage), pubsubMessage.event.broadcaster.id)
    }

    private channelPointsUpdateRedemptionHandler(event: IChannelPointsUpdateRedemption) {
        let self = this
        self.logger.info(`Redemption of ${event.reward.title} by ${event.user_name} has been updated on ${event.broadcaster_user_name}`)

        let pubsubMessage: IChannelPointsUpdateRedemptionEvent = {
            type: MessageTypes.channelPointsUpdateRedemption,
            event: {
                broadcaster: {
                    id: parseInt(event.broadcaster_user_id),
                    displayName: event.broadcaster_user_name,
                    login: event.broadcaster_user_login,
                },
                user: {
                    id: parseInt(event.user_id),
                    displayName: event.user_name,
                    login: event.user_login,
                },
                reward: {
                    rewardId: event.reward.id,
                    title: event.reward.title,
                    cost: event.reward.cost,
                    prompt: event.reward.prompt,
                },
                redeemedAt: Date.parse(event.redeemed_at),
                redemptionId: event.id,
                status: event.status,
                userInput: event.user_input,
            }
        }

        // self.main.pubsubServer.broadcastRaw(JSON.stringify(pubsubMessage))
        self.main.pubsubServer.sendRaw(JSON.stringify(pubsubMessage), pubsubMessage.event.broadcaster.id)
    }

    ///////////////
    /// Utility ///
    ///////////////

    private static getSecret(): string {
        return process.env.EVENTSUB_SECRET ?? ''
    }

    private static getHmacMessage(req: any): string {
        let messageType = req.headers[TWITCH_MESSAGE_ID]
        let messageTimestamp = req.headers[TWITCH_MESSAGE_TIMESTAMP]
        if (messageType && messageTimestamp)
            return (messageType + messageTimestamp + JSON.stringify(req.body))
        return ''
    }

    private static getHmac(secret: string, message: string): string {
        return crypto.createHmac('sha256', secret)
            .update(message)
            .digest('hex')
    }

    private static verifyMessage(hmac: string, verifySignature: string) {
        return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(verifySignature))
    }

    private static getUserData(accessToken: string): Promise<IUserData> {
        return new Promise((resolve, reject) => {
            axios({
                method: 'get',
                url: 'https://api.twitch.tv/helix/users',
                headers: {
                    accept: 'application/json',
                    authorization: `Bearer ${accessToken}`,
                    "client-id": process.env.TWITCH_CLIENT_ID ?? '',
                },
            }).then(response => {
                if (response.data.data.length >= 1) {
                    let userData: IUserData = {
                        email: response.data.data[0].email,
                        userId: parseInt(response.data.data[0].id),
                        displayName: response.data.data[0].display_name,
                        profileImage: response.data.data[0].profile_image_url,
                    }

                    resolve(userData)
                } else {
                    reject('No data received')
                }
            }).catch(err => {
                reject(err)
            })
        })
    }
}