export default function ProjectSection() {
  return (
    <section id="projects" className="bg-[#faf9f6] py-10">
      <div className="mx-auto max-w-7xl px-6">

        {/* Header */}
        <div className="mb-6 flex items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#7a5c43]">
              PROJECTS
            </p>

            <h2 className="mt-1 text-3xl font-bold">
              ผลงานจริง
            </h2>
          </div>

          <p className="text-sm text-gray-500">
            ช่วยให้เห็นภาพก่อนตัดสินใจ
          </p>
        </div>

        {/* Projects */}
        <div className="grid grid-cols-1 gap-[18px] md:grid-cols-[1.2fr_0.8fr]">

          {/* Main Project */}
          <div
            className="flex min-h-[300px] items-end rounded-[24px] bg-cover bg-center p-6"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80')",
            }}
          >
            <div className="rounded-xl bg-white/85 px-4 py-3">
              <strong>ชุดครัวสั่งทำตามพื้นที่</strong>
            </div>
          </div>

          {/* Small Projects */}
          <div className="flex flex-col gap-[18px]">

            <div
              className="flex min-h-[140px] items-end rounded-[24px] bg-cover bg-center p-5"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1000&q=80')",
              }}
            >
              <div className="rounded-xl bg-white/85 px-4 py-2">
                <strong>บานซิงค์ + ตู้ลอย</strong>
              </div>
            </div>

            <div
              className="flex min-h-[140px] items-end rounded-[24px] bg-cover bg-center p-5"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80')",
              }}
            >
              <div className="rounded-xl bg-white/85 px-4 py-2">
                <strong>งานติดตั้งจริง</strong>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}