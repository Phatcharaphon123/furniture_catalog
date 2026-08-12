import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import pool from "@/lib/db";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const { image_url, public_id, is_primary, sort_order } =
      await request.json();

    if (!image_url || !public_id) {
      return NextResponse.json(
        { message: "ข้อมูลรูปไม่ครบ" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `
      INSERT INTO product_images
      (product_id, image_url, public_id, is_primary, sort_order)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        id,
        image_url,
        public_id,
        is_primary ?? false,
        sort_order ?? 0,
      ],
    );

    return NextResponse.json({
      message: "เพิ่มรูปสินค้าแล้ว",
      image: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Database Error" },
      { status: 500 },
    );
  }
}

// ลบรูปสินค้า
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    // 1. หา image จาก Database
    const result = await pool.query(
      `SELECT * FROM product_images WHERE id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบรูปภาพ" },
        { status: 404 },
      );
    }

    const image = result.rows[0];

    // 2. ลบรูปจาก Cloudinary
    await cloudinary.uploader.destroy(image.public_id);

    // 3. ลบข้อมูลจาก Database
    await pool.query(
      `DELETE FROM product_images WHERE id = $1`,
      [id],
    );

    return NextResponse.json({
      message: "ลบรูปสำเร็จ",
    });
  } catch (error) {
    console.error("Delete Product Image Error:", error);

    return NextResponse.json(
      { message: "ลบรูปไม่สำเร็จ" },
      { status: 500 },
    );
  }
}