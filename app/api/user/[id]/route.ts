import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ดึงผู้ใช้หนึ่งคน
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "ดึงข้อมูลผู้ใช้สำเร็จ",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Database Error" },
      { status: 500 }
    );
  }
}

// อัปเดตผู้ใช้
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    const {
      username,
      email,
      role,
      profile_image,
      profile_image_public_id,
    } = body;

    const result = await pool.query(
      `UPDATE users
       SET username = $1,
           email = $2,
           role = $3,
           profile_image = $4,
           profile_image_public_id = $5
       WHERE id = $6
       RETURNING *`,
      [
        username,
        email,
        role,
        profile_image,
        profile_image_public_id,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "อัปเดตข้อมูลสำเร็จ",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Database Error" },
      { status: 500 }
    );
  }
}

// ปิดการใช้งานผู้ใช้
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { is_active } = await request.json();

    const result = await pool.query(
      `UPDATE users
       SET is_active = $1
       WHERE id = $2
       RETURNING id, username, email, role, is_active`,
      [is_active, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: is_active
        ? "เปิดใช้งานบัญชีสำเร็จ"
        : "ปิดการใช้งานบัญชีสำเร็จ",
      user: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Database Error" },
      { status: 500 }
    );
  }
}