"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { AiFillPicture } from "react-icons/ai";
import Link from "next/link";

interface ProductImage {
  id: number;
  image_url: string;
  public_id: string;
  is_primary: boolean;
  sort_order: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  category_name: string;
  images: (ProductImage | null)[];
}

export default function ProductSection() {
  const [products, setProducts] = useState<Product[]>([]);

  async function getProducts() {
    try {
      const response = await axios.get("/api/product");
      setProducts(response.data);
    } catch (error) {
      console.error("โหลดสินค้าไม่สำเร็จ", error);
    }
  }

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <section className="bg-[#faf9f6] py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#7a5c43]">
              PRODUCTS
            </p>

            <h2 className="mt-1 text-3xl font-bold">สินค้าทั้งหมด</h2>
          </div>

          <p className="text-sm text-gray-500">{products.length} รายการ</p>
        </div>

        {/* Search + Sort */}
        <div className="mb-5 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="ค้นหาชื่อสินค้า..."
            className="min-w-[220px] flex-1 rounded-xl border border-[#e8e5df] bg-white px-4 py-3 outline-none focus:border-[#cbbcae]"
          />

          <select className="rounded-xl border border-[#e8e5df] bg-white px-4 py-3 outline-none">
            <option>เรียงตามแนะนำ</option>
            <option>ราคาต่ำ → สูง</option>
            <option>ราคาสูง → ต่ำ</option>
          </select>
        </div>

        {/* Products */}
        <div className="overflow-x-auto pb-3">
          <div className="grid grid-flow-col grid-rows-2 auto-cols-[280px] gap-5">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="block cursor-pointer overflow-hidden rounded-[20px] border border-[#e8e5df] bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Image */}
                <div className="aspect-[1/0.78] overflow-hidden bg-gray-100">
                  {(() => {
                    const primaryImage =
                      product.images?.find(
                        (image) => image !== null && image.is_primary,
                      )?.image_url ||
                      product.images?.find((image) => image !== null)
                        ?.image_url;

                    return primaryImage ? (
                      <img
                        src={primaryImage}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <AiFillPicture size={60} />
                      </div>
                    );
                  })()}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs font-bold text-[#7a5c43]">
                    {product.category_name}
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">{product.name}</h3>

                  <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                    {product.description}
                  </p>

                  <p className="mt-3 text-xl font-bold">
                    <span className="mr-1 text-xs font-normal text-gray-500">
                      เริ่มต้น
                    </span>
                    ฿{Number(product.price).toLocaleString("th-TH")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
