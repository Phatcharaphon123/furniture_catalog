"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { FaHeart } from "react-icons/fa";
import { AiFillPicture } from "react-icons/ai";
import { toast } from "react-toastify";

interface WishlistItem {
  id: number;
  product_id: number;
  name: string;
  description: string;
  price: string;
  image_url: string | null;
  created_at: string;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function getWishlist() {
    try {
      const response = await axios.get("/api/wishlist");

      setWishlist(response.data.wishlists || []);
    } catch (error) {
      console.error("โหลด Wishlist ไม่สำเร็จ", error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getWishlist();
  }, []);

  async function removeWishlist(productId: number) {
    try {
      await axios.delete(`/api/wishlist/${productId}`);

      // ลบออกจากหน้าจอทันที
      setWishlist((prev) =>
        prev.filter((item) => item.product_id !== productId)
      );

      toast.success("นำออกจากรายการที่ถูกใจแล้ว");
    } catch (error) {
      console.error("ลบ Wishlist ไม่สำเร็จ", error);
      toast.error("ไม่สามารถนำออกจาก Wishlist ได้");
    }
  }

  if (loading) {
    return (
      <section className="min-h-screen bg-[#faf9f6] py-10">
        <div className="mx-auto max-w-7xl px-6">
          กำลังโหลด...
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#faf9f6] py-10">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-[0.18em] text-[#7a5c43]">
            WISHLIST
          </p>

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-3xl font-bold">
              สินค้าที่ถูกใจ
            </h1>

            <FaHeart className="text-red-500" />
          </div>
        </div>

        {/* ไม่มีสินค้า */}
        {wishlist.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-[#e8e5df] bg-white">
            <FaHeart size={45} className="text-gray-300" />

            <h2 className="mt-4 text-lg font-semibold">
              ยังไม่มีสินค้าที่ถูกใจ
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              กดหัวใจที่สินค้าที่คุณสนใจเพื่อเพิ่มลง Wishlist
            </p>

            <Link
              href="/shop"
              className="mt-5 rounded-full bg-[#252522] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#5d4533]"
            >
              ไปดูสินค้า
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

            {wishlist.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-[20px] border border-[#e8e5df] bg-white transition hover:-translate-y-1 hover:shadow-lg"
              >

                {/* Image */}
                <div className="relative aspect-[1/0.78] overflow-hidden bg-gray-100">

                  <Link href={`/shop/${item.product_id}`}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-300">
                        <AiFillPicture size={60} />
                      </div>
                    )}
                  </Link>

                  {/* Heart */}
                  <button
                    type="button"
                    onClick={() => removeWishlist(item.product_id)}
                    className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow transition hover:scale-110"
                  >
                    <FaHeart
                      size={17}
                      className="text-red-500"
                    />
                  </button>

                </div>

                {/* Content */}
                <Link href={`/shop/${item.product_id}`}>
                  <div className="p-4">

                    <h2 className="text-lg font-semibold">
                      {item.name}
                    </h2>

                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      {item.description}
                    </p>

                    <p className="mt-3 text-xl font-bold">
                      ฿{Number(item.price).toLocaleString("th-TH")}
                    </p>

                  </div>
                </Link>

              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}