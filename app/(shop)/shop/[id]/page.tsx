"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { AiFillPicture } from "react-icons/ai";
import Link from "next/link";
import WishlistButton from "@/app/components/WishlistButton";
import RecommendedProducts from "./RecommendedProducts";
import Materials_colors from "./Materials_colors";

interface ProductImage {
  id: number;
  image_url: string;
  public_id: string;
  is_primary: boolean;
  sort_order: number;
}

interface ProductColor {
  id: number;
  name: string;
  hex_code: string;
  image_url: string | null;
  price: number;
}

interface ProductMaterial {
  id: number;
  name: string;
  image_url: string | null;
  price: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  category_name: string;
  images: ProductImage[];
  colors: ProductColor[];
  materials: ProductMaterial[];
}
export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null);

  async function getProduct() {
    try {
      const { id } = await params;

      const response = await axios.get(`/api/product/${id}`);

      const data = response.data.product || response.data;

      setProduct(data);

      const primary =
        data.images?.find((image: ProductImage) => image.is_primary) ||
        data.images?.[0];

      setSelectedImage(primary || null);
    } catch (error) {
      console.error("โหลดสินค้าไม่สำเร็จ", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getProduct();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#faf9f6] py-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-6">กำลังโหลด...</div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="bg-[#faf9f6] py-10 min-h-screen">
        <div className="mx-auto max-w-7xl px-6">
          <p>ไม่พบสินค้า</p>

          <Link href="/shop" className="inline-block mt-4 text-blue-600">
            ← กลับไปหน้าสินค้า
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#faf9f6] py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Back */}
        <Link
          href="/shop"
          className="inline-block mb-6 text-gray-500 hover:text-black"
        >
          ← กลับไปดูสินค้า
        </Link>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* รูปสินค้า */}
          <div>
            {/* รูปหลัก */}
            <div className="aspect-square overflow-hidden rounded-2xl bg-gray-100">
              {selectedImage ? (
                <img
                  src={selectedImage.image_url}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-gray-300">
                  <AiFillPicture size={100} />
                </div>
              )}
            </div>

            {/* รูปเพิ่มเติม */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 overflow-x-auto pb-2">
                <div className="flex gap-3">
                  {product.images.map((image) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`h-35 w-35 shrink-0 overflow-hidden rounded-lg border-2 bg-gray-100 ${
                        selectedImage?.id === image.id
                          ? "border-[#252522]"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ข้อมูล */}
          <div className="flex flex-col">
            {/* Category */}
            <p className="text-sm font-semibold text-[#7a5c43]">
              {product.category_name}
            </p>

            {/* Name */}
            <div className="mt-2 flex items-center justify-between gap-4">
              <h1 className="text-4xl font-bold text-[#252522]">
                {product.name}
              </h1>

              <WishlistButton productId={product.id} />
            </div>

            {/* Price */}
            <div className="mt-6">
              <p className="text-sm text-gray-500">ราคาเริ่มต้น</p>

              <p className="mt-1 text-3xl font-bold">
                ฿{Number(product.price).toLocaleString("th-TH")}
              </p>

              <p className="mt-1 text-sm text-gray-400">
                ราคาจริงขึ้นอยู่กับขนาด วัสดุ และรายละเอียดการสั่งทำ
              </p>
            </div>

            {/* Description */}
            <div className="mt-8 border-t border-[#e8e5df] pt-6">
              <h2 className="text-lg font-semibold">รายละเอียดสินค้า</h2>

              <p className="mt-3 leading-7 text-gray-600">
                {product.description || "ไม่มีรายละเอียดสินค้า"}
              </p>
            </div>

            {/* Custom information */}
            <div className="mt-6 rounded-2xl bg-white p-5">
              <h2 className="font-semibold">สั่งทำตามพื้นที่ของคุณ</h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                สามารถปรับขนาด สี วัสดุ และรายละเอียดของสินค้า
                ให้เหมาะกับพื้นที่ของคุณได้
              </p>
            </div>

            {/* Custom information */}
            <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#252522]">
                ข้อมูลที่ลูกค้าควรเตรียม
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                เพื่อให้ทีมงานประเมินราคาได้แม่นยำขึ้น
              </p>

              <div className="mt-5 space-y-4">
                {/* Item */}
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 text-sm text-[#7a5c43]">
                    ✓
                  </div>

                  <span className="text-sm text-gray-700">
                    ขนาดพื้นที่โดยประมาณ
                  </span>
                </div>

                {/* Item */}
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 text-sm text-[#7a5c43]">
                    ✓
                  </div>

                  <span className="text-sm text-gray-700">รูปพื้นที่จริง</span>
                </div>

                {/* Item */}
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 text-sm text-[#7a5c43]">
                    ✓
                  </div>

                  <span className="text-sm text-gray-700">
                    สไตล์ / สีที่ต้องการ
                  </span>
                </div>

                {/* Item */}
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 text-sm text-[#7a5c43]">
                    ✓
                  </div>

                  <span className="text-sm text-gray-700">
                    วัสดุที่สนใจ (ถ้ามี)
                  </span>
                </div>

                {/* Item */}
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 text-sm text-[#7a5c43]">
                    ✓
                  </div>

                  <span className="text-sm text-gray-700">
                    งบประมาณโดยประมาณ
                  </span>
                </div>

                {/* Item */}
                <div className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-gray-300 text-sm text-[#7a5c43]">
                    ✓
                  </div>

                  <span className="text-sm text-gray-700">
                    รายละเอียดเพิ่มเติม (ถ้ามี)
                  </span>
                </div>
              </div>

              {/* Contact Button */}
              <a
                href="#contact"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-black py-3.5 font-semibold text-white transition hover:bg-[#5d371d]"
              >
                ส่งรูปพื้นที่ / สอบถามทีมงาน
              </a>
            </div>
          </div>
        </div>
        {/* วัสดุและสี */}
        <Materials_colors
          colors={product.colors}
          materials={product.materials}
        />
        {/* สินค้าแนะนำ */}
        <RecommendedProducts
          currentProductId={product.id}
          categoryId={product.category_id}
        />
      </div>
    </section>
  );
}
