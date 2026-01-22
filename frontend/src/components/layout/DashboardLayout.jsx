import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { motion } from 'framer-motion';
import Chatbot from '../Chatbot';
import LanguageDropdown from '../LanguageDropdown'; // Import LanguageDropdown

const DashboardLayout = ({
    children,
    sidebarItems,
    title,
    userRole,
    userName, // New prop
    backgroundImage
}) => {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex min-h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <Sidebar
                items={sidebarItems}
                title={title}
                userRole={userRole}
                isOpen={isSidebarOpen}
                toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col relative overflow-hidden">

                {/* Background Overlay */}
                {backgroundImage && (
                    <div
                        className="absolute inset-0 z-0 opacity-10 pointer-events-none bg-cover bg-center"
                        style={{ backgroundImage: `url(${backgroundImage})` }}
                    />
                )}

                {/* Content Scrollable Area */}
                <main className="flex-1 overflow-y-auto z-10 p-4 md:p-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="max-w-7xl mx-auto space-y-6"
                    >
                        {/* Top Bar with Title and Actions */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
                                <p className="text-gray-500 mt-1">
                                    Welcome back, <span className="font-semibold text-agri-green">{userName || "User"}</span>! Check your dashboard updates.
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <LanguageDropdown />
                            </div>
                        </div>

                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Chatbot Overlay */}
            <Chatbot />
        </div>
    );
};

export { DashboardLayout };
