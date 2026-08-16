"use client";

import { FiSearch, FiBell, FiMoon, FiChevronDown } from "react-icons/fi";
import { IoPersonCircle } from "react-icons/io5";
import { MdOutlineChat } from "react-icons/md";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { BiExit } from "react-icons/bi";
import { IoPerson } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, setUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    <header className="h-16 bg-white border-b border-gray-300 flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex items-center w-80 bg-gray-100 rounded-full px-4 py-2">
        <FiSearch className="text-gray-400 text-lg" />
        <input
          type="text"
          placeholder="Type to search..."
          className="ml-3 w-full bg-transparent outline-none text-sm"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-6">
        {/* Theme */}
        <button className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
          <FiBell className="text-gray-500" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Notification */}
        <button className="relative w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
          <MdOutlineChat className="text-gray-500" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Profile */}
        <div ref={menuRef} className="relative">
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold">
                {user?.username || "Admin"}
              </p>

              <p className="text-xs text-gray-500">
                {user?.role || "Administrator"}
              </p>
            </div>

            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-300">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <IoPersonCircle className="w-full h-full text-gray-500" />
              )}
            </div>

            <FiChevronDown
              className={`text-gray-500 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>

          <div
            className={`absolute right-0 top-full mt-2 w-56 transition-all duration-200 z-50
      ${
        isOpen
          ? "opacity-100 visible translate-y-0"
          : "opacity-0 invisible -translate-y-2"
      }`}
          >
            <div className="bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
              <Link
                href="/admin/profile"
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                <IoPerson size={20} />
                บัญชี
              </Link>

              <hr className="text-gray-300" />

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50"
              >
                <BiExit size={20} />
                ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
