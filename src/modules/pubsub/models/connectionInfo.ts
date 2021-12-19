export class ConnectionInfo {
    lastPing: number
    public timeoutInterval?: NodeJS.Timer
    token?: string
    userId?: number
    authenticated: boolean = false

    constructor() {
        this.lastPing = Date.now()
    }

    public setToken(token: string) {
        this.token = token
        this.authenticated = true
    }

    public setUserId(id: number) {
        this.userId = id
        this.authenticated = true
    }
}