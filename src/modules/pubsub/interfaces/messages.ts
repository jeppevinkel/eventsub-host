export interface IMessage {
    type: string
    nonce?: string
}

export interface IResponse extends IMessage {
    error?: string
}

export interface IAuthentication extends IMessage {
    authToken: string
}

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