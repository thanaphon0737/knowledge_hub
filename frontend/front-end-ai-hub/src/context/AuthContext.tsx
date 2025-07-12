"use client";
import { apiLogin,apiGetProfile,apiLogout,apiRegister } from "@/services/api";
import React, { createContext, useContext, useState, ReactNode } from "react";
interface UserPayload {
    userId: string;
    email: string;
}
interface AuthContextType {
  user: UserPayload | null;
  isAuthenticated: boolean;
  login: (credential: {email:string,password:string}) => Promise<void>;
  register: (credential: {email:string,password:string}) => Promise<void>;
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
  const register = async (credentials: { email: string; password: string }) => {
    // 1. Call the register API.
    const response = await apiRegister(credentials);

    // 2. The response now contains the user data directly.
    const newUserProfile = response?.data.data;

    // 3. Update the client-side state immediately.
    setUser(newUserProfile);
  };
  const login = async (credentials: {email: string, password: string}) => {
    try{

        const response = await apiLogin(credentials);
        
        const userProfile = response?.data.data;
        

        setUser(userProfile)
    }catch(err: any){
        console.error(err)
        throw err
    }
  };

  const logout = async () => {
    
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, logout,register }}
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
