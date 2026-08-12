import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import pool from "@/lib/db";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { message: "ไม่พบไฟล์" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "products",
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    const uploadResult = result as {
      secure_url: string;
      public_id: string;
    };

    return NextResponse.json({
      message: "อัปโหลดรูปสำเร็จ",
      image_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });
  } catch (error) {
    console.error("Upload Error:", error);

    return NextResponse.json(
      { message: "อัปโหลดรูปไม่สำเร็จ" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { public_id } = await request.json();

    if (!public_id) {
      return NextResponse.json(
        { message: "ไม่พบ public_id" },
        { status: 400 }
      );
    }

    // ลบรูปจาก Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    if (result.result !== "ok" && result.result !== "not found") {
      return NextResponse.json(
        { message: "ไม่สามารถลบรูปจาก Cloudinary ได้" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      message: "ลบรูปสำเร็จ",
    });
  } catch (error) {
    console.error("Delete Image Error:", error);

    return NextResponse.json(
      { message: "ลบรูปไม่สำเร็จ" },
      { status: 500 }
    );
  }
}