export interface IChannelPointsAddReward {
    id: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    is_enabled: boolean
    is_paused: boolean
    is_in_stock: boolean
    title: string
    cost: number
    prompt: string
    is_user_input_required: boolean
    should_redemptions_skip_request_queue: boolean
    cooldown_expires_at: string | undefined
    redemptions_redeemed_current_stream: number | undefined
    max_per_stream: {
        is_enabled: boolean
        value: number
    }
    max_per_user_per_stream: {
        is_enabled: boolean
        value: number
    }
    global_cooldown: {
        is_enabled: boolean
        seconds: number
    }
    background_color: string
    image: {
        url_1x: string
        url_2x: string
        url_4x: string
    } | undefined
    default_image: {
        url_1x: string
        url_2x: string
        url_4x: string
    }
}

export interface IChannelPointsUpdateReward {
    id: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    is_enabled: boolean
    is_paused: boolean
    is_in_stock: boolean
    title: string
    cost: number
    prompt: string
    is_user_input_required: boolean
    should_redemptions_skip_request_queue: boolean
    cooldown_expires_at: string | undefined
    redemptions_redeemed_current_stream: number | undefined
    max_per_stream: {
        is_enabled: boolean
        value: number
    }
    max_per_user_per_stream: {
        is_enabled: boolean
        value: number
    }
    global_cooldown: {
        is_enabled: boolean
        seconds: number
    }
    background_color: string
    image: {
        url_1x: string
        url_2x: string
        url_4x: string
    } | undefined
    default_image: {
        url_1x: string
        url_2x: string
        url_4x: string
    }
}

export interface IChannelPointsRemoveReward {
    id: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    is_enabled: boolean
    is_paused: boolean
    is_in_stock: boolean
    title: string
    cost: number
    prompt: string
    is_user_input_required: boolean
    should_redemptions_skip_request_queue: boolean
    cooldown_expires_at: string | undefined
    redemptions_redeemed_current_stream: number | undefined
    max_per_stream: {
        is_enabled: boolean
        value: number
    }
    max_per_user_per_stream: {
        is_enabled: boolean
        value: number
    }
    global_cooldown: {
        is_enabled: boolean
        seconds: number
    }
    background_color: string
    image: {
        url_1x: string
        url_2x: string
        url_4x: string
    } | undefined
    default_image: {
        url_1x: string
        url_2x: string
        url_4x: string
    }
}

export interface IChannelPointsRedeemReward {
    id: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    user_id: string
    user_login: string
    user_name: string
    user_input: string | undefined
    status: string
    reward: {
        id: string
        title: string
        cost: number
        prompt: string
    }
    redeemed_at: string
}

export interface IChannelPointsUpdateRedemption {
    id: string
    broadcaster_user_id: string
    broadcaster_user_login: string
    broadcaster_user_name: string
    user_id: string
    user_login: string
    user_name: string
    user_input: string | undefined
    status: string
    reward: {
        id: string
        title: string
        cost: number
        prompt: string
    }
    redeemed_at: string
}