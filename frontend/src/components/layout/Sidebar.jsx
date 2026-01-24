import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ items, title, userRole, isOpen, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <motion.div
            initial={{ width: isOpen ? 250 : 80 }}
            animate={{ width: isOpen ? 250 : 80 }}
            className="max-h-screen bg-agri-dark text-white flex flex-col sticky top-0 shadow-2xl z-40"
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-agri-green/30">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="font-bold text-xl tracking-wider text-agri-green"
                        >
                            AGRI<span className="text-white">RENT</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <button onClick={toggleSidebar} className="p-1 hover:bg-white/10 rounded-lg transition">
                    {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-2 px-3">
                {items.map((item) => {
                    const isActive = location.pathname.includes(item.id) || (item.activeCheck && item.activeCheck(location.hash || activeTab)); // Simplified logic
                    // Note: Since we are using single-page 'tabs' logic in current dashboards, 
                    // we'll pass the 'activeTab' and 'setActiveTab' from parent mostly.
                    // Or adapting for the refactor where we might keep the tab logic.

                    return (
                        <button
                            key={item.id}
                            onClick={item.onClick}
                            className={cn(
                                "w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                                item.isActive
                                    ? "bg-agri-green/20 text-agri-green shadow-inner"
                                    : "hover:bg-white/5 text-gray-300 hover:text-white"
                            )}
                        >
                            <item.icon size={22} className={cn("min-w-[22px]", item.isActive ? "text-agri-green" : "text-gray-400 group-hover:text-white")} />

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.span
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="font-medium whitespace-nowrap"
                                    >
                                        {item.label}
                                    </motion.span>
                                )}
                            </AnimatePresence>

                            {!isOpen && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Footer / Profile */}
            <div className="p-4 border-t border-agri-green/30">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-colors text-gray-400"
                >
                    <LogOut size={22} className="min-w-[22px]" />
                    <AnimatePresence>
                        {isOpen && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                Logout
                            </motion.span>
                        )}
                    </AnimatePresence>
                </button>
            </div>
        </motion.div>
    );
};

export { Sidebar };
