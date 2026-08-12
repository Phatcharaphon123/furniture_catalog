"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function CategorySection() {
  const [categories, setCategories] = useState<Category[]>([]);

  async function getCategories() {
    try {
      const response = await axios.get("/api/category");
      setCategories(response.data);
    } catch (error) {
      console.error("โหลดหมวดหมู่ไม่สำเร็จ", error);
    }
  }

  useEffect(() => {
    getCategories();
  }, []);

  return (
    <section className="bg-[#faf9f6] py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-6 flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#7a5c43]">
              CATALOG
            </p>

            <h2 className="mt-1 text-3xl font-bold">เลือกประเภทสินค้า</h2>
          </div>

          <p className="text-sm text-gray-500">กดหมวดที่ต้องการเพื่อดูแบบ</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Link
            href="/shop"
            className="rounded-[18px] border border-[#cbbcae] bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <strong className="block text-lg">สินค้าทั้งหมด</strong>
            <span className="text-xs text-gray-500">ดูทุกประเภท</span>
          </Link>

          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?category=${category.id}`}
              className="rounded-[18px] border border-[#e8e5df] bg-white p-5 text-left transition hover:-translate-y-1 hover:border-[#cbbcae] hover:shadow-md"
            >
              <strong className="block text-lg">{category.name}</strong>

              <span className="text-xs text-gray-500">
                {category.description}
                ดูเฉพาะประเภทนี้
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
