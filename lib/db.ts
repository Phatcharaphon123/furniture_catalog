// ไฟล์: lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ตรวจสอบว่าเชื่อมต่อสำเร็จหรือไม่ (แสดงใน Terminal)
pool.connect((err) => {
  if (err) {
    console.error('Database connection error', err.stack);
  } else {
    console.log('Connected to PostgreSQL successfully!');
  }
});

export default pool;