"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Category {
  id: number;
  name: string;
  description: string;
}

export default function CategoryPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  async function getCategories() {
    try {
      const response = await axios.get("/api/category");

      console.log(response.data);

      setCategories(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getCategories();
  }, []);

  async function handleCreate() {
    try {
      const response = await axios.post("/api/category", {
        name,
        description,
      });

      toast.success(response.data.message || "เพิ่มหมวดหมู่สำเร็จ");

      resetForm();
      getCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  }

  async function handleUpdate() {
    try {
      const response = await axios.put(`/api/category/${editingId}`, {
        name,
        description,
      });

      toast.success(response.data.message || "แก้ไขหมวดหมู่สำเร็จ");

      resetForm();
      getCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const response = await axios.delete(`/api/category/${deleteId}`);

      toast.success(response.data.message || "ลบหมวดหมู่สำเร็จ");

      setOpenDeleteModal(false);
      setDeleteId(null);

      getCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.warning("กรุณากรอกชื่อหมวดหมู่");
      return;
    }

    if (editingId) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  }

  function handleEdit(category: Category) {
    setEditingId(category.id);
    setName(category.name);
    setDescription(category.description ?? "");
    setOpenModal(true);
  }

  function resetForm() {
    setOpenModal(false);
    setEditingId(null);
    setName("");
    setDescription("");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-500">Manage product categories</p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Category
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow">
        <input
          type="text"
          placeholder="Search category..."
          className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-4">ID</th>
              <th className="p-4">Category</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{category.id}</td>

                <td className="p-4 font-medium">{category.name}</td>

                <td className="p-4 text-gray-500">{category.description || "-"}</td>

                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button 
                      onClick={() => handleEdit(category)}
                      className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setDeleteId(category.id);
                        setOpenDeleteModal(true);
                      }}
                      className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {openModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[450px] p-6 shadow-xl">
            <h2 className="text-2xl font-bold mb-5">
              {editingId ? "Edit Category" : "Add Category"}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Category Name</label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block mb-1 font-medium">Description</label>

                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setOpenModal(false)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {editingId ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      {openDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[400px] p-6 shadow-xl">
            <h2 className="text-xl font-bold text-red-600">Delete Category</h2>

            <p className="text-gray-600 mt-3">
              คุณต้องการลบหมวดหมู่นี้ใช่หรือไม่?
            </p>

            <div className="flex justify-end gap-3 mt-8">
              <button
                onClick={() => {
                  setOpenDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
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
