"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { name: "Dashboard", href: "/admin" },
  { name: "Products", href: "/admin/products" },
  { name: "Categories", href: "/admin/category" },
  { name: "Orders", href: "/admin/order" },
  { name: "Users", href: "/admin/user" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-gray-900 text-white">
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold">Admin</h1>
      </div>

      <nav className="p-4">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`block rounded-lg px-4 py-3 mb-2 transition ${
              pathname === menu.href
                ? "bg-blue-600"
                : "hover:bg-gray-700"
            }`}
          >
            {menu.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}