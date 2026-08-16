"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AiFillPicture } from "react-icons/ai";

interface ProductImage {
  id: number;
  image_url: string;
  public_id: string;
  is_primary: boolean;
  sort_order: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  category_name: string;
  images: ProductImage[];
  colors: ProductColor[];
  materials: ProductMaterial[];
}

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

interface Category {
  id: number;
  name: string;
}

interface Color {
  id: number;
  name: string;
  hex_code: string;
  image_url: string | null;
}

interface Material {
  id: number;
  name: string;
  description: string;
  image_url: string | null;
}

interface SelectedOption {
  id: number;
  price: number;
}

export default function ProductsPage() {
  const [openModal, setOpenModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<
    {
      id?: number;
      image_url: string;
      public_id: string;
    }[]
  >([]);

  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [selectedColors, setSelectedColors] = useState<SelectedOption[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<SelectedOption[]>(
    [],
  );

  async function getProducts() {
    try {
      const response = await axios.get("/api/product");
      setProducts(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getProducts();
    getCategories();
    getColors();
    getMaterials();
  }, []);
  async function getCategories() {
    try {
      const response = await axios.get("/api/category");

      setCategories(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleCreate() {
    if (!name.trim()) {
      toast.warning("กรุณากรอกชื่อสินค้า");
      return;
    }

    if (!price) {
      toast.warning("กรุณากรอกราคา");
      return;
    }

    if (!categoryId) {
      toast.warning("กรุณาเลือกหมวดหมู่");
      return;
    }

    try {
      const response = await axios.post("/api/product", {
        name,
        description,
        price,
        category_id: Number(categoryId),
        images,
        colors: selectedColors,
        materials: selectedMaterials,
      });

      toast.success(response.data.message || "เพิ่มสินค้าสำเร็จ");

      resetForm();
      getProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  }

  async function handleUpdate() {
    if (!editingId) return;

    if (!name.trim()) {
      toast.warning("กรุณากรอกชื่อสินค้า");
      return;
    }

    if (!price) {
      toast.warning("กรุณากรอกราคา");
      return;
    }

    if (!categoryId) {
      toast.warning("กรุณาเลือกหมวดหมู่");
      return;
    }

    try {
      const response = await axios.put(`/api/product/${editingId}`, {
        name,
        description,
        price,
        category_id: Number(categoryId),
        colors: selectedColors,
        materials: selectedMaterials,
      });

      toast.success(response.data.message || "แก้ไขสินค้าสำเร็จ");

      resetForm();
      getProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  }

  async function handleUploadImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    try {
      setUploading(true);

      for (const file of Array.from(files)) {
        const formData = new FormData();

        formData.append("file", file);

        // 1. Upload Cloudinary
        const response = await axios.post("/api/upload/products", formData);

        const newImage = {
          image_url: response.data.image_url,
          public_id: response.data.public_id,
        };

        // 2. ถ้าเป็นการแก้ไขสินค้า
        if (editingId) {
          await axios.post(`/api/product/${editingId}/image`, {
            image_url: newImage.image_url,
            public_id: newImage.public_id,
            is_primary: images.length === 0,
            sort_order: images.length,
          });
        }

        // 3. เพิ่มเข้า state
        setImages((prev) => [...prev, newImage]);
      }

      toast.success("อัปโหลดรูปสำเร็จ");
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "อัปโหลดรูปไม่สำเร็จ");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDeleteImage(image: {
    id?: number;
    image_url: string;
    public_id: string;
  }) {
    try {
      // รูปเก่าใน Database
      if (image.id) {
        await axios.delete(`/api/product/${image.id}/image`);
      }

      // รูปใหม่ที่ยังไม่ได้บันทึกลง Database
      else {
        await axios.delete("/api/upload/products", {
          data: {
            public_id: image.public_id,
          },
        });
      }

      setImages((prev) =>
        prev.filter((item) => item.public_id !== image.public_id),
      );

      toast.success("ลบรูปสำเร็จ");
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "ลบรูปไม่สำเร็จ");
    }
  }

  function handleEdit(product: Product) {
    setEditingId(product.id);

    setName(product.name);
    setDescription(product.description ?? "");
    setPrice(String(product.price));
    setImages(product.images ?? []);
    setCategoryId(String(product.category_id));

    setSelectedColors(
      product.colors?.map((color) => ({
        id: color.id,
        price: Number(color.price) || 0,
      })) ?? [],
    );

    setSelectedMaterials(
      product.materials?.map((material) => ({
        id: material.id,
        price: Number(material.price) || 0,
      })) ?? [],
    );

    setOpenModal(true);
  }

  async function handleDelete() {
    if (!deleteId) return;

    try {
      const response = await axios.delete(`/api/product/${deleteId}`);

      toast.success(response.data.message || "ลบสินค้าสำเร็จ");

      setOpenDeleteModal(false);
      setDeleteId(null);

      getProducts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  }

  function resetForm() {
    setOpenModal(false);

    setEditingId(null);

    setName("");
    setDescription("");
    setPrice("");
    setImages([]);
    setCategoryId("");

    setSelectedColors([]);
    setSelectedMaterials([]);
  }

  function openAddModal() {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setImages([]);
    setCategoryId("");

    setSelectedColors([]);
    setSelectedMaterials([]);

    setOpenModal(true);
  }

  function openDelete(productId: number) {
    setDeleteId(productId);
    setOpenDeleteModal(true);
  }

  const filteredProducts = products.filter((product) => {
    const matchSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchCategory =
      categoryId === "" || product.category_id === Number(categoryId);

    return matchSearch && matchCategory;
  });

  async function getColors() {
    try {
      const response = await axios.get("/api/materials-colors/colors");
      setColors(response.data.colors || response.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function getMaterials() {
    try {
      const response = await axios.get("/api/materials-colors/materials");
      setMaterials(response.data.materials || response.data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-gray-500">Manage your products</p>
        </div>

        <button
          onClick={() => {
            openAddModal();
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
        >
          + Add Product
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4">
        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 overflow-x-auto py-2">
        {/* All */}
        <button
          onClick={() => setCategoryId("")}
          className={`px-5 py-3 rounded-lg border whitespace-nowrap ${
            categoryId === ""
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white hover:bg-gray-100"
          }`}
        >
          All
        </button>

        {/* Categories */}
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setCategoryId(String(category.id))}
            className={`px-5 py-3 rounded-lg border whitespace-nowrap ${
              categoryId === String(category.id)
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-4">Image</th>
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Colors</th>
              <th className="p-4">Materials</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  {product.images.length > 0 ? (
                    <img
                      src={
                        product.images.find((img) => img.is_primary)
                          ?.image_url || product.images[0].image_url
                      }
                      alt={product.name}
                      className="w-14 h-14 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg border flex items-center justify-center text-gray-400">
                      <AiFillPicture size={28} />
                    </div>
                  )}
                </td>

                <td className="p-4 font-medium">{product.name}</td>

                <td className="p-4">{product.category_name}</td>

                <td className="p-4">฿{product.price.toLocaleString()}</td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {product.colors?.map((color) => (
                      <div
                        key={color.id}
                        className="flex items-center gap-2 rounded-full border px-2 py-1"
                      >
                        {color.image_url ? (
                          <img
                            src={color.image_url}
                            alt={color.name}
                            className="h-8 w-8 rounded-full object-cover border"
                          />
                        ) : (
                          <div
                            className="h-8 w-8 rounded-full border"
                            style={{
                              backgroundColor: color.hex_code || "#ffffff",
                            }}
                          />
                        )}

                        <span className="text-sm">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {product.materials?.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center gap-1 rounded-full border px-2 py-1"
                      >
                        {material.image_url && (
                          <img
                            src={material.image_url}
                            alt={material.name}
                            className="h-8 w-8 rounded-full object-cover border"
                          />
                        )}

                        <span className="text-sm">{material.name}</span>
                      </div>
                    ))}
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => openDelete(product.id)}
                      className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  No products found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b">
              <div>
                <h2 className="text-2xl font-bold">
                  {editingId ? "Edit Product" : "Add Product"}
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Manage product information, colors and materials
                </p>
              </div>

              <button
                onClick={() => setOpenModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto px-6 py-6 space-y-6">
              {/* Product Information */}
              <div className="rounded-xl border bg-gray-50 p-5">
                <h3 className="font-semibold text-lg mb-4">
                  Product Information
                </h3>

                <div className="space-y-4">
                  {/* Product Name */}
                  <div>
                    <label className="block mb-1.5 font-medium">
                      Product Name
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter product name"
                      className="w-full border rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block mb-1.5 font-medium">
                      Description
                    </label>

                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter product description"
                      className="w-full border rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>

                  {/* Price + Category */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1.5 font-medium">Price</label>

                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full border rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block mb-1.5 font-medium">
                        Category
                      </label>

                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>

                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Colors</h3>

                    <p className="text-sm text-gray-500">
                      Select available colors
                    </p>
                  </div>

                  <span className="text-sm text-gray-500">
                    {selectedColors.length} selected
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {colors.map((color) => {
                    const selectedColor = selectedColors.find(
                      (item) => item.id === color.id,
                    );

                    const selected = !!selectedColor;

                    return (
                      <label
                        key={color.id}
                        className={`p-3 rounded-lg border cursor-pointer transition ${
                          selected
                            ? "border-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedColors((prev) => [
                                  ...prev,
                                  {
                                    id: color.id,
                                    price: 0,
                                  },
                                ]);
                              } else {
                                setSelectedColors((prev) =>
                                  prev.filter((item) => item.id !== color.id),
                                );
                              }
                            }}
                            className="w-4 h-4"
                          />

                          {color.image_url ? (
                            <img
                              src={color.image_url}
                              alt={color.name}
                              className="w-9 h-9 rounded-lg object-cover border shrink-0"
                            />
                          ) : (
                            <div
                              className="w-9 h-9 rounded-lg border shrink-0"
                              style={{
                                backgroundColor: color.hex_code || "#ffffff",
                              }}
                            />
                          )}

                          <div className="min-w-0">
                            <p className="font-medium truncate">{color.name}</p>

                            <p className="text-xs text-gray-500 font-mono">
                              {color.hex_code}
                            </p>
                          </div>
                        </div>

                        {selected && (
                          <div className="mt-3">
                            <label className="text-xs text-gray-500">
                              ราคาเพิ่ม
                            </label>

                            <input
                              type="number"
                              min="0"
                              value={selectedColor?.price ?? 0}
                              onChange={(e) => {
                                const price = Number(e.target.value);

                                setSelectedColors((prev) =>
                                  prev.map((item) =>
                                    item.id === color.id
                                      ? {
                                          ...item,
                                          price,
                                        }
                                      : item,
                                  ),
                                );
                              }}
                              className="w-full mt-1 rounded-lg border px-3 py-2 text-sm"
                              placeholder="0"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Materials */}
              <div className="rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">Materials</h3>

                    <p className="text-sm text-gray-500">
                      Select available materials
                    </p>
                  </div>

                  <span className="text-sm text-gray-500">
                    {selectedMaterials.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-1">
                  {materials.map((material) => {
                    const selectedMaterial = selectedMaterials.find(
                      (item) => item.id === material.id,
                    );

                    const selected = !!selectedMaterial;

                    return (
                      <label
                        key={material.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                          selected
                            ? "border-blue-500 bg-blue-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMaterials((prev) => [
                                ...prev,
                                {
                                  id: material.id,
                                  price: 0,
                                },
                              ]);
                            } else {
                              setSelectedMaterials((prev) =>
                                prev.filter((item) => item.id !== material.id),
                              );
                            }
                          }}
                          className="w-4 h-4"
                        />

                        {material.image_url ? (
                          <img
                            src={material.image_url}
                            alt={material.name}
                            className="w-9 h-9 rounded-lg object-cover border shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg border flex items-center justify-center text-gray-400 shrink-0">
                            <AiFillPicture size={18} />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {material.name}
                          </p>

                          {/* ช่องราคา */}
                          {selected && (
                            <div className="mt-3">
                              <label className="text-xs text-gray-500">
                                ราคาเพิ่ม
                              </label>

                              <input
                                type="number"
                                min="0"
                                value={selectedMaterial?.price ?? 0}
                                onChange={(e) => {
                                  const price = Number(e.target.value);

                                  setSelectedMaterials((prev) =>
                                    prev.map((item) =>
                                      item.id === material.id
                                        ? {
                                            ...item,
                                            price,
                                          }
                                        : item,
                                    ),
                                  );
                                }}
                                className="w-full mt-1 rounded-lg border px-3 py-2 text-sm"
                                placeholder="0"
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Product Images */}
              <div className="rounded-xl border bg-white p-5">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">Product Images</h3>

                  <p className="text-sm text-gray-500">
                    Upload images for this product
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadImages}
                  disabled={uploading}
                  className="w-full border rounded-lg px-3 py-2.5"
                />

                {uploading && (
                  <p className="text-sm text-blue-600 mt-2">
                    กำลังอัปโหลดรูป...
                  </p>
                )}

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    {images.map((image, index) => (
                      <div key={image.public_id} className="relative group">
                        <img
                          src={image.image_url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-28 object-cover rounded-lg border"
                        />

                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image)}
                          className="absolute top-1 right-1 w-7 h-7 rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          ×
                        </button>

                        {index === 0 && (
                          <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                            รูปหลัก
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setOpenModal(false)}
                className="px-5 py-2.5 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={editingId ? handleUpdate : handleCreate}
                className="px-5 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                {editingId ? "Update Product" : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}
      {openDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[400px] rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-3">Delete Product</h2>

            <p className="text-gray-600 mb-6">
              คุณแน่ใจหรือไม่ว่าต้องการลบสินค้านี้?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setOpenDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
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
