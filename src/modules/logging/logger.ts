import EventEmitter from "events";
import {ILogEntry} from "./interfaces/logEntry"

export class Logger {
    private logManager: EventEmitter
    private minLevel: number
    private module: string
    private readonly levels: { [key: string]: number } = {
        'trace': 1,
        'debug': 2,
        'info': 3,
        'warn': 4,
        'error': 5,
        'fatal': 6,
    }

    constructor(logManager: EventEmitter, module: string, minLevel: string) {
        this.logManager = logManager
        this.module = module
        this.minLevel = this.levelToInt(minLevel)
    }

    /**
     * Converts a string level (trace/debug/info/warn/error) into a number
     *
     * @param minLevel
     */
    private levelToInt(minLevel: string): number {
        if (minLevel.toLowerCase() in this.levels)
            return this.levels[minLevel.toLowerCase()];
        else
            return 99;
    }

    /**
     * Central logging method.
     * @param logLevel
     * @param message
     */
    public log(logLevel: string, message: string): void {
        const level = this.levelToInt(logLevel);
        if (level < this.minLevel) return;

        const logEntry: ILogEntry = { level: logLevel, module: this.module, message };

        // Obtain the line/file through a thoroughly hacky method
        // This creates a new stack trace and pulls the caller from it.  If the caller
        // if .trace()
        const error = new Error("");
        if (error.stack) {
            const cla = error.stack.split("\n");
            let idx = 1;
            while (idx < cla.length && cla[idx].includes("at Logger.")) idx++;
            if (idx < cla.length) {
                logEntry.location = cla[idx].slice(cla[idx].indexOf("at ") + 3, cla[idx].length);
            }
        }

        this.logManager.emit('log', logEntry);
    }

    public trace(message: any): void { this.log('trace', typeof message == "object" ? JSON.stringify(message) : String(message)); }
    public debug(message: any): void { this.log('debug', typeof message == "object" ? JSON.stringify(message) : String(message)); }
    public info(message: any): void  { this.log('info', typeof message == "object" ? JSON.stringify(message) : String(message)); }
    public warn(message: any): void  { this.log('warn', typeof message == "object" ? JSON.stringify(message) : String(message)); }
    public error(message: any): void { this.log('error', typeof message == "object" ? JSON.stringify(message) : String(message)); }
    public fatal(message: any): void { this.log('fatal', typeof message == "object" ? JSON.stringify(message) : String(message)); }
}