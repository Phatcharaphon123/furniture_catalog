import { NextResponse } from "next/server";
import pool from "@/lib/db";

//รายการสั่งซื้อทั้งหมด
export async function GET() {
    try {
        const result = await pool.query("SELECT * FROM order_items");
        return NextResponse.json(result.rows);
    } catch (error) {
        return NextResponse.json(
            { message: "Database Error" },
            { status: 500 }
        );
    }   
}

//เพิ่มรายการสั่งซื้อ
export async function POST(request: Request) {
  const body = await request.json();
  const { order_id, product_id, quantity, price } = body;
    try {
        const result = await pool.query(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *",
            [order_id, product_id, quantity, price]
        );
        return NextResponse.json({
            message: "เพิ่มรายการสั่งซื้อสำเร็จ",
            order: result.rows[0],
        });
    } catch (error) {       
        return NextResponse.json(
            { message: "Database Error" },
            { status: 500 }
        );
    }
}