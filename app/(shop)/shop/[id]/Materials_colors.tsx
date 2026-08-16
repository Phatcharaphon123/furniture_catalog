import React from "react";

interface ProductColor {
  id: number;
  name: string;
  hex_code: string;
  image_url: string | null;
  price: number;
}

interface ProductMaterial {
  id: number;
  name: string;
  image_url: string | null;
  price: number;
}

interface MaterialsColorsProps {
  colors: ProductColor[];
  materials: ProductMaterial[];
}

export default function Materials_colors({
  colors,
  materials,
}: MaterialsColorsProps) {
  return (
    <section className="pt-10">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-[#7a5c43]">
              MATERIALS & COLORS
            </p>

            <h2 className="mt-1 text-3xl font-bold">วัสดุและสี</h2>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* ================= COLORS ================= */}
          {/* Colors */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Color</h3>

                <p className="mt-1 text-sm text-gray-500">Select a color</p>
              </div>

              <span className="text-sm text-gray-500">
                {colors.length > 0 ? colors[0].name : "-"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {colors.map((color) => (
                <button
                  key={color.id}
                  className="group rounded-xl border border-gray-200 p-3 text-left hover:border-gray-900"
                >
                  <div className="flex items-center gap-3">
                    {/* Color Image / Hex */}
                    {color.image_url ? (
                      <div className="h-10 w-10 overflow-hidden rounded-full border shrink-0">
                        <img
                          src={color.image_url}
                          alt={color.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="h-10 w-10 rounded-full border shrink-0"
                        style={{
                          backgroundColor: color.hex_code || "#ffffff",
                        }}
                      />
                    )}

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {color.name}
                      </p>

                      {color.price > 0 && (
                        <p className="text-xs text-gray-400">
                          +฿{Number(color.price).toLocaleString("th-TH")}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ================= MATERIALS ================= */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Material
                </h3>

                <p className="mt-1 text-sm text-gray-500">Select a material</p>
              </div>

              <span className="text-sm text-gray-500">
                {materials.length > 0
                  ? `${materials.length} materials`
                  : "No material"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {materials.map((material) => (
                <button
                  key={material.id}
                  type="button"
                  className="group rounded-xl border border-gray-200 p-3 text-left hover:border-gray-900"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-gray-100">
                      {material.image_url ? (
                        <img
                          src={material.image_url}
                          alt={material.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                          —
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {material.name}
                      </p>

                      {Number(material.price) > 0 && (
                        <p className="text-xs text-gray-400">
                          +฿
                          {Number(material.price).toLocaleString("th-TH")}
                        </p>
                      )}

                      {Number(material.price) === 0 && (
                        <p className="text-xs text-gray-400">ราคาปกติ</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}

              {materials.length === 0 && (
                <p className="col-span-full py-5 text-center text-sm text-gray-400">
                  ไม่มีข้อมูลวัสดุ
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
