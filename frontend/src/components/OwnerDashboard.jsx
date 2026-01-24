import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Star, BarChart3, Settings, MapPin, Plus, Check, X, User, MessageCircle, MoreHorizontal, AlertCircle } from 'lucide-react';
import Header from './Header';
import { getCategoryIcon } from './CategoryIcons';
import { io } from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Category Map for Equipment
const CATEGORY_MAP = {
  "Land Preparation Equipment": ["Tractor", "Power Tiller", "Plough", "Harrow", "Cultivator", "Rotavator", "Subsoiler", "Land Leveler", "Laser Land Leveler"],
  "Sowing & Planting Equipment": ["Seed Drill", "Seed Cum Fertilizer Drill", "Planter", "Rice Transplanter", "Potato Planter", "Maize Planter", "Sugarcane Planter", "Nursery Seeder", "Dibber"],
  "Irrigation Equipment": ["Water Pump", "Drip Irrigation System", "Sprinkler System", "Hose Pipes", "Rain Gun", "Micro Irrigation System", "Submersible Pump", "Centrifugal Pump"],
  "Crop Protection Equipment": ["Knapsack Sprayer", "Boom Sprayer", "Fogger", "Duster", "Weed Cutter", "Brush Cutter", "Drone Sprayer"],
  "Fertilizer & Manure Application": ["Fertilizer Spreader", "Manure Spreader", "Compost Spreader", "Broadcast Sprayer"],
  "Harvesting Equipment": ["Harvester", "Combine Harvester", "Reaper", "Reaper Binder", "Paddy Harvester", "Sugarcane Harvester", "Forage Harvester"],
  "Post-Harvest Equipment": ["Thresher", "Winnower", "Grain Cleaner", "Dehusker", "Paddy Separator", "Maize Separator", "Grain Dryer", "Baler"],
  "Storage & Handling Equipment": ["Grain Storage Bins", "Cold Storage Units", "Silage Bags", "Crates", "Weighing Scale", "Conveyor Belt"],
  "Transport & Material Handling": ["Tractor Trolley", "Trailer", "Farm Cart", "Mini Truck", "Forklift", "Hand Trolley"],
  "Orchard & Plantation Equipment": ["Pruning Machine", "Orchard Sprayer", "Hedge Trimmer", "Fruit Picker", "Mulcher", "Chipper"],
  "Renewable & Smart Farming Equipment": ["Solar Pump", "Soil Moisture Sensor", "Weather Station", "GPS Tracker", "Farm Drone", "Yield Monitor"],
  "Small Tools & Accessories": ["Chainsaw", "Power Weeder", "Auger", "Earth Auger", "Generator", "Pressure Washer"],
};

