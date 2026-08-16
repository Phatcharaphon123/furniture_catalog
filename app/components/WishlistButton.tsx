"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

interface WishlistButtonProps {
  productId: number;
}

export default function WishlistButton({
  productId,
}: WishlistButtonProps) {
  const { user } = useAuth();
  const router = useRouter();

  const [isWishlist, setIsWishlist] = useState(false);
  const [loading, setLoading] = useState(false);

  // ตรวจสอบ Wishlist
  useEffect(() => {
    if (!user) {
      setIsWishlist(false);
      return;
    }

    async function checkWishlist() {
      try {
        const response = await axios.get("/api/wishlist");

        const wishlist = response.data.wishlists || [];

        const found = wishlist.some(
          (item: { product_id: number }) =>
            item.product_id === productId
        );

        setIsWishlist(found);
      } catch (error) {
        console.error("ตรวจสอบ Wishlist ไม่สำเร็จ", error);
      }
    }

    checkWishlist();
  }, [user, productId]);

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    // ยังไม่ได้ Login
    if (!user) {
      toast.warning("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าใน Wishlist");
      router.push("/login");
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      if (isWishlist) {
        // ลบออกจาก Wishlist
        const response = await axios.delete("/api/wishlist", {
          data: {
            productId,
          },
        });

        setIsWishlist(false);

        toast.success(
          response.data.message || "ลบออกจาก Wishlist แล้ว"
        );
      } else {
        // เพิ่มเข้า Wishlist
        const response = await axios.post("/api/wishlist", {
          productId,
        });

        setIsWishlist(true);

        toast.success(
          response.data.message || "เพิ่มเข้า Wishlist แล้ว"
        );
      }
    } catch (error) {
      console.error("Wishlist error:", error);

      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "เกิดข้อผิดพลาด กรุณาลองใหม่"
        );
      } else {
        toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleWishlist}
      disabled={loading}
      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e5df] bg-white transition hover:bg-[#f5f1ec] disabled:opacity-50"
    >
      {isWishlist ? (
        <FaHeart
          size={20}
          className="text-red-500"
        />
      ) : (
        <FaRegHeart
          size={20}
          className="text-gray-600"
        />
      )}
    </button>
  );
}