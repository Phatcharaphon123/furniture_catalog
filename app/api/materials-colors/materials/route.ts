import { NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/materials-colors/materials
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        name,
        description,
        image_url,
        public_id,
        created_at
      FROM materials
      ORDER BY id DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET materials error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถโหลดข้อมูลวัสดุได้" },
      { status: 500 },
    );
  }
}

// POST /api/materials-colors/materials
export async function POST(request: Request) {
  try {
    const {
      name,
      description,
      image_url,
      public_id,
    } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "กรุณากรอกชื่อวัสดุ" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `
      INSERT INTO materials
        (name, description, image_url, public_id)
      VALUES
        ($1, $2, $3, $4)
      RETURNING *
      `,
      [
        name.trim(),
        description || null,
        image_url || null,
        public_id || null,
      ],
    );

    return NextResponse.json(
      {
        message: "เพิ่มวัสดุสำเร็จ",
        material: result.rows[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST materials error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถเพิ่มวัสดุได้" },
      { status: 500 },
    );
  }
}