"use client";

import { RiLineFill } from "react-icons/ri";
import { FaFacebookMessenger } from "react-icons/fa";

export default function FloatingContact() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">

      {/* Messenger */}
      <a
        href="#"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg transition hover:scale-110"
      >
        <FaFacebookMessenger size={28} />
      </a>

      {/* LINE */}
      <a
        href="#"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition hover:scale-110"
      >
        <RiLineFill size={30} />
      </a>

    </div>
  );
}