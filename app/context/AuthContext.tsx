"use client";

import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

type User = {
  id: number;
  username: string;
  email: string;
  role: string;
  profile_image: string | null;
};

type AuthContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        const response = await axios.get("/api/user/profile");

        setUser(response.data.user);
      } catch (error) {
        console.log("ยังไม่ได้เข้าสู่ระบบ");
        setUser(null);
      }
    }

    getProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth ต้องอยู่ภายใน AuthProvider");
  }

  return context;
}