export interface Subscription {
    id: string
    status: string
    type: string
    version: string
    cost: number
    condition: object
    transport: {
        method: string
        callback: string
    }
    created_at: string
}