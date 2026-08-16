"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AiFillPicture } from "react-icons/ai";

interface Color {
  id: number;
  name: string;
  hex_code: string;
  image_url: string | null;
  public_id: string | null;
}

export default function ColorsPage() {
  const [colors, setColors] = useState<Color[]>([]);
  const [search, setSearch] = useState("");

  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [hexCode, setHexCode] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [uploading, setUploading] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  async function getColors() {
    try {
      const response = await axios.get("/api/materials-colors/colors");

      setColors(response.data.colors || response.data);
    } catch (error) {
      console.error(error);
      toast.error("โหลดข้อมูลสีไม่สำเร็จ");
    }
  }

  useEffect(() => {
    getColors();
  }, []);

  function openAddModal() {
    setEditingId(null);

    setName("");
    setHexCode("#ffffff");

    setImageUrl("");
    setPublicId("");

    setImageFile(null);
    setPreviewUrl("");

    setOpenModal(true);
  }

  function handleEdit(color: Color) {
    setEditingId(color.id);

    setName(color.name);
    setHexCode(color.hex_code || "#ffffff");

    setImageUrl(color.image_url || "");
    setPublicId(color.public_id || "");

    // รูปเดิมจาก DB
    setPreviewUrl(color.image_url || "");

    // ยังไม่มีไฟล์ใหม่
    setImageFile(null);

    setOpenModal(true);
  }

  function handleSelectImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // ถ้าเลือกไฟล์ใหม่ ให้ล้างค่ารูปเก่าที่เตรียมส่ง
    setImageUrl("");
    setPublicId("");

    e.target.value = "";
  }

async function handleSave() {
  if (!name.trim()) {
    toast.warning("กรุณากรอกชื่อสี");
    return;
  }

  if (!hexCode.trim()) {
    toast.warning("กรุณาระบุ Hex Code");
    return;
  }

  try {
    setUploading(true);

    // ใช้ค่าปัจจุบันก่อน
    let finalImageUrl = imageUrl || null;
    let finalPublicId = publicId || null;

    // ถ้ามีการเลือกรูปใหม่ ค่อย Upload ตอนกด Save
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);

      const uploadResponse = await axios.post(
        "/api/upload/colors",
        formData
      );

      finalImageUrl = uploadResponse.data.image_url;
      finalPublicId = uploadResponse.data.public_id;
    }

    // =========================
    // Edit
    // =========================
    if (editingId) {
      const response = await axios.put(
        `/api/materials-colors/colors/${editingId}`,
        {
          name,
          hex_code: hexCode,
          image_url: finalImageUrl,
          public_id: finalPublicId,
        }
      );

      toast.success(response.data.message || "แก้ไขสีสำเร็จ");
    }

    // =========================
    // Add
    // =========================
    else {
      const response = await axios.post(
        "/api/materials-colors/colors",
        {
          name,
          hex_code: hexCode,
          image_url: finalImageUrl,
          public_id: finalPublicId,
        }
      );

      toast.success(response.data.message || "เพิ่มสีสำเร็จ");
    }

    resetForm();
    await getColors();

  } catch (error: any) {
    console.error(error);

    toast.error(
      error.response?.data?.message ||
      "เกิดข้อผิดพลาด"
    );
  } finally {
    setUploading(false);
  }
}

  function openDelete(id: number) {
    setDeleteId(id);
    setOpenDeleteModal(true);
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const response = await axios.delete(
        `/api/materials-colors/colors/${deleteId}`,
      );

      toast.success(response.data.message || "ลบสีสำเร็จ");

      setOpenDeleteModal(false);
      setDeleteId(null);

      getColors();
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "ลบสีไม่สำเร็จ");
    }
  }

  function resetForm() {
    setOpenModal(false);
    setEditingId(null);

    setName("");
    setHexCode("#ffffff");

    setImageUrl("");
    setPublicId("");

    setImageFile(null);
    setPreviewUrl("");
  }

  const filteredColors = colors.filter((color) =>
    color.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Colors</h1>

          <p className="text-gray-500">Manage product colors</p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          + Add Color
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl bg-white p-4 shadow">
        <input
          type="text"
          placeholder="Search color..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-4">Image</th>
              <th className="p-4">Color</th>
              <th className="p-4">Hex Code</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredColors.map((color) => (
              <tr key={color.id} className="border-t hover:bg-gray-50">
                {/* Image */}
                <td className="p-4">
                  {color.image_url ? (
                    <img
                      src={color.image_url}
                      alt={color.name}
                      className="h-14 w-14 rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border text-gray-400">
                      <AiFillPicture size={28} />
                    </div>
                  )}
                </td>

                {/* Name */}
                <td className="p-4 font-medium">{color.name}</td>

                {/* Hex */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-7 w-7 rounded border"
                      style={{
                        backgroundColor: color.hex_code || "#ffffff",
                      }}
                    />

                    <span className="font-mono text-sm">
                      {color.hex_code || "-"}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(color)}
                      className="rounded bg-yellow-400 px-3 py-1 text-white hover:bg-yellow-500"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => openDelete(color.id)}
                      className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredColors.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-500">
                  No colors found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[500px] rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-6 text-2xl font-bold">
              {editingId ? "Edit Color" : "Add Color"}
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block font-medium">Color Name</label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="เช่น Walnut Brown"
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Hex */}
              <div>
                <label className="mb-1 block font-medium">Hex Code</label>

                <div className="flex gap-3">
                  <input
                    type="color"
                    value={hexCode || "#ffffff"}
                    onChange={(e) => setHexCode(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border"
                  />

                  <input
                    type="text"
                    value={hexCode}
                    onChange={(e) => setHexCode(e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1 rounded-lg border px-3 py-2 font-mono"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="mb-2 block font-medium">Color Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelectImage}
                  className="w-full rounded-lg border px-3 py-2"
                />

                {uploading && (
                  <p className="mt-2 text-sm text-blue-600">
                    กำลังอัปโหลดรูป...
                  </p>
                )}

                {previewUrl && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm text-gray-500">Preview</p>

                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="h-28 w-28 rounded-lg border object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={resetForm}
                className="rounded-lg border px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {openDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-[400px] rounded-xl bg-white p-6 shadow-xl">
            <h2 className="mb-3 text-xl font-bold">Delete Color</h2>

            <p className="mb-6 text-gray-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบสีนี้?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setOpenDeleteModal(false);
                  setDeleteId(null);
                }}
                className="rounded-lg border px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
