import { NextResponse } from "next/server";
import pool from "@/lib/db";

//เลือกหมวดหมู่เดียว
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await pool.query(
      "SELECT * FROM categories WHERE id = $1",
      [id]
    );  
    return NextResponse.json({message: "เลือกหมวดหมู่สำเร็จ"});
  } catch (error) {
    return NextResponse.json(
      { message: "Database Error" },
      { status: 500 }
    );
  }
}

//แก้ไขหมวดหมู่
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> } 
){
    const { id } = await params;
    const body = await request.json();
    const { name, description } = body;
    try {
        const result = await pool.query(
            "UPDATE categories SET name = $1, description = $2 WHERE id = $3",
            [name, description, id]
        );
        return NextResponse.json({message: "อัปเดตข้อมูลสำเร็จ"});
    } catch (error) {
        return NextResponse.json(
            { message: "Database Error" },
            { status: 500 }
        );
    }
}

//ลบหมวดหมู่
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // เช็กว่ามีสินค้าในหมวดหมู่นี้หรือไม่
    const productResult = await pool.query(
      "SELECT * FROM products WHERE category_id = $1",
      [id]
    );
    if (productResult.rows.length > 0) {
      return NextResponse.json(
        { message: "ไม่สามารถลบหมวดหมู่ได้เนื่องจากมีสินค้าในหมวดหมู่นี้" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "DELETE FROM categories WHERE id = $1",
      [id]
    );
    return NextResponse.json({ message: "หมวดหมู่ถูกลบสำเร็จ" });
  } catch (error) {
    return NextResponse.json(
      { message: "Database Error" },
      { status: 500 }
    );
  }
}
