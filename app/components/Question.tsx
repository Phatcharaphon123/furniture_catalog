import { FaChevronDown } from "react-icons/fa";

const faqData = [
  {
    question: "สามารถสั่งตามขนาดได้ไหม?",
    answer:
      "ได้ สามารถแจ้งขนาดพื้นที่และรายละเอียดที่ต้องการเพื่อให้ทีมงานประเมินให้",
  },
  {
    question: "ราคาในเว็บไซต์เป็นราคาสุดท้ายหรือไม่?",
    answer:
      "เป็นราคาเริ่มต้น ราคาจริงขึ้นอยู่กับขนาด วัสดุ สี และรายละเอียดของงาน",
  },
  {
    question: "ต้องวัดขนาดเองหรือไม่?",
    answer:
      "สามารถส่งขนาดคร่าว ๆ หรือรูปพื้นที่เข้ามาสอบถามก่อนได้ ทีมงานจะแนะนำขั้นตอนให้",
  },
  {
    question: "ใช้เวลาผลิตกี่วัน?",
    answer:
      "ระยะเวลาขึ้นอยู่กับรูปแบบและจำนวนสินค้า สามารถสอบถามระยะเวลาปัจจุบันกับทีมงานได้",
  },
  {
    question: "มีบริการติดตั้งหรือไม่?",
    answer:
      "รายละเอียดบริการติดตั้งขึ้นอยู่กับพื้นที่และประเภทงาน กรุณาสอบถามก่อนสั่งทำ",
  },
];

export default function Question() {
  return (
    <section id="faq" className="bg-[#faf9f6] py-10">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-[0.18em] text-[#7a5c43]">
            FAQ
          </p>

          <h2 className="mt-1 text-3xl font-bold text-[#252522]">
            คำถามที่พบบ่อย
          </h2>
        </div>

        {/* FAQ */}
        <div className="space-y-3">
          {faqData.map((faq, index) => (
            <details
              key={index}
              className="group rounded-2xl border border-[#e8e5df] bg-white"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 font-semibold">
                <span>{faq.question}</span>

                <FaChevronDown
                  size={14}
                  className="transition-transform duration-300 group-open:rotate-180"
                />
              </summary>

              <p className="border-t border-[#e8e5df] px-6 py-5 leading-7 text-gray-500">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>

      </div>
    </section>
  );
}