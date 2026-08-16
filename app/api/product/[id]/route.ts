import { NextResponse } from "next/server";
import pool from "@/lib/db";

// สินค้าแต่ละตัว
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const result = await pool.query(
      `
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

      WHERE products.id = $1
        AND products.is_active = TRUE
      `,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "ไม่พบสินค้า" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error(error);

    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}

// แก้ไขสินค้า

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const body = await request.json();

  const { name, description, price, category_id, colors, materials } = body;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Update product
    const result = await client.query(
      `
      UPDATE products
      SET
        name = $1,
        description = $2,
        price = $3,
        category_id = $4
      WHERE id = $5
      RETURNING *
      `,
      [name, description, price, category_id, id],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return NextResponse.json({ message: "ไม่พบสินค้า" }, { status: 404 });
    }

    // =====================================
    // 2. ลบสีเดิม
    // =====================================

    await client.query(
      `
      DELETE FROM product_colors
      WHERE product_id = $1
      `,
      [id],
    );

    // =====================================
    // 3. เพิ่มสีใหม่ + ราคา
    // =====================================

    if (colors && colors.length > 0) {
      for (const color of colors) {
        await client.query(
          `
          INSERT INTO product_colors
          (product_id, color_id, price)
          VALUES ($1, $2, $3)
          `,
          [id, color.id, Number(color.price) || 0],
        );
      }
    }

    // =====================================
    // 4. ลบวัสดุเดิม
    // =====================================

    await client.query(
      `
      DELETE FROM product_materials
      WHERE product_id = $1
      `,
      [id],
    );

    // =====================================
    // 5. เพิ่มวัสดุใหม่ + ราคา
    // =====================================

    if (materials && materials.length > 0) {
      for (const material of materials) {
        await client.query(
          `
          INSERT INTO product_materials
          (product_id, material_id, price)
          VALUES ($1, $2, $3)
          `,
          [id, material.id, Number(material.price) || 0],
        );
      }
    }

    await client.query("COMMIT");

    return NextResponse.json({
      message: "อัปเดตข้อมูลสำเร็จ",
      product: result.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  } finally {
    client.release();
  }
}

//ลบสินค้า
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
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
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ message: "ไม่พบสินค้า" }, { status: 404 });
    }

    return NextResponse.json({
      message: "ลบสินค้าสำเร็จ",
      product: result.rows[0],
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json({ message: "Database Error" }, { status: 500 });
  }
}
