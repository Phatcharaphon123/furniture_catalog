import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import pool from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// PUT - แก้ไขสี
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

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบสีที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

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


// DELETE - ลบสี
export async function DELETE(
  request: Request,
  { params }: Params
) {
  const { id } = await params;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. ดึงข้อมูลสีก่อนลบ
    const colorResult = await client.query(
      `
      SELECT
        id,
        name,
        image_url,
        public_id
      FROM colors
      WHERE id = $1
      `,
      [id]
    );

    if (colorResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json(
        { message: "ไม่พบสีที่ต้องการลบ" },
        { status: 404 }
      );
    }

    const color = colorResult.rows[0];

    // 2. ลบรูปจาก Cloudinary
    if (color.public_id) {
      const cloudinaryResult =
        await cloudinary.uploader.destroy(
          color.public_id
        );

      console.log(
        "Cloudinary delete:",
        cloudinaryResult
      );

      if (
        cloudinaryResult.result !== "ok" &&
        cloudinaryResult.result !== "not found"
      ) {
        await client.query("ROLLBACK");

        return NextResponse.json(
          {
            message:
              "ไม่สามารถลบรูปจาก Cloudinary ได้",
          },
          { status: 500 }
        );
      }
    }

    // 3. ลบข้อมูลสีจาก Database
    await client.query(
      `
      DELETE FROM colors
      WHERE id = $1
      `,
      [id]
    );

    // 4. Commit
    await client.query("COMMIT");

    return NextResponse.json({
      message: "ลบสีและรูปสำเร็จ",
    });

  } catch (error) {
    await client.query("ROLLBACK");

    console.error("DELETE color error:", error);

    return NextResponse.json(
      { message: "ไม่สามารถลบสีได้" },
      { status: 500 }
    );

  } finally {
    client.release();
  }
}