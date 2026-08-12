import { NextResponse } from "next/server";
import pool from "@/lib/db";

//หมวดหมู่ทั้งหมด
export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM categories");
    return NextResponse.json(result.rows);
  } catch (error) { 
    return NextResponse.json(
        { message: "Database Error" },
        { status: 500 }
    );
  }         
}

//เพิ่มหมวดหมู่
export async function POST(request: Request) {
    const body = await request.json();
    const { name, description } = body;
    try {
        const result = await pool.query(
            "INSERT INTO categories (name,description) VALUES ($1, $2)",
            [name, description]
        );
        return NextResponse.json({ message: "หมวดหมู่ถูกเพิ่มสำเร็จ" });
    } catch (error) {
        return NextResponse.json(
            { message: "Database Error" },
            { status: 500 }
        );
    }
}