export interface ILogEntry {
    level: string
    module: string
    location?: string
    message: string
}