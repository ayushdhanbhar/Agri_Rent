import React, { useState, useEffect } from "react";
import { LogOut, Globe, Search, Menu, X, Briefcase, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LanguageDropdown from "./LanguageDropdown";
import { HelloFarmersLogoSmall } from "./Logo";

export default function Header({ title, icon: Icon, subtitle, userId, userRole }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="bg-gradient-to-r from-agri-dark to-agri-green text-white p-6 shadow-lg relative z-20">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <HelloFarmersLogoSmall size={32} />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
                        {subtitle && <p className="text-agri-light/90 text-sm md:text-base">{subtitle}</p>}
                        {/* {userId && <p className="text-sm text-agri-light/80 mt-1">User ID: {userId}</p>} */}
                        <p className="text-sm text-agri-light/80 mt-1">Hello, {localStorage.getItem('name') || "Default User"}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Feature 1: Multi-Language Dropdown */}
                    <LanguageDropdown />

                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="hidden md:inline">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
