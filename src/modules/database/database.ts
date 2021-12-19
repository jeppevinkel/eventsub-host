import {UserDAO} from "./models/User";
import mysql, {Pool} from "mysql2/promise";
import {Logger} from "../logging";
import {Main} from "../../index";

export class Database {
    public readonly userDAO: UserDAO
    private readonly logger: Logger
    private readonly main: Main

    public readonly pool: Pool = mysql.createPool({
        host: process.env.MYSQL_HOST,
        database: process.env.MYSQL_DATABASE,
        user: process.env.MYSQL_USERNAME,
        password: process.env.MYSQL_PASSWORD
    })

    constructor(main: Main) {
        let self = this
        this.main = main
        this.logger = main.logManager.getLogger('database')

        this.pool.getConnection().then(function(connection) {
            connection.release()
            self.logger.info('Connected to database')
        }).catch(function(err) {
            self.logger.error('Could not connect to database')
            self.logger.error(err)
        })

        this.userDAO = new UserDAO(this.pool)
    }
}