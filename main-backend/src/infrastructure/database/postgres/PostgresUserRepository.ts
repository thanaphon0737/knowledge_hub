import { IUserRepository } from "../../../application/repositories/IUserRepository";
import { User } from "../../../domain/entities/user.entity";
import { pool } from "../db"; // Import the connection pool

// คลาสนี้คือการ implement IUserRepository สำหรับ PostgreSQL โดยเฉพาะ
export class PostgresUserRepository implements IUserRepository {

    /**
     * ค้นหาผู้ใช้ด้วยอีเมล
     * @param email - อีเมลของผู้ใช้ที่ต้องการค้นหา
     * @returns ข้อมูล User ถ้าเจอ, หรือ null ถ้าไม่เจอ
     */
    async findByEmail(email: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE email = $1';
        try {
            const result = await pool.query(query, [email]);
            if (result.rows.length === 0) {
                return null; // ไม่พบผู้ใช้
            }
            // คืนค่าข้อมูลผู้ใช้แถวแรกที่เจอ
            return result.rows[0];
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw new Error('Database error while finding user by email');
        }
    }
    /**
     * ค้นหาผู้ใช้ด้วย ID
     * @param id - ID ของผู้ใช้ที่ต้องการค้นหา
     * @returns ข้อมูล User ถ้าเจอ, หรือ null ถ้าไม่เจอ
     */
    async findById(id: string): Promise<User | null> {
        const query = 'SELECT * FROM users WHERE id = $1';
        try {
            const result = await pool.query(query, [id]);
            if (result.rows.length === 0) {
                return null; // ไม่พบผู้ใช้
            }
            // คืนค่าข้อมูลผู้ใช้แถวแรกที่เจอ
            return result.rows[0];
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw new Error('Database error while finding user by ID');
        }
    }

    /**
     * บันทึกข้อมูลผู้ใช้ใหม่ลงในฐานข้อมูล
     * @param user - User object ที่ต้องการบันทึก
     * @returns ข้อมูล User ที่ถูกบันทึกเรียบร้อยแล้ว
     */
    async save(user: User): Promise<User> {
        const { id, email, password_hash, created_at, updated_at } = user;
        const query = `
            INSERT INTO users (id, email, password_hash, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *; 
        `; // RETURNING * จะส่งค่าที่เพิ่ง insert กลับมาทั้งหมด

        const values = [id, email, password_hash, created_at, updated_at];

        try {
            const result = await pool.query(query, values);
            // คืนค่าข้อมูลผู้ใช้ที่เพิ่งถูกสร้าง
            return result.rows[0];
        } catch (error) {
            console.error('Error saving user:', error);
            throw new Error('Database error while saving user');
        }
    }
}
