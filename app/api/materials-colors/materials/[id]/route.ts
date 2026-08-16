import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// PUT /api/materials-colors/materials/:id
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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

    // =========================
    // 1. ดึงข้อมูลเดิม
    // =========================
    const oldResult = await pool.query(
      `
      SELECT image_url, public_id
      FROM materials
      WHERE id = $1
      `,
      [id],
    );

    if (oldResult.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบวัสดุ" },
        { status: 404 },
      );
    }

    const oldMaterial = oldResult.rows[0];

    const oldPublicId = oldMaterial.public_id || null;
    const newPublicId = public_id || null;

    // =========================
    // 2. ตรวจว่ารูปเปลี่ยนหรือไม่
    // =========================
    const imageChanged =
      oldPublicId !== newPublicId;

    // =========================
    // 3. Update Database
    // =========================
    const result = await pool.query(
      `
      UPDATE materials
      SET
        name = $1,
        description = $2,
        image_url = $3,
        public_id = $4
      WHERE id = $5
      RETURNING *
      `,
      [
        name.trim(),
        description || null,
        image_url || null,
        newPublicId,
        id,
      ],
    );

    // =========================
    // 4. ลบรูปเก่าหลัง DB สำเร็จ
    // =========================
    if (imageChanged && oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId);

        console.log(
          "ลบรูปเก่าจาก Cloudinary สำเร็จ:",
          oldPublicId,
        );
      } catch (cloudError) {
        console.error(
          "ลบรูปเก่าจาก Cloudinary ไม่สำเร็จ:",
          cloudError,
        );
      }
    }

    return NextResponse.json({
      message: "แก้ไขวัสดุสำเร็จ",
      material: result.rows[0],
    });

  } catch (error) {
    console.error("PUT material error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถแก้ไขวัสดุได้" },
      { status: 500 },
    );
  }
}

// DELETE /api/materials-colors/materials/:id
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `
      DELETE FROM materials
      WHERE id = $1
      RETURNING *
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบวัสดุ" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "ลบวัสดุสำเร็จ",
      material: result.rows[0],
    });
  } catch (error) {
    console.error("DELETE material error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถลบวัสดุได้" },
      { status: 500 },
    );
  }
}