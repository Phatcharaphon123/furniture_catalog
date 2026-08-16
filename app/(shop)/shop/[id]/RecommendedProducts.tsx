"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { AiFillPicture } from "react-icons/ai";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name: string;
  images: {
    id: number;
    image_url: string;
    is_primary: boolean;
  }[];
}

interface RecommendedProductsProps {
  currentProductId: number;
  categoryId: number;
}

export default function RecommendedProducts({
  currentProductId,
  categoryId,
}: RecommendedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function getProducts() {
      try {
        const response = await axios.get("/api/product");

        const recommended = response.data
          .filter(
            (product: Product) =>
              product.id !== currentProductId &&
              product.category_id === categoryId
          )
          .slice(0, 6);

        setProducts(recommended);
      } catch (error) {
        console.error("โหลดสินค้าแนะนำไม่สำเร็จ", error);
      }
    }

    getProducts();
  }, [currentProductId, categoryId]);

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="pt-10">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-[#7a5c43]">
            RECOMMENDED
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            สินค้าแนะนำ
          </h2>
        </div>

        <Link
          href="/shop"
          className="text-sm text-gray-500 hover:text-[#7a5c43]"
        >
          ดูสินค้าทั้งหมด →
        </Link>
      </div>

      {/* Products */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-5">
          {products.map((product) => {
            const image =
              product.images?.find((img) => img.is_primary) ||
              product.images?.[0];

            return (
              <Link
                key={product.id}
                href={`/shop/${product.id}`}
                className="group w-[280px] shrink-0 overflow-hidden rounded-[20px] border border-[#e8e5df] bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Image */}
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {image ? (
                    <img
                      src={image.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                      <AiFillPicture size={50} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <p className="text-xs font-bold text-[#7a5c43]">
                    {product.category_name}
                  </p>

                  <h3 className="mt-1 text-lg font-semibold">
                    {product.name}
                  </h3>

                  <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                    {product.description}
                  </p>

                  <p className="mt-3 text-xl font-bold">
                    ฿{Number(product.price).toLocaleString("th-TH")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}