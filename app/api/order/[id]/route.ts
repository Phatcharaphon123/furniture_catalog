import { NextResponse } from "next/server";
import pool from "@/lib/db";

//รายการสั่งซื้อหนึ่งรายการ
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const result = await pool.query(
      `
    SELECT
        o.id AS order_id,
        o.status,
        o.total_price,
        u.username,
        u.email,
        p.name AS product_name,
        oi.quantity,
        oi.price
    FROM orders o
    JOIN users u ON o.user_id = u.id
    JOIN order_items oi ON o.id = oi.order_id
    JOIN products p ON oi.product_id = p.id
    WHERE o.id = $1;
  `,
      [id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบรายการสั่งซื้อ" },
        { status: 404 },
      );
    }

    // จัดรูปข้อมูล
    const order = {
      order_id: result.rows[0].order_id,
      status: result.rows[0].status,
      total_price: result.rows[0].total_price,
      username: result.rows[0].username,
      email: result.rows[0].email,
      items: result.rows.map((item) => ({
        product_name: item.product_name,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}

//แก้ไขรายการสั่งซื้อ
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const { user_id, total_price, status } = body;
  try {
    const result = await pool.query(
      "UPDATE orders SET user_id = $1, total_price = $2, status = $3 WHERE id = $4 RETURNING *",
      [user_id, total_price, status, id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบรายการสั่งซื้อ" },
        { status: 404 },
      );
    }
    return NextResponse.json({
      message: "แก้ไขรายการสั่งซื้อสำเร็จ",
      order: result.rows[0],
    });
  } catch (error) {
    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}
