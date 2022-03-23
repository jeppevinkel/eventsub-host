import mysql, {Pool, RowDataPacket, OkPacket} from 'mysql2/promise'


export interface UserModel {
    id: number,
    displayName: string
    profileImage: string
    email: string
    apiToken?: string
}

export class UserDAO {
    private readonly pool: Pool

    constructor(pool: Pool) {
        this.pool = pool
    }

    public async getUser(id: number): Promise<UserModel | undefined> {
        const [rows] = await this.pool.execute<RowDataPacket[]>(
            'SELECT `id`, `display_name`, `profile_image`, `email` FROM `users` WHERE `id` = ?',
            [id])

        return rows[0] ? {
            id: rows[0]['id'],
            displayName: rows[0]['display_name'],
            email: rows[0]['email'],
            profileImage: rows[0]['profile_image'],
        } : undefined
    }

    public async getUsers(): Promise<UserModel[]> {
        const [rows] = await this.pool.execute<RowDataPacket[]>(
            'SELECT `id`, `display_name`, `profile_image`, `email` FROM `users`',
            [])

        return rows.map<UserModel>((row) => {
            return {
                id: row['id'],
                email: row['email'],
                profileImage: row['profile_image'],
                displayName: row['display_name']
            }
        })
    }

    public async insertUser(user: UserModel): Promise<OkPacket> {
        const [result] = await this.pool.query<OkPacket>(
            'INSERT INTO `users` (id, display_name, profile_image, email) VALUES (?, ?, ?, ?)',
            [user.id, user.displayName, user.profileImage, user.email]
        )
        return result
    }

    public async updateUser(user: UserModel) {
        const [result] = await this.pool.execute(
            'UPDATE `users` SET display_name = ?, profile_image = ?, email = ?',
            [user.displayName, user.profileImage, user.email]
        )
        return result
    }

    public async updateUserApiToken(user: UserModel, apiToken: string): Promise<boolean> {
        try {
            const [result] = await this.pool.query<OkPacket>(
                'UPDATE `users` SET api_token = ? WHERE id = ?',
                [apiToken, user.id]
            )
            return true
        } catch (e) {
            return false
        }
    }

    public async getIdFromToken(token: string): Promise<number|undefined> {
        if (token === undefined) {
            return undefined
        }

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