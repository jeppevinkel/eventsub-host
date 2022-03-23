import http from "http";
import * as WebSocket from "websocket";
import {Logger, LogManager} from "../logging";
import {IAuthentication, IMessage, IResponse} from "./interfaces/messages";
import {ErrorTypes} from '../../constants/errors'
import {MessageTypes} from "./constants/messageTypes";
// import * as ping from "./messageHandlers/ping";
import {ConnectionInfo} from "./models/connectionInfo";
import {Main} from "../../index";

export class PubsubServer {
    private readonly httpServer: http.Server
    private readonly wsServer: WebSocket.server
    private readonly logger: Logger
    private readonly main: Main
    private connections: Map<WebSocket.connection, ConnectionInfo> = new Map<WebSocket.connection, ConnectionInfo>()

    public broadcastRaw(message: string) {
        this.connections.forEach((info, connection) => {
            connection.sendUTF(message)
        })
    }

    public sendRaw(message: string, userId: number) {
        this.connections.forEach((info, connection) => {
            if (info.userId == userId) connection.sendUTF(message)
        })
    }

    constructor(main: Main, port: number, pingInterval: number, httpServer?: http.Server) {
        let self = this
        this.main = main
        let logger = main.logManager.getLogger('pubsub')
        this.logger = logger

        if (httpServer) {
            this.httpServer = httpServer
        } else {
            this.httpServer = http.createServer(function (request, response) {
                logger.info(`Received request for ${request.url}`)
                response.writeHead(404, { 'Content-Type': 'text/html' })
                response.end()
            })

            this.httpServer.listen(port, function () {
                logger.info(`Server is listening on port ${port}`)
            })
        }

        this.wsServer = new WebSocket.server({
            httpServer: this.httpServer
        })

        this.wsServer.on('request', function (request) {
            let connection = request.accept(undefined, request.origin)
            let newConnectionInfo = new ConnectionInfo()
            logger.debug(request.httpRequest.headers)

            if (pingInterval > 0) {
                newConnectionInfo.timeoutInterval = setInterval(function () {
                    if (Date.now() - newConnectionInfo.lastPing > pingInterval) {
                        if (newConnectionInfo.timeoutInterval) {
                            clearInterval(newConnectionInfo.timeoutInterval[Symbol.toPrimitive]())
                        }

                        self.connections.delete(connection)
                        connection.close(1000, 'Closed due to no activity')
                    }
                }, 3000)
            }

            self.connections.set(connection, newConnectionInfo)

            logger.info(`Connection accepted from ${connection.remoteAddress}`)

            connection.on('message', function (message) {
                let rawMessage: string
                if (message.type == 'utf8') {
                    rawMessage = message.utf8Data
                }
                else if (message.type == 'binary') {
                    rawMessage = message.binaryData.toString()
                }
                else {
                    return
                }

                logger.debug(`Received ${rawMessage}`)


                let pubsubMessage!: IMessage

                try {
                    pubsubMessage = JSON.parse(rawMessage)
                } catch (e: any) {
                    logger.error(`Failed to parse message: ${rawMessage}`)
                    let response: IResponse = {
                        type: "RESPONSE",
                        error: ErrorTypes.InvalidMessage,
                        message: e.message,
                    }
                    connection.sendUTF(JSON.stringify(response))
                    return
                }

                if (!pubsubMessage.type) {
                    logger.warn('Received invalid json')
                    let response: IResponse = {
                        type: "RESPONSE",
                        nonce: pubsubMessage.nonce,
                        error: ErrorTypes.InvalidMessage,
                        message: "Received invalid data",
                    }
                    connection.sendUTF(JSON.stringify(response))
                    return
                }

                self.handleMessage(pubsubMessage, connection)
                logger.info(pubsubMessage.type)
            })

            connection.on('close', function (reasonCode, description) {
                logger.info(`Peer ${connection.remoteAddress} disconnected`)

                self.connections.delete(connection)
            })
        })
    }

    private handleMessage(message: IMessage, connection: WebSocket.connection) {
        switch (message.type.toUpperCase()) {
            case MessageTypes.ping:
                this.handlePingMessage(message, connection)
                break
            case MessageTypes.authentication:
                this.handleAuthenticationMessage(message as IAuthentication, connection)
                break
            default:
                let response: IResponse = {
                    type: MessageTypes.response,
                    nonce: message.nonce,
                    error: ErrorTypes.InvalidMessage,
                    message: `Unknown message type: ${message.type}`,
                }
                connection.sendUTF(JSON.stringify(response))
                break
        }
    }

    private handlePingMessage(message: IMessage, connection: WebSocket.connection) {
        let info = this.connections.get(connection) as ConnectionInfo

        this.logger.debug(`Received ping from ${connection.remoteAddress}, last ping: ${info.lastPing}`)
        info.lastPing = Date.now()
        let response: IResponse = {
            type: MessageTypes.pong,
            nonce: message.nonce,
        }
        connection.sendUTF(JSON.stringify(response))
    }

    private async handleAuthenticationMessage(message: IAuthentication, connection: WebSocket.connection) {
        let info = this.connections.get(connection) as ConnectionInfo

        let response: IResponse = {
            type: MessageTypes.response,
            nonce: message.nonce,
        }

        if (!message.token) {
            response.error = ErrorTypes.InvalidMessage
            response.message = "Missing token"
            connection.sendUTF(JSON.stringify(response))
            return
        }

        let id = await this.main.database.userDAO.getIdFromToken(message.token)
        if (id) {
            info.setToken(message.token)
            info.setUserId(id)
            response.message = "Authenticated"
        } else {
            response.error = ErrorTypes.InvalidToken
            response.message = "Invalid token"
        }
        connection.sendUTF(JSON.stringify(response))
    }
}