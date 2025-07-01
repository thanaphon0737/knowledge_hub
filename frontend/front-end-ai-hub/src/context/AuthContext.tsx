"use client";
import { apiLogin,apiGetProfile,apiLogout } from "@/services/api";
import React, { createContext, useContext, useState, ReactNode } from "react";
interface UserPayload {
    userId: string;
    email: string;
}
interface AuthContextType {
  user: UserPayload | null;
  isAuthenticated: boolean;
  login: (credential: {email:string,password:string}) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: UserPayload | null;
}) => {
  const [user, setUser] = useState<UserPayload | null>(initialUser);

  const login = async (credentials: {email: string, password: string}) => {
    try{

        const token = await apiLogin(credentials);
        
        const response = await apiGetProfile();
        const userProfile = response.data.data;

        setUser(userProfile)
    }catch(err: any){
        console.log(err)
    }
  };

  const logout = async () => {
    await apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context == undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
