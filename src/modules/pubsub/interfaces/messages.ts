export interface IMessage {
    type: string
    nonce?: string
}

export interface IResponse extends IMessage {
    error?: string
    message?: string
}

export interface IAuthentication extends IMessage {
    token: string
}

/**
 * Event fired when the channel gets a new follower.
 *
 * @title Follow Event
 * @property type 'CHANNEL.FOLLOW'
 */
export interface IFollowEvent extends IMessage {
    event: {
        user: {
            id: number
            login: string
            displayName: string
        }
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        followedAt: number
    }
}

/**
 * Event fired when a user is banned from the channel.
 *
 * @title Channel Ban Event
 * @property type 'CHANNEL.BAN'
 */
export interface IChannelBanEvent extends IMessage {
    event: {
        user: {
            id: number
            login: string
            displayName: string
        }
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        moderator: {
            id: number
            login: string
            displayName: string
        }
        reason: string
        endsAt: number
        isPermanent: boolean
    }
}

export interface IChannelUnbanEvent extends IMessage {
    event: {
        user: {
            id: number
            login: string
            displayName: string
        }
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        moderator: {
            id: number
            login: string
            displayName: string
        }
    }
}

/**
 * Event fired when a reward is added to the channel.
 *
 * @title Channel Points Add Reward Event
 * @property type 'CHANNEL.REWARD.ADD'
 */
export interface IChannelPointsAddRewardEvent extends IMessage {
    event: {
        rewardId: string
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        isEnabled: boolean
        isPaused: boolean
        isInStock: boolean
        title: string
        cost: number
        prompt: string
        isUserInputRequired: boolean
        shouldRedemptionsSkipRequestQueue: boolean
        cooldownExpiresAt: number|undefined
        redemptionsRedeemedCurrentStream: number|undefined
        maxPerStream: {
            isEnabled: boolean
            value: number
        }
        maxPerUserPerStream: {
            isEnabled: boolean
            value: number
        }
        globalCooldown: {
            isEnabled: boolean
            seconds: number
        }
        backgroundColor: string
        image: {
            url1x: string
            url2x: string
            url4x: string
        } | undefined
        defaultImage: {
            url1x: string
            url2x: string
            url4x: string
        }
    }
}

/**
 * Event fired when a reward is updated on the channel.
 *
 * @title Channel Points Update Reward Event
 * @property type 'CHANNEL.REWARD.UPDATE'
 */
export interface IChannelPointsUpdateRewardEvent extends IMessage {
    event: {
        rewardId: string
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        isEnabled: boolean
        isPaused: boolean
        isInStock: boolean
        title: string
        cost: number
        prompt: string
        isUserInputRequired: boolean
        shouldRedemptionsSkipRequestQueue: boolean
        cooldownExpiresAt: number|undefined
        redemptionsRedeemedCurrentStream: number|undefined
        maxPerStream: {
            isEnabled: boolean
            value: number
        }
        maxPerUserPerStream: {
            isEnabled: boolean
            value: number
        }
        globalCooldown: {
            isEnabled: boolean
            seconds: number
        }
        backgroundColor: string
        image: {
            url1x: string
            url2x: string
            url4x: string
        } | undefined
        defaultImage: {
            url1x: string
            url2x: string
            url4x: string
        }
    }
}

/**
 * Event fired when a reward is removed from the channel.
 *
 * @title Channel Points Remove Reward Event
 * @property type 'CHANNEL.REWARD.REMOVE'
 */
export interface IChannelPointsRemoveRewardEvent extends IMessage {
    event: {
        rewardId: string
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        isEnabled: boolean
        isPaused: boolean
        isInStock: boolean
        title: string
        cost: number
        prompt: string
        isUserInputRequired: boolean
        shouldRedemptionsSkipRequestQueue: boolean
        cooldownExpiresAt: number|undefined
        redemptionsRedeemedCurrentStream: number|undefined
        maxPerStream: {
            isEnabled: boolean
            value: number
        }
        maxPerUserPerStream: {
            isEnabled: boolean
            value: number
        }
        globalCooldown: {
            isEnabled: boolean
            seconds: number
        }
        backgroundColor: string
        image: {
            url1x: string
            url2x: string
            url4x: string
        } | undefined
        defaultImage: {
            url1x: string
            url2x: string
            url4x: string
        }
    }
}

/**
 * Event fired when a reward is redeemed on the channel.
 *
 * @title Channel Points Redeem Reward Event
 * @property type 'CHANNEL.REWARD.REDEMPTION.ADD'
 */
export interface IChannelPointsRedeemRewardEvent extends IMessage {
    event: {
        redemptionId: string
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        user: {
            id: number
            login: string
            displayName: string
        }
        userInput: string | undefined
        status: string
        reward: {
            rewardId: string
            title: string
            cost: number
            prompt: string
        }
        redeemedAt: number
    }
}

/**
 * Event fired when a reward redemption is updated on the channel.
 *
 * @title Channel Points Update Redemption Event
 * @property type 'CHANNEL.REWARD.REDEMPTION.UPDATE'
 */
export interface IChannelPointsUpdateRedemptionEvent extends IMessage {
    event: {
        redemptionId: string
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        user: {
            id: number
            login: string
            displayName: string
        }
        userInput: string | undefined
        status: string
        reward: {
            rewardId: string
            title: string
            cost: number
            prompt: string
        }
        redeemedAt: number
    }
}

export interface IChannelUpdateEvent extends IMessage {
    event: {
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        title: string
        language: string
        category: {
            id: string
            name: string
        }
        isMature: boolean
    }
}

export interface IChannelCheerEvent extends IMessage {
    event: {
        isAnonymous: boolean
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        user: {
            id: number
            login: string
            displayName: string
        } | undefined
        message: string
        bits: number
    }
}

export interface IChannelGoalBeginEvent extends IMessage {
    event: {
        id: string
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        type: string
        description: string
        currentAmount: number
        targetAmount: number
        startedAt: number
    }
}

export interface IChannelGoalProgressEvent extends IMessage {
    event: {
        id: string
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        type: string
        description: string
        currentAmount: number
        targetAmount: number
        startedAt: number
    }
}

export interface IChannelGoalEndEvent extends IMessage {
    event: {
        id: string
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        type: string
        description: string
        isAchieved: boolean
        currentAmount: number
        targetAmount: number
        startedAt: number
        endedAt: number
    }
}

export interface IChannelHypeTrainBeginEvent extends IMessage {
    event: {
        id: string
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        total: number
        progress: number
        goal: number
        topContributions: {
            user: {
                id: number
                login: string
                displayName: string
            }
            type: string
            total: number
        }[]
        lastContribution: {
            user: {
                id: number
                login: string
                displayName: string
            }
            type: string
            total: number
        }
        startedAt: number
        expiresAt: number
    }
}

export interface IChannelHypeTrainProgressEvent extends IMessage {
    event: {
        id: string
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        level: number
        total: number
        progress: number
        goal: number
        topContributions: {
            user: {
                id: number
                login: string
                displayName: string
            }
            type: string
            total: number
        }[]
        lastContribution: {
            user: {
                id: number
                login: string
                displayName: string
            }
            type: string
            total: number
        }
        startedAt: number
        expiresAt: number
    }
}

export interface IChannelHypeTrainEndEvent extends IMessage {
    event: {
        id: string
        broadcaster: {
            id: number
            login: string
            displayName: string
        }
        level: number
        total: number
        topContributions: {
            user: {
                id: number
                login: string
                displayName: string
            }
            type: string
            total: number
        }[]
        startedAt: number
        expiresAt: number
        cooldownEndsAt: number
    }
}