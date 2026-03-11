import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { strapiPost, strapiGet } from "@/lib/strapiClient";
import { toast } from "sonner";

export type DoctorRole = "Cardiologist" | "Hematologist" | "Nuclear Medicine" | "Genetic Expert" | string;

export interface UserHospital {
    id: number;
    documentId: string;
    name: string;
}

export interface User {
    id: string;
    documentId: string;
    name: string;
    role: DoctorRole;
    phone: string;
    email: string | null;
    hospital: string;
    hospitalData: UserHospital | null;
    avatarFallback: string;
    dataSharingConsent: boolean;
    consentAsked: boolean;
    canInvite: boolean;
}

interface LoginResponse {
    token: string;
    doctor: {
        id: string;
        fullName: string;
        phone: string;
        specialty?: string;
    };
}

interface UserContextType {
    currentUser: User | null;
    isLoading: boolean;
    login: (phone: string, password: string) => Promise<boolean>;
    sendOtp: (phone: string) => Promise<{ success: boolean; message?: string; debug_otp?: string }>;
    verifyLogin: (phone: string, otp: string) => Promise<boolean>;
    logout: () => void;
    updateConsent: (consent: boolean) => Promise<boolean>;
    updateProfile: (data: { phone?: string; hospitalId?: number }) => Promise<boolean>;
    refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
    currentUser: null,
    isLoading: false,
    login: async () => false,
    sendOtp: async () => ({ success: false }),
    verifyLogin: async () => false,
    logout: () => { },
    updateConsent: async () => false,
    updateProfile: async () => false,
    refreshUser: async () => { },
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    const fetchMe = async () => {
        try {
            const token = localStorage.getItem("doctor_token");
            if (!token) {
                setIsLoading(false);
                return;
            }

            const data = await strapiGet<any>("/api/doctors/me");
            setCurrentUser({
                id: data.id,
                documentId: data.documentId || data.id,
                name: data.fullName,
                role: data.specialty || "Doctor",
                phone: data.phone,
                email: data.email || null,
                hospital: data.hospital?.name || "",
                hospitalData: data.hospital || null,
                avatarFallback: getInitials(data.fullName),
                dataSharingConsent: !!data.dataSharingConsent,
                consentAsked: !!data.consentAsked,
                canInvite: !!data.canInvite,
            });
        } catch (error) {
            console.error("Failed to fetch user:", error);
            localStorage.removeItem("doctor_token");
            setCurrentUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    const login = async (phone: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const data = await strapiPost<LoginResponse>("/api/auth/doctor/login", {
                phone,
                password
            });

            if (data.token) {
                localStorage.setItem("doctor_token", data.token);
                await fetchMe();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login failed:", error);
            toast.error("Login failed. Please check your credentials.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const sendOtp = async (phone: string) => {
        setIsLoading(true);
        try {
            const data = await strapiPost<any>("/api/auth/doctor/login-init", { phone });
            return { success: true, debug_otp: data.debug_otp };
        } catch (error) {
            console.error("OTP send failed:", error);
            toast.error("Failed to send OTP. Check phone number.");
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    const verifyLogin = async (phone: string, otp: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const data = await strapiPost<LoginResponse>("/api/auth/doctor/login-verify", {
                phone,
                otp
            });

            if (data.token) {
                localStorage.setItem("doctor_token", data.token);
                await fetchMe();
                return true;
            }
            return false;
        } catch (error) {
            console.error("Login verification failed:", error);
            toast.error("Invalid OTP or expired.");
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const updateConsent = async (consent: boolean): Promise<boolean> => {
        try {
            await strapiPost("/api/auth/doctor/update-consent", { consent });
            setCurrentUser(prev => prev ? { ...prev, dataSharingConsent: consent, consentAsked: true } : null);
            return true;
        } catch (error) {
            console.error("Update consent failed:", error);
            toast.error("Failed to update consent preference.");
            return false;
        }
    };

    const updateProfile = async (data: { phone?: string; hospitalId?: number }): Promise<boolean> => {
        try {
            const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;
            const token = localStorage.getItem("doctor_token");
            const res = await fetch(`${STRAPI_URL}/api/auth/doctor/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update profile");
            // Refresh user data
            await fetchMe();
            return true;
        } catch (error) {
            console.error("Update profile failed:", error);
            toast.error("Failed to update profile.");
            return false;
        }
    };

    const refreshUser = async () => {
        await fetchMe();
    };

    const logout = () => {
        localStorage.removeItem("doctor_token");
        setCurrentUser(null);
        window.location.href = "/login";
    };

    return (
        <UserContext.Provider value={{ currentUser, isLoading, login, logout, sendOtp, verifyLogin, updateConsent, updateProfile, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
