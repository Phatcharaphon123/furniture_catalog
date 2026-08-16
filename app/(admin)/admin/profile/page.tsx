"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoPersonCircleOutline } from "react-icons/io5";
import { FiMail, FiShield, FiEdit } from "react-icons/fi";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  profile_image: string | null;
  profile_image_public_id: string | null;
}

export default function ProfileAdminPage() {
  const { user: authUser, setUser: setAuthUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [changingPassword, setChangingPassword] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);

  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function getUser() {
      if (!authUser?.id) return;

      try {
        const response = await axios.get(`/api/user/${authUser.id}`);

        setUser(response.data.user);
      } catch (error) {
        console.error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ", error);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, [authUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <p className="text-gray-500">กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <p className="text-red-500">ไม่พบข้อมูลผู้ใช้</p>
      </div>
    );
  }

  function openEditModal() {
    if (!user) return;

    setEditUsername(user.username);
    setEditEmail(user.email);

    setSelectedImage(null);
    setImagePreview(user.profile_image);

    setShowEditModal(true);
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.warning("กรุณาเลือกไฟล์รูปภาพ");
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleUpdateProfile() {
    if (!user?.id) return;

    if (!editUsername || !editEmail) {
      toast.warning("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    try {
      setSaving(true);

      let profileImage = user.profile_image;
      let profileImagePublicId = user.profile_image_public_id;

      // เก็บ public_id เก่าไว้ก่อน
      const oldPublicId = user.profile_image_public_id;

      // ถ้าเลือกรูปใหม่
      if (selectedImage) {
        const formData = new FormData();
        formData.append("file", selectedImage);

        const uploadResponse = await axios.post("/api/user/upload", formData);

        profileImage = uploadResponse.data.image_url;
        profileImagePublicId = uploadResponse.data.public_id;
      }

      // อัปเดต Database
      const response = await axios.put(`/api/user/${user.id}`, {
        username: editUsername,
        email: editEmail,
        role: user.role,
        profile_image: profileImage,
        profile_image_public_id: profileImagePublicId,
      });

      setUser(response.data.user);
      setAuthUser(response.data.user);

      // ถ้าเปลี่ยนรูปสำเร็จ ค่อยลบรูปเก่า
      if (selectedImage && oldPublicId) {
        await axios.delete("/api/user/upload", {
          data: {
            public_id: oldPublicId,
          },
        });
      }

      toast.success(response.data.message);

      setSelectedImage(null);
      setImagePreview(null);
      setShowEditModal(false);
    } catch (error: any) {
      console.error(error);

      toast.error(error.response?.data?.message || "แก้ไขข้อมูลไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!user?.id) return;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.warning("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.warning("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    try {
      setChangingPassword(true);

      const response = await axios.put(`/api/user/${user.id}/password`, {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      toast.success(response.data.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowPasswordModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ");
    } finally {
      setChangingPassword(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">บัญชีผู้ดูแล</h1>

          <p className="mt-1 text-sm text-gray-500">
            จัดการข้อมูลบัญชีและข้อมูลผู้ดูแลระบบ
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Profile Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center">
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="Profile"
                  className="h-[110px] w-[110px] bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-300 rounded-full object-cover"
                />
              ) : (
                <IoPersonCircleOutline size={110} className="text-gray-400" />
              )}

              <h2 className="mt-4 text-xl font-bold text-gray-800">
                {user.username}
              </h2>

              <p className="mt-1 text-sm text-gray-500">{user.role}</p>

              <button
                onClick={openEditModal}
                className="mt-5 flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm text-white transition hover:bg-gray-800"
              >
                <FiEdit />
                แก้ไขข้อมูล
              </button>
            </div>
          </div>

          {/* Account Information */}
          <div className="rounded-2xl bg-white p-6 shadow-sm md:col-span-2">
            <h2 className="mb-5 text-lg font-bold text-gray-800">
              ข้อมูลบัญชี
            </h2>

            <div className="space-y-5">
              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  ชื่อผู้ใช้
                </label>

                <div className="flex items-center gap-3 rounded-lg border bg-gray-50 px-4 py-3">
                  <IoPersonCircleOutline className="text-gray-400" size={22} />

                  <span className="text-gray-800">{user.username}</span>
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  อีเมล
                </label>

                <div className="flex items-center gap-3 rounded-lg border bg-gray-50 px-4 py-3">
                  <FiMail className="text-gray-400" size={20} />

                  <span className="text-gray-800">{user.email}</span>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  สิทธิ์การใช้งาน
                </label>

                <div className="flex items-center gap-3 rounded-lg border bg-gray-50 px-4 py-3">
                  <FiShield className="text-gray-400" size={20} />

                  <span className="font-medium text-gray-800">{user.role}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800">ความปลอดภัย</h2>

          <p className="mt-1 text-sm text-gray-500">
            จัดการรหัสผ่านและความปลอดภัยของบัญชี
          </p>

          <div className="mt-5 flex items-center justify-between rounded-xl border p-4">
            <div>
              <p className="font-medium text-gray-800">รหัสผ่าน</p>

              <p className="text-sm text-gray-500">
                เปลี่ยนรหัสผ่านของบัญชีผู้ดูแล
              </p>
            </div>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </div>
      </div>
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                เปลี่ยนรหัสผ่าน
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                กรอกรหัสผ่านเดิมและรหัสผ่านใหม่
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  รหัสผ่านเดิม
                </label>

                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                  placeholder="กรอกรหัสผ่านเดิม"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  รหัสผ่านใหม่
                </label>

                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                  placeholder="กรอกรหัสผ่านใหม่"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  ยืนยันรหัสผ่านใหม่
                </label>

                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="rounded-lg bg-black px-5 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {changingPassword ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800">
              แก้ไขข้อมูลบัญชี
            </h2>

            <p className="mt-1 text-sm text-gray-500">แก้ไขข้อมูลผู้ดูแลระบบ</p>

            <div className="mt-6 space-y-4">
              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  ชื่อผู้ใช้
                </label>

                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                  placeholder="ชื่อผู้ใช้"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  อีเมล
                </label>

                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border px-4 py-3 outline-none focus:border-black"
                  placeholder="อีเมล"
                />
              </div>

              {/* Profile Image */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  รูปโปรไฟล์
                </label>

                <div className="flex items-center gap-4">
                  {/* Preview */}
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="h-20 w-20 bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-300 rounded-full object-cover"
                    />
                  ) : (
                    <IoPersonCircleOutline
                      size={80}
                      className="text-gray-400"
                    />
                  )}

                  {/* File Input */}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="text-sm"
                    />

                    <p className="mt-1 text-xs text-gray-500">JPG, PNG, WEBP</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleUpdateProfile}
                disabled={saving}
                className="rounded-lg bg-black px-5 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
