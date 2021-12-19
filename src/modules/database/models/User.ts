import mysql, {Pool, RowDataPacket, OkPacket} from 'mysql2/promise'


export interface UserModel {
    id: number,
    displayName: string
    profileImage: string
    email: string
    apiToken: string | null
}

export class UserDAO {
    private readonly pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    public async getUser(id: number): Promise<UserModel | undefined> {
        const [rows] = await this.pool.execute<RowDataPacket[]>(
            'SELECT * FROM `users` WHERE `id` = ?',
            [id])

        return rows[0] ? {
            id: rows[0]['id'],
            displayName: rows[0]['display_name'],
            email: rows[0]['email'],
            profileImage: rows[0]['profile_image'],
            apiToken: rows[0]['api_token']
        } : undefined
    }

    public async getUsers(): Promise<UserModel[]> {
        const [rows] = await this.pool.execute<RowDataPacket[]>(
            'SELECT * FROM `users`',
            [])

        return rows.map<UserModel>((row) => {
            return {
                id: row['id'],
                email: row['email'],
                profileImage: row['profile_image'],
                apiToken: row['api_token'],
                displayName: row['display_name']
            }
        })
    }

    public async insertUser(user: UserModel): Promise<OkPacket> {
        const [result] = await this.pool.query<OkPacket>(
            'INSERT INTO `users` (id, display_name, profile_image, email, api_token) VALUES (?, ?, ?, ?, ?)',
            [user.id, user.displayName, user.profileImage, user.email, user.apiToken]
        )
        return result
    }

    public async updateUser(user: UserModel) {
        const [result] = await this.pool.execute(
            'UPDATE `users` SET display_name = ?, profile_image = ?, email = ?, api_token = ?',
            [user.displayName, user.profileImage, user.email, user.apiToken]
        )
    }

    public async getIdFromToken(token: string): Promise<number> {
        const [rows] = await this.pool.execute<RowDataPacket[]>(
            'SELECT id FROM `users` WHERE `api_token` = ?',
            [token])

        return rows[0] ? rows[0]['id'] : undefined
    }

    public async exists(id: number): Promise<boolean> {
        const [result] = await this.pool.execute<OkPacket[]>(
            'SELECT 1 FROM `users` WHERE id = ?',
            [id]
        )
        return result != undefined && result.length > 0
    }
}