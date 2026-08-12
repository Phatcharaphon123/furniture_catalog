import { FaMapMarkerAlt, FaPhone, FaLine, FaClock } from "react-icons/fa";

export default function ContactSection() {
  return (
    <section className="bg-[#faf9f6] py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          {/* ข้อมูลติดต่อ */}
          <div>
            <h2 className="text-3xl font-bold leading-tight">
              สอบถามเกี่ยวกับงานออกแบบ
              <br />
              หรือสนใจลงทะเบียนสำรวจหน้างาน
            </h2>

            <p className="mt-4 text-gray-600">
              ทีมงานจะรีบตอบกลับภายใน 24 ชั่วโมง
              เพื่อช่วยประเมินความต้องการของคุณ
            </p>

            {/* ที่อยู่ */}
            <div className="mt-8 flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#3b8295] shadow">
                <FaMapMarkerAlt />
              </div>

              <div>
                <h3 className="font-bold">ที่อยู่</h3>
                <p className="mt-1 text-sm leading-6 text-gray-500">
                  ชั้น 3 SCG HOME experience
                  <br />
                  สามเสนยางงามถนนรามอินทรา
                </p>
              </div>
            </div>

            {/* เบอร์โทร */}
            <div className="mt-6 flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#3b8295] shadow">
                <FaPhone />
              </div>

              <div>
                <h3 className="font-bold">เบอร์โทรศัพท์</h3>
                <p className="mt-1 text-sm text-gray-500">06-2197-7314</p>
              </div>
            </div>

            {/* LINE */}
            <div className="mt-6 flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#3b8295] shadow">
                <FaLine />
              </div>

              <div>
                <h3 className="font-bold">LINE Official</h3>
                <p className="mt-1 text-sm text-gray-500">LINE: @dooDeco</p>
              </div>
            </div>

            {/* เวลา */}
            <div className="mt-6 flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#3b8295] shadow">
                <FaClock />
              </div>

              <div>
                <h3 className="font-bold">วันและเวลาให้บริการ</h3>
                <p className="mt-1 text-sm text-gray-500">
                  เปิดทุกวัน ตั้งแต่เวลา 10:00 - 19:00 น.
                </p>
              </div>
            </div>
          </div>

          {/* แบบฟอร์ม */}
          <div className="rounded-2xl border border-[#e8e5df] bg-white p-8 shadow-sm">
            <h2 className="text-xl font-bold">กรอกข้อมูลให้เราติดต่อกลับ</h2>

            <form className="mt-6 space-y-5">
              <input
                type="text"
                placeholder="ชื่อ - นามสกุล *"
                className="w-full border-b border-gray-300 px-1 py-3 outline-none focus:border-[#3b8295]"
              />

              <input
                type="tel"
                placeholder="เบอร์โทรศัพท์ *"
                className="w-full border-b border-gray-300 px-1 py-3 outline-none focus:border-[#3b8295]"
              />

              <input
                type="email"
                placeholder="อีเมล"
                className="w-full border-b border-gray-300 px-1 py-3 outline-none focus:border-[#3b8295]"
              />

              <input
                type="text"
                placeholder="LINE ID"
                className="w-full border-b border-gray-300 py-4 outline-none"
              />

              <textarea
                placeholder="รายละเอียดเพิ่มเติม"
                rows={3}
                className="w-full border-b border-gray-300 px-1 py-3 outline-none focus:border-[#3b8295]"
              />

              <button
                type="submit"
                className="w-full rounded-full border border-[#3b8295] py-3 font-semibold text-[#3b8295] transition hover:bg-[#3b8295] hover:text-white"
              >
                ส่งข้อมูล
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
