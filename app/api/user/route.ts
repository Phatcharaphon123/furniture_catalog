import { NextResponse } from "next/server";
import pool from "@/lib/db";

// ผู้ใช้ทั้งหมด
export async function GET() {
  try {
    const result = await pool.query(
      "SELECT * FROM users ORDER BY id ASC"
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { message: "Database Error" },
      { status: 500 }
    );
  }
}

