import { NextResponse } from "next/server";
import pool from "@/lib/db";

// สินค้าทั้งหมด
export async function GET() {
  try {
    const result = await pool.query(`
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
  WHERE products.is_active = TRUE
  GROUP BY products.id, categories.name;
`);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.log(error);

    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}
// เพิ่มสินค้า
export async function POST(request: Request) {
  const body = await request.json();

  const { name, description, price, stock, category_id, images } = body;

  // Validation
  if (!name?.trim()) {
    return NextResponse.json(
      { message: "กรุณากรอกชื่อสินค้า" },
      { status: 400 },
    );
  }

  if (!price || Number(price) <= 0) {
    return NextResponse.json({ message: "ราคาต้องมากกว่า 0" }, { status: 400 });
  }

  if (stock == null || Number(stock) < 0) {
    return NextResponse.json(
      { message: "จำนวนสินค้าต้องไม่น้อยกว่า 0" },
      { status: 400 },
    );
  }

  if (!category_id) {
    return NextResponse.json(
      { message: "กรุณาเลือกหมวดหมู่" },
      { status: 400 },
    );
  }

  if (images && !Array.isArray(images)) {
    return NextResponse.json({ message: "รูปภาพไม่ถูกต้อง" }, { status: 400 });
  }
  try {
    // 1. เพิ่มสินค้า
    const productResult = await pool.query(
      `
      INSERT INTO products
      (name, description, price, stock, category_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [name, description, price, stock, category_id],
    );

    const product = productResult.rows[0];

    // 2. เพิ่มรูปภาพ
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        await pool.query(
          `
          INSERT INTO product_images
          (product_id, image_url, public_id, is_primary, sort_order)
          VALUES ($1, $2, $3, $4, $5)
          `,
          [product.id, image.image_url, image.public_id, i === 0, i],
        );
      }
    }

    return NextResponse.json({
      message: "เพิ่มสินค้าสำเร็จ",
      product,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}
