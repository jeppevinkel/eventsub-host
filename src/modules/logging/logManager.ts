import EventEmitter from "events";
import {ILogOptions} from "./interfaces/logOptions";
import {Logger} from "./logger";
import {ILogEntry} from "./interfaces/logEntry";

export class LogManager extends EventEmitter {
    private options: ILogOptions = {
        minLevels: {
            '': 'info'
        }
    }

    private consoleLoggerRegistered: boolean = false

    public configure(options: ILogOptions): LogManager {
        this.options = Object.assign({}, this.options, options)
        return this
    }

    public getLogger(module: string): Logger {
        let minLevel = 'none'
        let match = ''

        for (const key in this.options.minLevels) {
            if (module.startsWith(key) && key.length >= match.length) {
                minLevel = this.options.minLevels[key]
                match = key
            }
        }

        return new Logger(this, module, minLevel)
    }

    public onLogEntry(listener: (logEntry: ILogEntry) => void): LogManager {
        this.on('log', listener)
        return this
    }

    public registerConsoleLogger(): LogManager {
        if (this.consoleLoggerRegistered) return this;

        this.onLogEntry((logEntry) => {
            let d = new Date()
            const msg = `[${logEntry.module}][${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}] ${logEntry.message}`;
            switch (logEntry.level) {
                case 'trace':
                    console.trace(msg);
                    break;
                case 'debug':
                    console.debug('\x1b[36m%s\x1b[0m', logEntry.location + msg);
                    break;
                case 'info':
                    console.info(msg);
                    break;
                case 'warn':
                    console.warn('\x1b[33m%s\x1b[0m', logEntry.location + msg);
                    break;
                case 'error':
                    console.error('\x1b[31m%s\x1b[0m', logEntry.location + msg);
                    break;
                case 'fatal':
                    console.error('\x1b[31m!! %s !!\x1b[0m', logEntry.location + msg);
                    break;
                default:
                    console.log(`{${logEntry.level}} ${msg}`);
            }
        });

        this.consoleLoggerRegistered = true;
        return this;
    }
}