import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import pool from "@/lib/db";

// GET
// ดึง Wishlist ของผู้ใช้
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "ไม่ได้เข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    const result = await pool.query(
      `SELECT
        w.id,
        w.product_id,
        p.name,
        p.description,
        p.price,
        pi.image_url,
        w.created_at
      FROM wishlists w
      JOIN products p
        ON w.product_id = p.id
      LEFT JOIN product_images pi
        ON p.id = pi.product_id
        AND pi.is_primary = true
      WHERE w.user_id = $1
      ORDER BY w.created_at DESC`,
      [payload.id]
    );

    return NextResponse.json({
      wishlists: result.rows,
    });

  } catch (error) {
    console.error("GET wishlist error:", error);

    return NextResponse.json(
      { message: "Database Error" },
      { status: 500 }
    );
  }
}

// POST
// เพิ่มสินค้าเข้า Wishlist
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "ไม่ได้เข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ message: "ไม่พบ productId" }, { status: 400 });
    }

    const result = await pool.query(
      `INSERT INTO wishlists (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id)
       DO NOTHING
       RETURNING *`,
      [payload.id, productId],
    );

    return NextResponse.json({
      message: "เพิ่มสินค้าใน Wishlist สำเร็จ",
      wishlist: result.rows[0] || null,
    });
  } catch (error) {
    console.error("POST wishlist error:", error);

    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}

// DELETE
// ลบสินค้าออกจาก Wishlist
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "ไม่ได้เข้าสู่ระบบ" },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);

    const { productId } = await request.json();

    if (!productId) {
      return NextResponse.json({ message: "ไม่พบ productId" }, { status: 400 });
    }

    await pool.query(
      `DELETE FROM wishlists
       WHERE user_id = $1
       AND product_id = $2`,
      [payload.id, productId],
    );

    return NextResponse.json({
      message: "ลบสินค้าออกจาก Wishlist สำเร็จ",
    });
  } catch (error) {
    console.error("DELETE wishlist error:", error);

    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}
