"use client";
import React from "react";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post("/api/user/register", {
        username,
        email,
        password,
      });
      toast.success(response.data.message || "สมัครสมาชิกสำเร็จ!");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/login");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่";
      toast.error(errorMessage);
    }  finally {
    setIsSubmitting(false);
  }
  }
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-10">
        <p className="text-gray-500 text-center">Create your account</p>

        <h1 className="text-4xl font-bold text-center mt-2 mb-8">Register</h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 font-medium">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
          >
            {isSubmitting ? "กำลังสมัคร..." : "Register"}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-600">
          Already have an account?
          <a
            href="/login"
            className="text-blue-600 font-semibold ml-2 hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
export default RegisterPage;
