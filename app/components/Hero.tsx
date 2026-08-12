import React from "react";
import Link from "next/link";

export default function Hero() {
  return (
    <main className="bg-[#faf9f6] text-[#252522]">
      {/* Hero */}
      <section className="py-10">
        <div className="mx-auto max-w-7xl px-6 flex flex-col items-center justify-between gap-10 md:flex-row">
          {/* Hero Text */}
          <div>
            <div className="text-xs font-extrabold tracking-[0.18em] text-[#7a5c43]">
              CUSTOM KITCHEN FURNITURE
            </div>

            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-[-0.03em] md:text-6xl">
              เฟอร์นิเจอร์ครัว
              <br />
              ที่ออกแบบให้เข้ากับพื้นที่
            </h1>

            <p className="mt-5 max-w-[560px] text-[#77746d]">
              เลือกดูบานซิงค์ ตู้ลอย และเฟอร์นิเจอร์ครัวสั่งทำจากแคตตาล็อก
              แล้วส่งแบบที่สนใจให้ทีมงานประเมินราคาได้ทาง LINE
            </p>

            {/* Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/shop"
                className="rounded-full bg-[#252522] px-5 py-3 font-bold text-white transition hover:bg-[#5d4533]"
              >
                ดูสินค้าทั้งหมด
              </Link>

              <Link
                href="#contact"
                className="rounded-full border border-[#e8e5df] bg-white px-5 py-3 font-bold transition hover:bg-[#f1ece6]"
              >
                สอบถามผ่าน LINE
              </Link>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative h-[300px] w-[600px] overflow-hidden rounded-[28px] md:h-[430px]">
            <img
              src="/images/hero.jpg"
              alt="เฟอร์นิเจอร์ครัว"
              className="h-full w-full object-cover"
            />

            <span className="absolute bottom-6 left-6 rounded-xl bg-white/85 px-3.5 py-2.5 text-sm">
              ดูแบบที่ชอบ → ปรึกษาขนาด → ขอราคา
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
