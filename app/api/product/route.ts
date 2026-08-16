import { NextResponse } from "next/server";
import pool from "@/lib/db";

// สินค้าทั้งหมด
export async function GET() {
  try {
    const result = await pool.query(`
      SELECT
        products.*,
        categories.name AS category_name,

        -- Images
        COALESCE(
          (
            SELECT json_agg(
              pi.*
              ORDER BY pi.sort_order
            )
            FROM product_images pi
            WHERE pi.product_id = products.id
          ),
          '[]'
        ) AS images,

        -- Colors
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', c.id,
                'name', c.name,
                'hex_code', c.hex_code,
                'image_url', c.image_url,
                'price', pc.price
              )
              ORDER BY c.name
            )
            FROM product_colors pc
            JOIN colors c
              ON c.id = pc.color_id
            WHERE pc.product_id = products.id
          ),
          '[]'
        ) AS colors,

        -- Materials
        COALESCE(
          (
            SELECT json_agg(
              json_build_object(
                'id', m.id,
                'name', m.name,
                'image_url', m.image_url,
                'price', pm.price
              )
              ORDER BY m.name
            )
            FROM product_materials pm
            JOIN materials m
              ON m.id = pm.material_id
            WHERE pm.product_id = products.id
          ),
          '[]'
        ) AS materials

      FROM products

      JOIN categories
        ON products.category_id = categories.id

      WHERE products.is_active = TRUE

      ORDER BY products.id DESC;
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}

// เพิ่มสินค้า
export async function POST(request: Request) {
  const body = await request.json();

  const { name, description, price, category_id, images, colors, materials } =
    body;

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

  if (!category_id) {
    return NextResponse.json(
      { message: "กรุณาเลือกหมวดหมู่" },
      { status: 400 },
    );
  }

  if (images && !Array.isArray(images)) {
    return NextResponse.json({ message: "รูปภาพไม่ถูกต้อง" }, { status: 400 });
  }

  if (colors && !Array.isArray(colors)) {
    return NextResponse.json({ message: "สีไม่ถูกต้อง" }, { status: 400 });
  }

  if (materials && !Array.isArray(materials)) {
    return NextResponse.json({ message: "วัสดุไม่ถูกต้อง" }, { status: 400 });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. เพิ่มสินค้า
    const productResult = await client.query(
      `
      INSERT INTO products
      (name, description, price, category_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [name, description, price, category_id],
    );

    const product = productResult.rows[0];

    // 2. เพิ่มรูปภาพ
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        await client.query(
          `
      INSERT INTO product_images
      (product_id, image_url, public_id, is_primary, sort_order)
      VALUES ($1, $2, $3, $4, $5)
      `,
          [product.id, image.image_url, image.public_id, i === 0, i],
        );
      }
    }

    // 3. เพิ่มสี
    if (colors && colors.length > 0) {
      for (const color of colors) {
        await client.query(
          `
      INSERT INTO product_colors
      (product_id, color_id, price)
      VALUES ($1, $2, $3)
      `,
          [product.id, color.id, color.price || 0],
        );
      }
    }

    // 4. เพิ่มวัสดุ
    if (materials && materials.length > 0) {
      for (const material of materials) {
        await client.query(
          `
      INSERT INTO product_materials
      (product_id, material_id, price)
      VALUES ($1, $2, $3)
      `,
          [product.id, material.id, material.price || 0],
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: "เพิ่มสินค้าสำเร็จ",
      product,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  } finally {
    client.release();
  }
}
