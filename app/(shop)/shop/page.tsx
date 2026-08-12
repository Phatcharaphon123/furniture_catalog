"use client";

import { Suspense, useEffect, useState } from "react";
import axios from "axios";
import { AiFillPicture } from "react-icons/ai";
import Link from "next/link";
import { useSearchParams } from "next/navigation";


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
  images: ProductImage[];
}

interface Category {
  id: number;
  name: string;
}

function ShopContent(){
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const searchParams = useSearchParams();

  async function getProducts() {
    try {
      const response = await axios.get("/api/product");
      setProducts(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function getCategories() {
    try {
      const response = await axios.get("/api/category");
      setCategories(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getProducts();
    getCategories();

    const category = searchParams.get("category");

    if (category) {
      setCategoryId(category);
    }
  }, [searchParams]);

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      categoryId === "" || product.category_id === Number(categoryId);

    return matchSearch && matchCategory;
  });

  return (
    <section className="bg-[#faf9f6] py-10">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">สินค้า</h1>

          <p className="text-gray-500 mt-1">เลือกสินค้าที่คุณต้องการ</p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-52 shrink-0">
            <h2 className="font-bold text-lg mb-4">หมวดหมู่</h2>

            <div className="space-y-2">
              {/* All */}
              <button
                onClick={() => setCategoryId("")}
                className={`w-full text-left px-4 py-3 rounded-lg ${
                  categoryId === ""
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                สินค้าทั้งหมด
              </button>

              {/* Categories */}
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setCategoryId(String(category.id))}
                  className={`w-full text-left px-4 py-3 rounded-lg ${
                    categoryId === String(category.id)
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </aside>

          {/* Product Area */}
          <main className="flex-1">
            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Products */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/shop/${product.id}`}
                  className="block bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
                >
                  {/* Image */}
                  <div className="w-full h-56 bg-gray-100 border-b border-[#e8e5df] overflow-hidden">
                    {(() => {
                      const primaryImage =
                        product.images?.find((image) => image.is_primary) ||
                        product.images?.[0];

                      return primaryImage ? (
                        <img
                          src={primaryImage.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-300">
                          <AiFillPicture size={60} />
                        </div>
                      );
                    })()}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-sm text-gray-500 mb-1">
                      {product.category_name}
                    </p>

                    <h2 className="font-semibold text-lg">{product.name}</h2>

                    <div className="flex justify-between items-center mt-4">
                      <span className="text-xl font-bold">
                        ฿{Number(product.price).toLocaleString()}
                      </span>
                    </div>

                    <button className="w-full mt-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 transition">
                      สำรวจเพิ่มเติม
                    </button>
                  </div>
                </Link>
              ))}
            </div>

            {/* No Products */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-20 text-gray-500">ไม่พบสินค้า</div>
            )}
          </main>
        </div>
      </div>
    </section>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div>กำลังโหลดสินค้า...</div>}>
      <ShopContent />
    </Suspense>
  );
}