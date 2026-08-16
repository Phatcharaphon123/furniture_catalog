"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AiFillPicture } from "react-icons/ai";

interface Material {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
  public_id: string | null;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);

  const [openModal, setOpenModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [search, setSearch] = useState("");

  const [publicId, setPublicId] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  async function getMaterials() {
    try {
      const response = await axios.get("/api/materials-colors/materials");
      setMaterials(response.data);
    } catch (error) {
      console.error(error);
      toast.error("โหลดวัสดุไม่สำเร็จ");
    }
  }

  useEffect(() => {
    getMaterials();
  }, []);

  function openAddModal() {
    setEditingId(null);
    setName("");
    setDescription("");
    setImageUrl("");
    setPublicId("");
    setImageFile(null);
    setPreviewUrl("");
    setOpenModal(true);
  }

  function handleEdit(material: Material) {
    setEditingId(material.id);

    setName(material.name);
    setDescription(material.description || "");

    setImageUrl(material.image_url || "");
    setPublicId(material.public_id || "");

    setImageFile(null);

    // เอารูปเดิมมา Preview
    setPreviewUrl(material.image_url || "");

    setOpenModal(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.warning("กรุณากรอกชื่อวัสดุ");
      return;
    }

    try {
      setUploading(true);

      let finalImageUrl = imageUrl || null;
      let finalPublicId = publicId || null;

      // =========================
      // 1. ถ้ามีรูปใหม่
      // =========================
      if (imageFile) {
        const formData = new FormData();

        formData.append("file", imageFile);

        // ตอนนี้ถึงค่อย Upload Cloudinary
        const uploadResponse = await axios.post(
          "/api/upload/materials",
          formData,
        );

        finalImageUrl = uploadResponse.data.image_url;
        finalPublicId = uploadResponse.data.public_id;
      }

      // =========================
      // 2. บันทึก DB
      // =========================
      if (editingId) {
        const response = await axios.put(
          `/api/materials-colors/materials/${editingId}`,
          {
            name,
            description,
            image_url: finalImageUrl,
            public_id: finalPublicId,
          },
        );

        toast.success(response.data.message || "แก้ไขวัสดุสำเร็จ");
      } else {
        const response = await axios.post("/api/materials-colors/materials", {
          name,
          description,
          image_url: finalImageUrl,
          public_id: finalPublicId,
        });

        toast.success(response.data.message || "เพิ่มวัสดุสำเร็จ");
      }

      resetForm();
      await getMaterials();
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
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
        `/api/materials-colors/materials/${deleteId}`,
      );

      toast.success(response.data.message || "ลบวัสดุสำเร็จ");

      setDeleteId(null);
      setOpenDeleteModal(false);

      getMaterials();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "ลบวัสดุไม่สำเร็จ");
    }
  }

  function resetForm() {
    setOpenModal(false);
    setEditingId(null);

    setName("");
    setDescription("");

    setImageUrl("");
    setPublicId("");

    setImageFile(null);
    setPreviewUrl("");

    setUploading(false);
  }

  const filteredMaterials = materials.filter((material) =>
    material.name.toLowerCase().includes(search.toLowerCase()),
  );

  function handleSelectImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    // เก็บไฟล์ไว้ในเครื่องก่อน
    setImageFile(file);

    // Preview จากไฟล์ในเครื่อง
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // สำคัญ:
    // ยังไม่เปลี่ยน imageUrl / publicId ของรูปเก่า
    // เพราะรูปใหม่ยังไม่ได้ Upload
    e.target.value = "";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Materials</h1>

          <p className="text-gray-500">Manage product materials</p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          + Add Material
        </button>
      </div>

      {/* Search */}
      <div className="rounded-xl bg-white p-4 shadow">
        <input
          type="text"
          placeholder="Search material..."
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
              <th className="p-4">Material</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredMaterials.map((material) => (
              <tr key={material.id} className="border-t hover:bg-gray-50">
                {/* Image */}
                <td className="p-4">
                  {material.image_url ? (
                    <img
                      src={material.image_url}
                      alt={material.name}
                      className="h-14 w-14 rounded-lg border object-cover"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg border text-gray-400">
                      <AiFillPicture size={28} />
                    </div>
                  )}
                </td>

                {/* Name */}
                <td className="p-4 font-medium">{material.name}</td>

                {/* Description */}
                <td className="p-4 text-gray-500">
                  {material.description || "-"}
                </td>

                {/* Actions */}
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(material)}
                      className="rounded bg-yellow-400 px-3 py-1 text-white hover:bg-yellow-500"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => openDelete(material.id)}
                      className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredMaterials.length === 0 && (
              <tr>
                <td colSpan={4} className="py-10 text-center text-gray-500">
                  No materials found
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
              {editingId ? "Edit Material" : "Add Material"}
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1 block font-medium">Material Name</label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-1 block font-medium">Description</label>

                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium">Material Image</label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSelectImage}
                  disabled={uploading}
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
            <h2 className="mb-3 text-xl font-bold">Delete Material</h2>

            <p className="mb-6 text-gray-600">
              คุณแน่ใจหรือไม่ว่าต้องการลบวัสดุนี้?
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
