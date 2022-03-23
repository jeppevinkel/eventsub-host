import dotenv from 'dotenv'
dotenv.config()

import {Logger, Logging, LogManager} from "./modules/logging"
import {PubsubServer} from "./modules/pubsub"
import {WebServer} from "./modules/http"
import {Database} from "./modules/database/database";

const PORT = 666

export class Main {
    public readonly webServer: WebServer
    public readonly pubsubServer: PubsubServer
    public readonly database: Database
    public readonly logManager: LogManager
    private readonly logger: Logger

    constructor(port: number) {
        this.logManager = Logging.configure({
            minLevels: {
                '': 'debug',
                'core': 'trace',
                'pubsub': 'debug',
                'http': 'debug',
                'database': 'debug',
            }
        }).registerConsoleLogger()
        this.logger = this.logManager.getLogger('core')

        const pubsubTimeoutInterval = Number(process.env.PING_INTERVAL ?? -1) * 1000

        this.logger.info(`Starting application using port ${port}...`)
        this.database = new Database(this)
        this.webServer = new WebServer(this, port)
        this.pubsubServer = new PubsubServer(this, port, pubsubTimeoutInterval, this.webServer.server)
    }
}

new Main(PORT)