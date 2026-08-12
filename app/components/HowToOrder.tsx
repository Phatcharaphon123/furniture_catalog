import {
  FiShoppingBag,
  FiMaximize,
  FiTag,
  FiCheckCircle,
} from "react-icons/fi";

const steps = [
  {
    number: "01",
    title: "เลือกแบบ",
    description: "เลือกสินค้าที่ชอบจาก Catalog",
    icon: FiShoppingBag,
  },
  {
    number: "02",
    title: "ส่งขนาด",
    description: "ส่งขนาดพื้นที่และรูปหน้างานทาง LINE",
    icon: FiMaximize,
  },
  {
    number: "03",
    title: "ประเมินราคา",
    description: "ทีมงานแนะนำรายละเอียดและเสนอราคา",
    icon: FiTag,
  },
  {
    number: "04",
    title: "ยืนยันผลิต",
    description: "ยืนยันแบบ สี วัสดุ และรายละเอียดการสั่งทำ",
    icon: FiCheckCircle,
  },
];

export default function HowToOrder() {
  return (
    <section className="bg-[#faf9f6] py-10">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-bold tracking-[0.18em] text-[#7a5c43]">
            HOW TO ORDER
          </p>

          <h2 className="mt-1 text-3xl font-bold">
            สั่งทำง่าย 4 ขั้นตอน
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.number}
                className="rounded-[18px] border border-[#e8e5df] bg-white p-5"
              >
                {/* Icon + Number */}
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1ece6] text-[#7a5c43]">
                    <Icon size={22} />
                  </div>

                  <span className="text-xs font-bold text-[#7a5c43]">
                    {step.number}
                  </span>
                </div>

                <h3 className="mt-4 text-lg font-semibold">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}