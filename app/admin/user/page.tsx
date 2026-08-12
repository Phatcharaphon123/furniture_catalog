"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  created_at: string;
  is_active: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");

  const [openDeactivateModal, setOpenDeactivateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  async function getUsers() {
    try {
      const response = await axios.get("/api/user");

      setUsers(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  async function handleUpdate() {
    if (!username.trim()) {
      toast.warning("กรุณากรอก Username");
      return;
    }

    if (!email.trim()) {
      toast.warning("กรุณากรอก Email");
      return;
    }

    if (!editingId) return;

    try {
      const response = await axios.put(`/api/user/${editingId}`, {
        username,
        email,
        role,
      });

      toast.success(response.data.message || "แก้ไขข้อมูลสำเร็จ");

      setOpenEditModal(false);
      setEditingId(null);

      setUsername("");
      setEmail("");
      setRole("user");

      getUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  }

  useEffect(() => {
    getUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      (user.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (user.email || "").toLowerCase().includes(search.toLowerCase());
    return matchSearch;
  });

  function handleEdit(user: User) {
    setEditingId(user.id);

    setUsername(user.username);
    setEmail(user.email);
    setRole(user.role);

    setOpenEditModal(true);
  }

  function openDeactivate(id: number) {
    setSelectedUserId(id);
    setOpenDeactivateModal(true);
  }

  async function handleDeactivate() {
    if (!selectedUserId) return;

    try {
      const response = await axios.patch(`/api/user/${selectedUserId}`, {
        is_active: false,
      });

      toast.success(response.data.message || "ปิดการใช้งานบัญชีสำเร็จ");

      setOpenDeactivateModal(false);
      setSelectedUserId(null);

      getUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  }

  async function handleActivate(id: number) {
    try {
      const response = await axios.patch(`/api/user/${id}`, {
        is_active: true,
      });

      toast.success(response.data.message || "เปิดใช้งานบัญชีสำเร็จ");

      getUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาด");
    }
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Users</h1>

        <p className="text-gray-500">Manage registered users</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow p-4">
        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr className="text-left">
              <th className="p-4">ID</th>
              <th className="p-4">Username</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Created</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id} className="border-t hover:bg-gray-50">
                <td className="p-4">{index + 1}</td>

                <td className="p-4 font-medium">{user.username}</td>

                <td className="p-4">{user.email}</td>

                <td className="p-4">{user.role}</td>

                <td className="p-4">
                  {new Date(user.created_at).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Bangkok",
                  })}
                </td>

                <td className="p-4">
                  {user.is_active ? (
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm">
                      Inactive
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    {/* Edit */}
                    <button
                      onClick={() => handleEdit(user)}
                      className="px-3 py-1 rounded bg-yellow-400 hover:bg-yellow-500 text-white"
                    >
                      Edit
                    </button>

                    {/* Activate / Deactivate */}
                    {user.is_active ? (
                      <button
                        onClick={() => openDeactivate(user.id)}
                        className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
                      >
                        ปิดการใช้งาน
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivate(user.id)}
                        className="px-3 py-1 rounded bg-green-500 hover:bg-green-600 text-white"
                      >
                        เปิดใช้งาน
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredUsers.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {openEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold mb-6">Edit User</h2>

            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="block mb-1 font-medium">Username</label>

                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-1 font-medium">Email</label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block mb-1 font-medium">Role</label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setOpenEditModal(false);
                  setEditingId(null);
                }}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {openDeactivateModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[450px] rounded-xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-3">ปิดการใช้งานบัญชี</h2>

            <p className="text-gray-600">
              คุณต้องการปิดการใช้งานบัญชีนี้ใช่หรือไม่?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setOpenDeactivateModal(false);
                  setSelectedUserId(null);
                }}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                ยกเลิก
              </button>

              <button
                onClick={handleDeactivate}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
              >
                ปิดการใช้งาน
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
