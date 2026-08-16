import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import pool from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;

    console.log("DELETE wishlist:", {
      userId: payload.id,
      productId: id,
    });

    const result = await pool.query(
      `
      DELETE FROM wishlists
      WHERE user_id = $1
      AND product_id = $2
      RETURNING *
      `,
      [payload.id, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบสินค้าใน Wishlist" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "ลบ Wishlist สำเร็จ",
    });
  } catch (error) {
    console.error("DELETE wishlist error:", error);

    return NextResponse.json(
      { message: "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}