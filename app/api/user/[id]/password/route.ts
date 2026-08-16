import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const body = await request.json();

    const { currentPassword, newPassword, confirmPassword } = body;

    // ตรวจสอบข้อมูล
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบ" },
        { status: 400 },
      );
    }

    // ตรวจสอบความยาวรหัสผ่าน
    if (newPassword.length <= 8) {
      return NextResponse.json(
        { message: "รหัสผ่านต้องมีมากกว่า 8 ตัวอักษร" },
        { status: 400 },
      );
    }

    // ตรวจสอบรหัสใหม่
    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "รหัสผ่านใหม่ไม่ตรงกัน" },
        { status: 400 },
      );
    }

    // ดึง password เดิม
    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "ไม่พบผู้ใช้" }, { status: 404 });
    }

    const user = result.rows[0];

    // ตรวจสอบรหัสผ่านเดิม
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        { message: "รหัสผ่านเดิมไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    // Hash รหัสผ่านใหม่
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // อัปเดตรหัสผ่าน
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      id,
    ]);

    return NextResponse.json({
      message: "เปลี่ยนรหัสผ่านสำเร็จ",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}