import PricingSuggestion from './PricingSuggestion';
import ImpactProductivityReport from './ImpactProductivityReport';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const API_BASE = "http://localhost:8000/api";
const SOCKET_URL = "http://localhost:8000";
const maharashtraDistricts = [
  "Ahmednagar",
  "Akola",
  "Amravati",
  "Chhatrapati Sambhajinagar",
  "Beed",
  "Bhandara",
  "Buldhana",
  "Chandrapur",
  "Dhule",
  "Gadchiroli",
  "Gondia",
  "Hingoli",
  "Jalgaon",
  "Jalna",
  "Kolhapur",
  "Latur",
  "Mumbai City",
  "Mumbai Suburban",
  "Nagpur",
  "Nanded",
  "Nandurbar",
  "Nashik",
  "Dharashiv",
  "Palghar",
  "Parbhani",
  "Pune",
  "Raigad",
  "Ratnagiri",
  "Sangli",
  "Satara",
  "Sindhudurg",
  "Solapur",
  "Thane",
  "Wardha",
  "Washim",
  "Yavatmal"
]

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'bookings', 'reviews', 'earnings', 'chat', 'disputes'
  const socket = useRef(null);

  /* ---------------- STATE MANAGEMENT ---------------- */
  const [inventory, setInventory] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [earnings, setEarnings] = useState(0);
  const [activeRentalsCount, setActiveRentalsCount] = useState(0);
  const [bookingStats, setBookingStats] = useState({ confirmed: 0, rejected: 0, pending: 0 });
  const [avgRating, setAvgRating] = useState(0);

  // Chat State
  const [chatUsers, setChatUsers] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);

  // Forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({
    category: "",
    subCategory: "",
    description: "",
    district: "",
    ratePerHour: "",
    ratePerDay: "",
  });

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    taluka: "",
    district: "",
    village: "",
    pincode: "",
    state: ""
  });

  /* ---------------- API CALLS ---------------- */
  const fetchInventory = async (ownerId) => {
    try {
      const res = await fetch(`${API_BASE}/v1/equipments/view/${ownerId}`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setInventory(data.data);
      }
    } catch (err) {
      console.error("Error fetching inventory:", err);
    }
  };

  const fetchBookings = async (ownerId) => {
    try {
      const res = await fetch(`${API_BASE}/v1/bookings/owner/${ownerId}`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setBookings(data.data);

        // Calculate earnings and active rentals
        let totalEarnings = 0;
        let activeCount = 0;
        let confirmedCount = 0;
        let rejectedCount = 0;
        let pendingCount = 0;

        data.data.forEach(booking => {
          if (booking.booking_status === "confirmed" || booking.booking_status === "completed") {
            totalEarnings += booking.total_amount;
          }
          if (booking.booking_status === "confirmed") {
            const now = new Date();
            const start = new Date(booking.start_datetime);
            const end = new Date(booking.end_datetime);
            if (now >= start && now <= end) {
              activeCount++;
            }
            confirmedCount++;
          }
          if (booking.booking_status === "cancelled") rejectedCount++;
          if (booking.booking_status === "pending") pendingCount++;
        });
        setEarnings(totalEarnings);
        setActiveRentalsCount(activeCount);
        setBookingStats({ confirmed: confirmedCount, rejected: rejectedCount, pending: pendingCount });
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const fetchReviews = async (ownerId) => {
    try {
      const res = await fetch(`${API_BASE}/v1/reviews/owner/${ownerId}`);
      const data = await res.json();
      if (data.data && Array.isArray(data.data)) {
        setReviews(data.data);
        // Calc Avg Rating
        if (data.data.length > 0) {
          const sum = data.data.reduce((acc, curr) => acc + curr.rating, 0);
          setAvgRating((sum / data.data.length).toFixed(1));
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  // Chat APIs
  const fetchChatUsers = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/v1/messages/users/${id}`);
      const data = await res.json();
      if (data.data) setChatUsers(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const res = await fetch(`${API_BASE}/v1/messages/${userId}/${otherUserId}`);
      const data = await res.json();
      if (data.data) {
        setMessages(data.data);
        scrollToBottom();
      }
    } catch (e) { console.error(e); }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeChatUser) return;

    const msgData = {
      sender_id: userId,
      receiver_id: activeChatUser.id,
      message: newMessage,
    };

    socket.current.emit("send_message", msgData);
    setMessages([...messages, { ...msgData, content: newMessage, createdAt: new Date() }]); // Optimistic update
    setNewMessage("");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  /* ---------------- HANDLERS ---------------- */
  const handleBookingStatus = async (bookingId, status) => {
    try {
      const res = await fetch(`${API_BASE}/v1/bookings/status/${bookingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchBookings(userId);
      }
    } catch (err) {
      console.error("Error updating booking status:", err);
    }
  };

  const handleAddEquipment = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (e?.stopPropagation) e.stopPropagation();

    // 🚨 HARD BLOCK: prevent HTMLButtonElement from leaking
    if (e && e.target instanceof HTMLElement) {
      e = null;
    }

    try {
      const payload = {
        owner_id: userId,
        category: equipmentForm.category,
        subCategory: equipmentForm.subCategory,
        district: equipmentForm.district,
        description: equipmentForm.description,
        ratePerHour: Number(equipmentForm.ratePerHour),
        ratePerDay: Number(equipmentForm.ratePerDay),
      };
      console.log(payload);
      const res = await fetch(`${API_BASE}/v1/equipments/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowAddModal(false);
        setEquipmentForm({ category: "", subCategory: "", description: "", district: "", ratePerHour: "", ratePerDay: "" });
        fetchInventory(userId);
      } else {
        alert("Failed to add equipment");
        return;
      }

      setShowAddModal(false);
      setEquipmentForm({
        category: "",
        subCategory: "",
        district: "",
        description: "",
        ratePerHour: "",
        ratePerDay: "",
      });

      fetchInventory(userId);
    } catch (err) {
      console.error("Add equipment failed:", err?.message);
    }
  };


  const handleUpdateProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/users/update/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) alert("Profile updated!");
    } catch (e) { console.error(e); }
  };

  const handleDeleteEquipment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this equipment?")) return;
    try {
      const res = await fetch(`${API_BASE}/v1/equipments/delete/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Equipment deleted.");
        fetchInventory(userId);
      }
    } catch (e) { console.error(e); }
  };

  /* ---------------- AUTH + SOCKET ---------------- */
  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('user_id');

    if (!token || storedRole !== 'owner') {
      navigate('/login');
      return;
    }

    setRole(storedRole);
    setUserId(storedUserId || '');
    if (storedUserId) {
      fetchInventory(storedUserId);
      fetchBookings(storedUserId);
      fetchReviews(storedUserId);
      fetchChatUsers(storedUserId);

      // Socket Connection
      socket.current = io(SOCKET_URL);
      socket.current.emit("join_room", storedUserId);

      socket.current.on("receive_message", (msg) => {
        if (activeChatUser && (msg.sender_id === activeChatUser.id || msg.sender_id._id === activeChatUser.id)) {
          setMessages(prev => [...prev, msg]);
          scrollToBottom();
        } else {
          // Refresh chat list to show unread indicator or new top user
          fetchChatUsers(storedUserId);
        }
      });

      socket.current.on("notification", (notif) => {
        if (notif.type === 'new_booking') {
          alert(notif.message);
          fetchBookings(storedUserId);
        } else if (notif.type === 'message') {
          if (!activeChatUser) alert("New message received!");
        }
      });

      return () => socket.current.disconnect();
    }
  }, [navigate]);

  useEffect(() => {
    if (activeChatUser) {
      fetchMessages(activeChatUser.id);
    }
  }, [activeChatUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /* ---------------- CHARTS DATA ---------------- */
  const earningsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'], // Mock-up for now
    datasets: [
      {
        label: 'Weekly Earnings (₹)',
        data: [earnings * 0.2, earnings * 0.3, earnings * 0.4, earnings * 0.1], // Mock distribution
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  const reviewsData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [
      {
        label: 'Rating Count',
        data: [
          reviews.filter(r => r.rating === 1).length,
          reviews.filter(r => r.rating === 2).length,
          reviews.filter(r => r.rating === 3).length,
          reviews.filter(r => r.rating === 4).length,
          reviews.filter(r => r.rating === 5).length,
        ],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      }
    ]
  };

  const [disputes, setDisputes] = useState([]);
  const [newDispute, setNewDispute] = useState({ issue_type: '', description: '' });
  const [smartPricingResult, setSmartPricingResult] = useState(null);
  
  // Equipment Utilization State
  const [allEquipment, setAllEquipment] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const fetchDisputes = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/disputes/my/${userId}`);
      const data = await res.json();
      setDisputes(data.data || []);
    } catch (error) {
      console.error("Error fetching disputes:", error);
    }
  };

  const handleCreateDispute = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newDispute,
        raised_by: userId,
        role: 'Owner'
      };

      const response = await fetch(`${API_BASE}/v1/disputes/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert("Dispute raised successfully");
        setNewDispute({ issue_type: '', description: '' });
        fetchDisputes();
      } else {
        const err = await response.json();
        alert("Failed to raise dispute: " + (err.error || "Unknown"));
      }
    } catch (error) {
      console.error("Error creating dispute:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'disputes' && userId) { // Ensure userId is available before fetching
      fetchDisputes();
    }
  }, [activeTab, userId]); // Add userId to dependency array

  // Fetch equipment for utilization analysis
  useEffect(() => {
    if (activeTab === 'analytics' && userId) {
      const fetchEquipmentUtilization = async () => {
        try {
          const res = await fetch(`${API_BASE}/v1/owner/${userId}`);
          const data = await res.json();
          if (data.data && Array.isArray(data.data)) {
            setAllEquipment(data.data);
            // Set first category as default if equipment exists
            if (data.data.length > 0 && !selectedCategory) {
              const firstCategory = data.data[0].category;
              setSelectedCategory(firstCategory);
            }
          }
        } catch (error) {
          console.error("Error fetching equipment utilization:", error);
        }
      };
      fetchEquipmentUtilization();
    }
  }, [activeTab, userId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-light via-white to-agri-light">
      <Header title="Owner Dashboard" subtitle="Manage your inventory and operations" userId={userId} icon={Briefcase} />

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'inventory', label: 'Inventory', icon: Briefcase },
            { id: 'bookings', label: 'Bookings', icon: MapPin },
            { id: 'messages', label: 'Messages', icon: MessageCircle },
            { id: 'reviews', label: 'Reviews', icon: Star },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'disputes', label: 'Disputes', icon: AlertCircle },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${activeTab === tab.id ? 'bg-agri-green text-white' : 'bg-white text-agri-dark hover:bg-gray-100'}`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* --- OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
              {[
                { title: 'Total Earnings', value: `₹${earnings}`, color: 'from-green-600 to-green-400' },
                { title: 'Confirmed Bookings', value: bookingStats.confirmed, color: 'from-blue-600 to-blue-400' },
                { title: 'Rejected Bookings', value: bookingStats.rejected, color: 'from-red-600 to-red-400' },
                { title: 'Pending Bookings', value: bookingStats.pending, color: 'from-yellow-500 to-yellow-300' },
                { title: 'Avg Rating', value: `${avgRating} ⭐`, color: 'from-purple-600 to-purple-400' },
              ].map((stat, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${stat.color} text-white p-4 rounded-xl shadow-lg transform hover:scale-105 transition`}>
                  <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-6">Earnings Overview</h3>
                <Bar options={{ responsive: true, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Monthly Earnings' } } }} data={earningsData} />
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-6">Ratings Distribution</h3>
                <Bar options={{ responsive: true }} data={reviewsData} />
              </div>
            </div>
          </div>
        )}

        {/* --- INVENTORY --- */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-agri-dark">Equipment Inventory</h2>
              <button onClick={() => setShowAddModal(true)} className="flex gap-2 bg-agri-green text-white px-4 py-2 rounded font-bold">
                <Plus size={20} /> Add Equipment
              </button>
            </div>
            {/* Pricing suggestion for top equipment */}
            {inventory && inventory.length > 0 && (
              <div className="mb-6">
                <PricingSuggestion equipmentId={inventory[0]._id} currentPrice={inventory[0].price_per_day || inventory[0].price_per_hour} region={inventory[0].location || null} utilization={0.5} forecastedDemand={0.5} />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventory.map((item, idx) => (
                <div key={idx} className="border-2 border-agri-light rounded-lg p-6 hover:shadow-lg transition bg-white">
                  <div className="flex items-center justify-center mb-4 bg-gradient-to-br from-agri-light to-agri-cream p-4 rounded-lg">
                    {getCategoryIcon(item.category, 50, '#3d6e2e')}
                  </div>
                  <h3 className="font-bold text-agri-dark mb-2 text-xl text-center">{item.subCategory}</h3>
                  <p className="text-sm text-agri-green font-semibold mb-3 uppercase tracking-wide text-center">{item.category}</p>
                  <p className="text-xs text-gray-600 mb-3 text-center">{item.description}</p>
                  <p className="text-xs text-gray-500 mb-2 text-center">📍 {item.district}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <p className="flex justify-between"><span className="text-gray-600">Price/Hour:</span><span className="font-semibold text-agri-dark">₹{item.ratePerHour}</span></p>
                    <p className="flex justify-between"><span className="text-gray-600">Price/Day:</span><span className="font-semibold text-agri-dark">₹{item.ratePerDay}</span></p>
                  </div>
                  <button onClick={() => handleDeleteEquipment(item._id)} className="w-full mt-2 bg-red-50 text-red-500 border border-red-200 py-2 rounded hover:bg-red-500 hover:text-white transition font-semibold">
                    Delete Equipment
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- BOOKINGS --- */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-agri-dark mb-6">Booking Requests</h2>
            <div className="space-y-4">
              {bookings.length === 0 ? <p className="text-gray-500">No bookings found.</p> :
                bookings.map((booking, idx) => (
                  <div key={idx} className="border-l-4 border-agri-green bg-agri-light/20 p-6 rounded-r-lg hover:shadow-md transition">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-bold text-agri-dark text-lg">{booking.equipment_id?.subCategory || "Unknown Equipment"}</p>
                        <p className="text-gray-800 text-sm font-semibold">Farmer: {booking.farmer_id?.name || "Unknown"} ({booking.farmer_id?.phone})</p>
                        <p className="text-gray-600 text-sm">{new Date(booking.start_datetime).toLocaleDateString()} - {new Date(booking.end_datetime).toLocaleDateString()}</p>
                        <p className="text-gray-600 text-sm">Total: ₹{booking.total_amount}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.booking_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.booking_status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>{booking.booking_status.toUpperCase()}</span>

                        {booking.booking_status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleBookingStatus(booking._id, 'confirmed')} className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600" title="Accept"><Check size={16} /></button>
                            <button onClick={() => handleBookingStatus(booking._id, 'cancelled')} className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600" title="Reject"><X size={16} /></button>
                          </div>
                        )}
                        {(booking.booking_status === 'completed' || booking.booking_status === 'confirmed') && (
                          <button onClick={() => {
                            const rating = prompt("Rate this farmer (1-5):");
                            const comment = prompt("Comment:");
                            if (rating && comment) {
                              fetch(`${API_BASE}/v1/reviews/add`, {
                                method: "POST", headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  booking_id: booking._id,
                                  reviewer_id: userId,
                                  reviewee_id: booking.farmer_id?._id,
                                  equipment_id: booking.equipment_id?._id,
                                  rating: parseInt(rating),
                                  comment
                                })
                              }).then(res => {
                                if (res.ok) alert("Review submitted!");
                              });
                            }
                          }} className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-600">Rate Farmer</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* --- MESSAGES --- */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl shadow-lg h-[600px] flex overflow-hidden">
            {/* User List */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b bg-gray-50 font-bold text-agri-dark">Messages</div>
              {chatUsers.map(u => (
                <div key={u.id} onClick={() => setActiveChatUser(u)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${activeChatUser?.id === u.id ? 'bg-agri-light/30' : ''}`}>
                  <h3 className="font-bold text-agri-dark">{u.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{u.lastMessage}</p>
                </div>
              ))}
              {chatUsers.length === 0 && <div className="p-4 text-gray-500 text-center">No messages yet.</div>}
            </div>
            {/* Chat Window */}
            <div className="flex-1 flex flex-col">
              {activeChatUser ? (
                <>
                  <div className="p-4 border-b font-bold bg-gray-50 flex justify-between">
                    <span>{activeChatUser.name}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                    {messages.map((msg, i) => {
                      const isMe = msg.sender_id === userId || msg.sender_id?._id === userId;
                      return (
                        <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-3 rounded-lg ${isMe ? 'bg-agri-green text-white' : 'bg-white border'}`}>
                            <p>{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? 'text-green-100' : 'text-gray-400'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  <div className="p-4 border-t bg-white flex gap-2">
                    <input value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 border p-2 rounded-lg focus:outline-none focus:border-agri-green" placeholder="Type a message..." />
                    <button onClick={handleSendMessage} className="bg-agri-green text-white px-4 py-2 rounded-lg hover:bg-agri-dark">Send</button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation to start chatting</div>
              )}
            </div>
          </div>
        )}

        {/* --- REVIEWS --- */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-agri-dark mb-6">Customer Reviews</h2>
            <div className="space-y-6">
              {reviews.map((review, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-agri-dark">{review.reviewer_id?.name || "Anonymous"}</h3>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-agri-accent text-agri-accent" />)}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- DISPUTES --- */}
        {activeTab === 'disputes' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-agri-dark mb-4">Raise a Dispute</h3>
              <form onSubmit={handleCreateDispute} className="space-y-4">
                <select
                  className="w-full border p-3 rounded-lg"
                  value={newDispute.issue_type}
                  onChange={e => setNewDispute({ ...newDispute, issue_type: e.target.value })}
                  required
                >
                  <option value="">Select Issue Type</option>
                  <option value="Damage">Equipment Damage</option>
                  <option value="Late Return">Late Return</option>
                  <option value="Payment">Payment Issue</option>
                  <option value="Other">Other</option>
                </select>
                <textarea
                  placeholder="Describe the issue in detail..."
                  className="w-full border p-3 rounded-lg h-32"
                  value={newDispute.description}
                  onChange={e => setNewDispute({ ...newDispute, description: e.target.value })}
                  required
                />
                <button type="submit" className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 font-bold w-full md:w-auto">
                  Submit Dispute
                </button>
              </form>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-agri-dark mb-4">My Disputes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-gray-600 uppercase text-xs">
                      <th className="p-3 border-b">ID</th>
                      <th className="p-3 border-b">Booking ID</th>
                      <th className="p-3 border-b">Issue</th>
                      <th className="p-3 border-b">Status</th>
                      <th className="p-3 border-b">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {disputes.map(d => (
                      <tr key={d._id} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-mono text-xs text-gray-500">{d._id.slice(-6)}</td>
                        <td className="p-3">{d.booking_id?.slice(-6) || 'N/A'}</td>
                        <td className="p-3 capitalize">{d.issue_type?.replace('_', ' ') || 'N/A'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${d.status === 'resolved' ? 'bg-green-100 text-green-700' :
                            d.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                            {d.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500 text-sm">
                          {new Date(d.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {disputes.length === 0 && <tr><td colSpan="5" className="p-4 text-center text-gray-500">No disputes found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- ANALYTICS --- */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Smart Pricing */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-4">Smart Pricing Engine</h3>
                <div className="space-y-4">
                  <input placeholder="Equipment Name (e.g. Tractor)" className="w-full border p-3 rounded-lg" id="sp_eq" />
                  <input placeholder="District" className="w-full border p-3 rounded-lg" id="sp_dist" />
                  <button onClick={async () => {
                    const eq = document.getElementById("sp_eq").value;
                    const dist = document.getElementById("sp_dist").value;
                    if (!eq || !dist) return alert("Enter details");
                    try {
                      const res = await fetch(`http://localhost:5000/smart-pricing`, {
                        method: "POST", headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ equipment: eq, district: dist })
                      });
                      const data = await res.json();
                      setSmartPricingResult(data);
                    } catch (e) { console.error(e); alert("Error fetching price suggestion"); }
                  }} className="w-full bg-agri-green text-white py-3 rounded-lg font-bold">Get Price Suggestion</button>
                  {smartPricingResult && (
                    <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg border border-agri-green">
                      <h4 className="font-bold text-agri-dark mb-3">Pricing Recommendation</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Suggested Price:</span>
                          <span className="font-bold text-agri-green text-lg">₹{smartPricingResult.suggested_price}/day</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Market Average:</span>
                          <span className="font-bold text-gray-900 text-lg">₹{smartPricingResult.market_average}/day</span>
                        </div>
                        {/* <div className="flex justify-between items-center">
                          <span className="text-gray-700">Currency:</span>
                          <span className="font-semibold">{smartPricingResult.currency}</span>
                        </div> */}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Impact Analytics */}
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-4">Impact Analytics</h3>
                <div className="space-y-4">
                  <p className="text-gray-600 mb-2">Estimate cost savings and productivity impact for farmers using your equipment. Generate a detailed, academic-style report below.</p>
                  <ImpactProductivityReport allEquipment={allEquipment} bookings={bookings} />
                </div>
              </div>
            </div>

            {/* Equipment Utilization */}
            {allEquipment.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-6">Equipment Utilization</h3>
                
                {/* Category Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-agri-dark mb-2">Select Equipment Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border-2 border-agri-green p-3 rounded-lg font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-agri-green"
                  >
                    <option value="">-- Select a Category --</option>
                    {Object.keys(CATEGORY_MAP).map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Bar Chart */}
                {selectedCategory && (
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border border-agri-green">
                    {(() => {
                      // Filter equipment by selected category
                      const categoryEquipment = allEquipment.filter(eq => eq.category === selectedCategory);
                      
                      // Count equipment by subCategory
                      const equipmentCount = {};
                      categoryEquipment.forEach(eq => {
                        equipmentCount[eq.subCategory] = (equipmentCount[eq.subCategory] || 0) + 1;
                      });

                      const chartData = {
                        labels: Object.keys(equipmentCount),
                        datasets: [
                          {
                            label: 'Equipment Count',
                            data: Object.values(equipmentCount),
                            backgroundColor: 'rgba(34, 197, 94, 0.6)',
                            borderColor: 'rgba(34, 197, 94, 1)',
                            borderWidth: 2,
                            borderRadius: 8,
                            hoverBackgroundColor: 'rgba(34, 197, 94, 0.8)',
                          }
                        ]
                      };

                      const chartOptions = {
                        responsive: true,
                        plugins: {
                          legend: {
                            display: true,
                            labels: {
                              color: 'rgba(0, 0, 0, 0.7)',
                              font: { size: 12, weight: 'bold' }
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 13, weight: 'bold' },
                            bodyFont: { size: 12 }
                          }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1, color: 'rgba(0, 0, 0, 0.6)' },
                            grid: { color: 'rgba(0, 0, 0, 0.1)' }
                          },
                          x: {
                            ticks: { color: 'rgba(0, 0, 0, 0.6)' },
                            grid: { display: false }
                          }
                        }
                      };

                      return (
                        <div>
                          {categoryEquipment.length > 0 ? (
                            <>
                              <Bar data={chartData} options={chartOptions} />
                              <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                                <h4 className="font-bold text-agri-dark mb-3">Summary</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-gray-600 text-sm">Total Equipment</p>
                                    <p className="text-2xl font-bold text-agri-green">{categoryEquipment.length}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600 text-sm">Equipment Types</p>
                                    <p className="text-2xl font-bold text-agri-green">{Object.keys(equipmentCount).length}</p>
                                  </div>
                                </div>
                              </div>
                            </>
                          ) : (
                            <p className="text-center text-gray-500 py-8">No equipment found in this category</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {!selectedCategory && (
                  <p className="text-center text-gray-500 py-8">Select a category to view equipment utilization chart</p>
                )}
              </div>
            )}
          </div>
        )}


        {/* --- SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-agri-dark mb-6">Update Profile</h2>
            <div className="space-y-4 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-2">Name</label><input name="name" onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Full Name" /></div>
                <div><label className="block text-sm font-semibold mb-2">Phone</label><input name="phone" onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Phone" /></div>
              </div>
              <div><label className="block text-sm font-semibold mb-2">Email</label><input name="email" onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="Email" /></div>
              <div><label className="block text-sm font-semibold mb-2">State</label><input name="state" onChange={e => setProfileForm({ ...profileForm, state: e.target.value })} className="w-full px-4 py-2 border rounded-lg" placeholder="State" /></div>
              <button onClick={handleUpdateProfile} className="bg-agri-green text-white px-8 py-3 rounded-lg hover:shadow-lg transition font-semibold">Save Changes</button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-2xl">
            <h2 className="font-bold text-xl mb-4 text-agri-dark">Add New Equipment</h2>
            
            <select 
              name="category" 
              className="w-full border-2 p-3 rounded-lg mb-3" 
              value={equipmentForm.category} 
              onChange={e => setEquipmentForm({ ...equipmentForm, category: e.target.value, subCategory: "" })}
            >
              <option value="">Select Category</option>
              <option value="Land Preparation Equipment">Land Preparation Equipment</option>
              <option value="Sowing & Planting Equipment">Sowing & Planting Equipment</option>
              <option value="Irrigation Equipment">Irrigation Equipment</option>
              <option value="Crop Protection Equipment">Crop Protection Equipment</option>
              <option value="Fertilizer & Manure Application">Fertilizer & Manure Application</option>
              <option value="Harvesting Equipment">Harvesting Equipment</option>
              <option value="Post-Harvest Equipment">Post-Harvest Equipment</option>
              <option value="Storage & Handling Equipment">Storage & Handling Equipment</option>
              <option value="Transport & Material Handling">Transport & Material Handling</option>
              <option value="Orchard & Plantation Equipment">Orchard & Plantation Equipment</option>
              <option value="Renewable & Smart Farming Equipment">Renewable & Smart Farming Equipment</option>
              <option value="Small Tools & Accessories">Small Tools & Accessories</option>
            </select>

            {equipmentForm.category && (
              <select 
                name="subCategory" 
                className="w-full border-2 p-3 rounded-lg mb-3" 
                value={equipmentForm.subCategory} 
                onChange={e => setEquipmentForm({ ...equipmentForm, subCategory: e.target.value })}
              >
                <option value="">Select Equipment Type</option>
                {equipmentForm.category === "Land Preparation Equipment" && ["Tractor", "Power Tiller", "Plough", "Harrow", "Cultivator", "Rotavator", "Subsoiler", "Land Leveler", "Laser Land Leveler"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                {equipmentForm.category === "Sowing & Planting Equipment" && ["Seed Drill", "Seed Cum Fertilizer Drill", "Planter", "Rice Transplanter", "Potato Planter", "Maize Planter", "Sugarcane Planter", "Nursery Seeder", "Dibber"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                {equipmentForm.category === "Irrigation Equipment" && ["Water Pump", "Drip Irrigation System", "Sprinkler System", "Hose Pipes", "Rain Gun", "Micro Irrigation System", "Submersible Pump", "Centrifugal Pump"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                {equipmentForm.category === "Crop Protection Equipment" && ["Knapsack Sprayer", "Boom Sprayer", "Fogger", "Duster", "Weed Cutter", "Brush Cutter", "Drone Sprayer"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                {equipmentForm.category === "Fertilizer & Manure Application" && ["Fertilizer Spreader", "Manure Spreader", "Compost Spreader", "Broadcast Sprayer"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                {equipmentForm.category === "Harvesting Equipment" && ["Harvester", "Combine Harvester", "Reaper", "Reaper Binder", "Paddy Harvester", "Sugarcane Harvester", "Forage Harvester"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                {equipmentForm.category === "Post-Harvest Equipment" && ["Thresher", "Winnower", "Grain Cleaner", "Dehusker", "Paddy Separator", "Maize Separator", "Grain Dryer", "Baler"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                {equipmentForm.category === "Storage & Handling Equipment" && ["Grain Storage Bins", "Cold Storage Units", "Silage Bags", "Crates", "Weighing Scale", "Conveyor Belt"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                {equipmentForm.category === "Transport & Material Handling" && ["Tractor Trolley", "Trailer", "Farm Cart", "Mini Truck", "Forklift", "Hand Trolley"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                {equipmentForm.category === "Orchard & Plantation Equipment" && ["Pruning Machine", "Orchard Sprayer", "Hedge Trimmer", "Fruit Picker", "Mulcher", "Chipper"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                {equipmentForm.category === "Renewable & Smart Farming Equipment" && ["Solar Pump", "Soil Moisture Sensor", "Weather Station", "GPS Tracker", "Farm Drone", "Yield Monitor"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
                {equipmentForm.category === "Small Tools & Accessories" && ["Chainsaw", "Power Weeder", "Auger", "Earth Auger", "Generator", "Pressure Washer"].map(sub => <option key={sub} value={sub}>{sub}</option>)}
              </select>
            )}

           <select
  name="district"
  className="w-full border-2 p-3 rounded-lg mb-3 bg-white"
  value={equipmentForm.district}
  onChange={e =>
    setEquipmentForm({ ...equipmentForm, district: e.target.value })
  }
  required
>
  <option value="">Select District</option>

  {maharashtraDistricts.map((district, index) => (
    <option key={index} value={district}>
      {district}
    </option>
  ))}
</select>


            <textarea 
              name="description" 
              placeholder="Description" 
              className="w-full border-2 p-3 rounded-lg mb-3" 
              value={equipmentForm.description} 
              onChange={e => setEquipmentForm({ ...equipmentForm, description: e.target.value })} 
            />

            <div className="flex gap-4 mb-6">
              <input 
                name="ratePerHour" 
                type="number" 
                placeholder="₹/hr" 
                className="w-full border-2 p-3 rounded-lg" 
                value={equipmentForm.ratePerHour} 
                onChange={e => setEquipmentForm({ ...equipmentForm, ratePerHour: e.target.value })} 
              />
              <input 
                name="ratePerDay" 
                type="number" 
                placeholder="₹/day" 
                className="w-full border-2 p-3 rounded-lg" 
                value={equipmentForm.ratePerDay} 
                onChange={e => setEquipmentForm({ ...equipmentForm, ratePerDay: e.target.value })} 
              />
            </div>

            <div className="flex justify-end gap-3">

              <button onClick={() => setShowAddModal(false)} className="px-6 py-2 rounded-lg border hover:bg-gray-100">Cancel</button>
              <button type="button"
                onClick={() => handleAddEquipment()}
                className="px-6 py-2 rounded-lg bg-agri-green text-white">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
