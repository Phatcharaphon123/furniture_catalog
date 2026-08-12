import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

// เพิ่มผู้ใช้ //register
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // 1. ตรวจสอบข้อมูลว่าง
    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 },
      );
    }

    // 2. ตัดช่องว่าง
    const userName = username.trim();
    const userEmail = email.trim().toLowerCase();
    const userPassword = password.trim();

    // 3. ตรวจสอบความยาวชื่อ
    if (userName.length < 6) {
      return NextResponse.json(
        { message: "ชื่อต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 },
      );
    }

    // 4. ตรวจสอบรูปแบบ Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(userEmail)) {
      return NextResponse.json(
        { message: "รูปแบบอีเมลไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    // 5. ตรวจสอบความยาว Password
    if (userPassword.length < 8) {
      return NextResponse.json(
        { message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" },
        { status: 400 },
      );
    }

    // 6. ตรวจสอบ Email ซ้ำ
    const checkUser = await pool.query("SELECT * FROM users WHERE email = $1", [
      userEmail,
    ]);

    if (checkUser.rows.length > 0) {
      return NextResponse.json(
        { message: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 },
      );
    }

    // 7. เข้ารหัส Password
    const hashedPassword = await bcrypt.hash(userPassword, 10);

    // 8. เพิ่มข้อมูล
    const result = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [userName, userEmail, hashedPassword, "user"],
    );

    // 9. ส่งผลลัพธ์กลับ
    return NextResponse.json(
      {
        message: "เพิ่มผู้ใช้สำเร็จ",
        user: result.rows[0]
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}
