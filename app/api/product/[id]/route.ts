import { NextResponse } from "next/server";
import pool from "@/lib/db";

// สินค้าแต่ละตัว
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await pool.query(
      `
      SELECT
        products.*,
        categories.name AS category_name,
        COALESCE(
          json_agg(
            product_images.*
            ORDER BY product_images.sort_order
          ) FILTER (WHERE product_images.id IS NOT NULL),
          '[]'
        ) AS images
      FROM products
      JOIN categories
        ON products.category_id = categories.id
      LEFT JOIN product_images
        ON products.id = product_images.product_id
      WHERE products.id = $1
        AND products.is_active = TRUE
      GROUP BY products.id, categories.name
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบสินค้า" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Database Error" },
      { status: 500 }
    );
  }
}

// แก้ไขสินค้า
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();

  const {
    name,
    description,
    price,
    stock,
    category_id,
  } = body;

  try {
    const result = await pool.query(
      `
      UPDATE products
      SET
        name = $1,
        description = $2,
        price = $3,
        stock = $4,
        category_id = $5
      WHERE id = $6
      RETURNING *
      `,
      [
        name,
        description,
        price,
        stock,
        category_id,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบสินค้า" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "อัปเดตข้อมูลสำเร็จ",
      product: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Database Error" },
      { status: 500 },
    );
  }
}

//ลบสินค้า
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const result = await pool.query(
      `
      UPDATE products
      SET is_active = FALSE
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "ไม่พบสินค้า" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "ลบสินค้าสำเร็จ",
      product: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: "Database Error" },
      { status: 500 }
    );
  }
}