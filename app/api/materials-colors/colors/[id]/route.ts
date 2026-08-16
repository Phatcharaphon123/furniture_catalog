import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface Params {
  params: Promise<{ id: string }>;
}

export async function PUT(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

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

    // 1. ดึงข้อมูลเดิมก่อน
    const oldResult = await pool.query(
      `
      SELECT image_url, public_id
      FROM colors
      WHERE id = $1
      `,
      [id]
    );

    if (oldResult.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบสีที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    const oldColor = oldResult.rows[0];

    // 2. ถ้ามีการเปลี่ยนรูป
    const imageChanged =
      oldColor.public_id &&
      oldColor.public_id !== public_id;

    // 3. ลบรูปเก่าจาก Cloudinary
    if (imageChanged) {
      try {
        await cloudinary.uploader.destroy(oldColor.public_id);
      } catch (cloudError) {
        console.error(
          "Delete old Cloudinary image error:",
          cloudError
        );
      }
    }

    // 4. Update Database
    const result = await pool.query(
      `
      UPDATE colors
      SET
        name = $1,
        hex_code = $2,
        image_url = $3,
        public_id = $4
      WHERE id = $5
      RETURNING *
      `,
      [
        name.trim(),
        hex_code || null,
        image_url || null,
        public_id || null,
        id,
      ]
    );

    return NextResponse.json({
      message: "แก้ไขสีสำเร็จ",
      color: result.rows[0],
    });

  } catch (error) {
    console.error("PUT color error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถแก้ไขสีได้" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: Params
) {
  try {
    const { id } = await params;

    // ดึง public_id ก่อนลบ
    const oldResult = await pool.query(
      `
      SELECT public_id
      FROM colors
      WHERE id = $1
      `,
      [id]
    );

    if (oldResult.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบสีที่ต้องการลบ" },
        { status: 404 }
      );
    }

    const publicId = oldResult.rows[0].public_id;

    // ลบจาก Cloudinary
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudError) {
        console.error(
          "Delete Cloudinary image error:",
          cloudError
        );
      }
    }

    // ลบจาก DB
    await pool.query(
      `
      DELETE FROM colors
      WHERE id = $1
      `,
      [id]
    );

    return NextResponse.json({
      message: "ลบสีสำเร็จ",
    });

  } catch (error) {
    console.error("DELETE color error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถลบสีได้" },
      { status: 500 }
    );
  }
}