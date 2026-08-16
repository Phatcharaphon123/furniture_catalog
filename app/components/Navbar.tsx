"use client";

import React from "react";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/navigation";

import { IoPersonCircle, IoPerson } from "react-icons/io5";
import { BsBoxSeamFill } from "react-icons/bs";
import { BiExit } from "react-icons/bi";
import { MdOutlineShoppingBag } from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";

import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

function Navbar() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      const response = await axios.post("/api/user/logout");

      setUser(null);

      toast.success(response.data.message || "ออกจากระบบสำเร็จ!");

      router.push("/");
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="sticky top-0 z-50 border-b border-[#e8e5df] bg-[#faf9f6]/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 flex h-16 items-center justify-between gap-4 md:h-20">
        {/* Logo */}
        <Link href="/" className="font-extrabold tracking-[0.06em]">
          <div>KITCHEN STUDIO</div>

          <small className="block text-[10px] font-medium tracking-[0.18em] text-[#77746d]">
            CUSTOM KITCHEN FURNITURE
          </small>
        </Link>

        {/* Menu */}
        <nav className="hidden items-center gap-5 text-sm text-[#555] md:flex">
          <Link href="/shop" className="transition hover:text-[#252522]">
            สินค้า
          </Link>

          <Link href="/projects" className="transition hover:text-[#252522]">
            ผลงาน
          </Link>

          <Link
            href="/#how-to-order"
            className="transition hover:text-[#252522]"
          >
            วิธีสั่งทำ
          </Link>

          <Link href="/#contact" className="transition hover:text-[#252522]">
            ติดต่อ
          </Link>
        </nav>

        {/* Right menu */}
        <div className="flex items-center gap-4">
          {/* Wishlist */}
          <Link
            href="/user/wishlist"
            className="transition hover:text-[#7a5c43]"
          >
            <FaRegHeart size={21} />
          </Link>

          {/* Account */}
          <div className="relative group">
            {user ? (
              <>
                <div className="flex cursor-pointer items-center gap-2">
                  <div className="h-9 w-9 overflow-hidden rounded-full border border-[#e8e5df] bg-gray-100">
                    {user.profile_image ? (
                      <img
                        src={user.profile_image}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <IoPersonCircle className="h-full w-full text-gray-400" />
                    )}
                  </div>

                  <span className="text-sm font-semibold">{user.username}</span>
                </div>

                {/* Dropdown */}
                <div className="invisible absolute right-0 top-full w-56 pt-2 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                  <div className="overflow-hidden rounded-xl border border-[#e8e5df] bg-white shadow-lg">
                    <Link
                      href="/profile"
                      className="block px-4 py-3 text-sm transition hover:bg-[#f5f1ec]"
                    >
                      <IoPerson size={18} className="mr-2 inline" />
                      บัญชีของฉัน
                    </Link>
                    <hr className="border-[#e8e5df]" />

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
                    >
                      <BiExit size={18} className="mr-2 inline" />
                      ออกจากระบบ
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* Sign in */
              <Link
                href="/login"
                className="rounded-full bg-[#252522] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#5d4533]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
