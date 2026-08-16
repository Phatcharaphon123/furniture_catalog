import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET Colors
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        hex_code,
        created_at,
        image_url,
        public_id
      FROM colors
      ORDER BY id DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET colors error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถโหลดสีได้" },
      { status: 500 }
    );
  }
}

// POST Color
export async function POST(request: Request) {
  try {
    const {
      name,
      hex_code,
      image_url,
      public_id,
    } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "กรุณากรอกชื่อสี" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      INSERT INTO colors (
        name,
        hex_code,
        image_url,
        public_id
      )
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name.trim(),
        hex_code || null,
        image_url || null,
        public_id || null,
      ]
    );

    return NextResponse.json(
      {
        message: "เพิ่มสีสำเร็จ",
        color: result.rows[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST colors error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถเพิ่มสีได้" },
      { status: 500 }
    );
  }
}