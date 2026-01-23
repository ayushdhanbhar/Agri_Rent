import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, AlertCircle, TrendingUp, Settings, BarChart3, Check, X, Shield, ShieldOff } from 'lucide-react';
import Header from './Header';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Filler,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  Filler,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const API_BASE = "http://localhost:8000/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOwners: 0,
    totalFarmers: 0,
    totalDisputes: 0,
    activeRentals: 0,
    platformRevenue: 0,
    pendingDisputes: 0
  });
  const [users, setUsers] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [analytics, setAnalytics] = useState({
    revenueChart: [],
    bookingTrends: [],
    disputeStats: [],
    userDist: [],
    activeUsersTrend: [],
    equipmentGrowth: []
  });

  /* ---------------- FETCH DATA ---------------- */
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/stats`);
      const data = await res.json();
      if (data.data) setStats(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/users`);
      const data = await res.json();
      if (data.data) setUsers(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchEquipment = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/equipment`);
      const data = await res.json();
      if (data.data) setEquipment(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchDisputes = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/disputes/admin/all`);
      const data = await res.json();
      if (data.data) setDisputes(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/admin/analytics`);
      const data = await res.json();
      if (data.data) setAnalytics(data.data);
    } catch (e) { console.error(e); }
  };

  /* ---------------- HANDLERS ---------------- */
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await fetch(`${API_BASE}/v1/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchUsers();
    } catch (e) { console.error(e); }
  };

  const moderateEquipment = async (id, status) => {
    try {
      await fetch(`${API_BASE}/v1/admin/equipment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approval_status: status })
      });
      fetchEquipment();
    } catch (e) { console.error(e); }
  };

  const resolveDispute = async (id, status) => {
    // Determine the summary prompt based on status
    const action = status === 'Resolved' ? 'resolution' : 'rejection';
    const summary = prompt(`Enter ${action} summary for this dispute:`);
    if (!summary) return;

    try {
      await fetch(`${API_BASE}/v1/disputes/admin/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeId: id,
          status: status, // "Resolved" or "Rejected"
          resolution_summary: summary,
          resolved_by: localStorage.getItem("user_id")
        })
      });
      fetchDisputes();
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchStats();
    fetchUsers();
    fetchEquipment();
    fetchDisputes();
    fetchAnalytics();
  }, [navigate]);

  /* ---------------- CHARTS DATA ---------------- */
  const revenueChartData = {
    labels: analytics.revenueChart?.map(d => `Month ${d._id}`) || [],
    datasets: [{
      label: 'Total Revenue (₹)',
      data: analytics.revenueChart?.map(d => d.total) || [],
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1,
      fill: true,
      backgroundColor: 'rgba(75, 192, 192, 0.2)'
    }]
  };

  const userDistData = {
    labels: analytics.userDist?.map(d => d._id.toUpperCase()) || [],
    datasets: [{
      data: analytics.userDist?.map(d => d.count) || [],
      backgroundColor: ['#4CAF50', '#2E7D32', '#FF9800'],
    }]
  };

  const bookingTrendsData = {
    labels: analytics.bookingTrends?.map(d => d._id) || [],
    datasets: [{
      label: 'Bookings',
      data: analytics.bookingTrends?.map(d => d.count) || [],
      borderColor: '#FF9800',
      backgroundColor: 'rgba(255, 152, 0, 0.5)',
      tension: 0.1
    }]
  };

  const disputeStatsData = {
    labels: analytics.disputeStats?.map(d => d._id.toUpperCase()) || [],
    datasets: [{
      label: 'Count',
      data: analytics.disputeStats?.map(d => d.count) || [],
      backgroundColor: ['#F44336', '#FFC107', '#4CAF50'],
    }]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-agri-light via-white to-agri-light">
      <Header title="Admin Dashboard" subtitle="Manage platform operations" icon={Shield} />

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-4 mb-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'equipment', label: 'Moderation', icon: Check },
            { id: 'disputes', label: 'Disputes', icon: AlertCircle },
            { id: 'analytics', label: 'Analytics', icon: TrendingUp },
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
            {/* Main Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Total Users', value: stats.totalUsers, color: 'bg-agri-green' },
                { title: 'Active Rentals', value: stats.activeRentals, color: 'bg-agri-accent' },
                { title: 'Platform Revenue', value: `₹${stats.platformRevenue}`, color: 'from-agri-dark to-agri-green' },
                { title: 'Pending Disputes', value: stats.pendingDisputes, color: 'bg-orange-500' },
              ].map((stat, idx) => (
                <div key={idx} className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-xl shadow-lg`}>
                  <p className="text-gray-100 text-sm mb-2">{stat.title}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Detailed Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { title: 'Total Owners', value: stats.totalOwners, icon: Users, color: 'text-blue-600 bg-blue-50' },
                { title: 'Total Farmers', value: stats.totalFarmers, icon: Users, color: 'text-green-600 bg-green-50' },
                { title: 'Total Disputes', value: stats.totalDisputes, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
                { title: 'Total Equipment', value: equipment.length, icon: Settings, color: 'text-purple-600 bg-purple-50' },
              ].map((stat, idx) => (
                <div key={idx} className={`p-6 rounded-xl shadow-md bg-white border border-gray-100 flex items-center gap-4`}>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-6">Revenue Growth</h3>
                <div className="h-64">
                  <Line options={{ responsive: true, maintainAspectRatio: false }} data={revenueChartData} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-6">User Distribution</h3>
                <div className="h-64 flex justify-center">
                  <Doughnut options={{ maintainAspectRatio: false }} data={userDistData} />
                </div>
              </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-6">Booking Trends (Last 7 Days)</h3>
                <div className="h-64">
                  <Line options={{ responsive: true, maintainAspectRatio: false }} data={bookingTrendsData} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-6">Dispute Resolution Stats</h3>
                <div className="h-64 flex justify-center">
                  <Bar options={{ maintainAspectRatio: false }} data={disputeStatsData} />
                </div>
              </div>
            </div>

            {/* Charts Row 3 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-6">User Growth Trend</h3>
                <div className="h-64">
                  <Line options={{ responsive: true, maintainAspectRatio: false }} data={{
                    labels: analytics.activeUsersTrend?.map(d => `Month ${d._id}`) || [],
                    datasets: [{
                      label: 'New Users',
                      data: analytics.activeUsersTrend?.map(d => d.count) || [],
                      borderColor: '#8E24AA',
                      backgroundColor: 'rgba(142, 36, 170, 0.5)',
                      tension: 0.3
                    }]
                  }} />
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-agri-dark mb-6">Equipment Listings Growth</h3>
                <div className="h-64 flex justify-center">
                  <Line options={{ maintainAspectRatio: false }} data={{
                    labels: analytics.equipmentGrowth?.map(d => `Month ${d._id}`) || [],
                    datasets: [{
                      label: 'New Equipment',
                      data: analytics.equipmentGrowth?.map(d => d.count) || [],
                      borderColor: '#0288D1',
                      backgroundColor: 'rgba(2, 136, 209, 0.5)',
                      tension: 0.3
                    }]
                  }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- USERS --- */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-agri-dark mb-6">User Management</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-semibold">{user.name} ({user.phone})</td>
                      <td className="px-6 py-4 capitalize">{user.role}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.is_active ? 'Active' : 'Banned'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button onClick={() => toggleUserStatus(user._id, user.is_active)} className={`${user.is_active ? 'text-red-500' : 'text-green-500'} font-bold`}>
                          {user.is_active ? 'Ban' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- MODERATION --- */}
        {activeTab === 'equipment' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-agri-dark mb-6">Equipment Moderation</h2>
            <div className="space-y-4">
              {equipment.map(item => (
                <div key={item._id} className="border p-4 rounded-lg flex justify-between items-center hover:shadow-md">
                  <div>
                    <h3 className="font-bold text-lg">{item.equipment_name}</h3>
                    <p className="text-sm text-gray-500">Owner: {item.owner_id?.name || "Unknown"}</p>
                    <p className="text-xs mt-1 bg-gray-100 inline-block px-2 py-1 rounded">Status: {item.approval_status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => moderateEquipment(item._id, 'approved')} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">Approve</button>
                    <button onClick={() => moderateEquipment(item._id, 'rejected')} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Reject</button>
                  </div>
                </div>
              ))}
              {equipment.length === 0 && <p className="text-gray-500">No equipment found.</p>}
            </div>
          </div>
        )}

        {/* --- DISPUTES --- */}
        {activeTab === 'disputes' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-agri-dark mb-6">Disputes</h2>
            <div className="space-y-4">
              {disputes.map(d => (
                <div key={d._id} className="border-l-4 border-orange-500 bg-orange-50/20 p-4 rounded shadow-sm">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-bold">{d.issue_type} <span className="text-xs font-normal text-gray-500">of type {d.role}</span></h3>
                      <p className="text-sm text-gray-600">Raised by: {d.raised_by?.name || "Unknown"}</p>
                      <p className="text-sm mt-2">{d.description}</p>
                      <span className={`text-xs font-bold uppercase mt-2 inline-block px-2 py-1 rounded ${d.status === 'Resolved' ? 'bg-green-100 text-green-800' : d.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {d.status}
                      </span>
                    </div>
                    <div>
                      {d.status !== 'Resolved' && d.status !== 'Rejected' && (
                        <div className="flex gap-2">
                          <button onClick={() => resolveDispute(d._id, 'Resolved')} className="bg-green-600 text-white px-4 py-2 rounded">Resolve</button>
                          <button onClick={() => resolveDispute(d._id, 'Rejected')} className="bg-red-600 text-white px-4 py-2 rounded">Reject</button>
                        </div>
                      )}
                      {d.status === 'Resolved' && (
                        <div className="text-green-600 text-sm font-bold mt-2">Resolved by Admin</div>
                      )}
                      {d.status === 'Rejected' && (
                        <div className="text-red-500 text-sm font-bold mt-2">Rejected by Admin</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {disputes.length === 0 && <p>No disputes found.</p>}
            </div>
          </div>
        )}

        {/* --- ANALYTICS KEPT AS SEPARATE TAB IF NEEDED, BUT MERGED INTO OVERVIEW FOR NOW --- */}
        {/* Reuse overview charts if analytics tab is selected or create more detailed ones */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-agri-dark mb-6">Detailed Analytics</h2>
            <div className="h-96">
              <Bar
                data={{
                  labels: analytics.revenueChart?.map(d => `Month ${d._id}`) || [],
                  datasets: [{
                    label: 'Revenue Trend',
                    data: analytics.revenueChart?.map(d => d.total) || [],
                    backgroundColor: 'rgba(54, 162, 235, 0.5)'
                  }]
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        )}

        {/* --- SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-agri-dark mb-6">Platform Settings</h2>
            <p className="text-gray-500">Settings configuration panel (Implementation dependant on specific config requirements).</p>
            <div className="space-y-6 mt-6">
              {[
                { setting: 'Commission Rate', value: '10%', description: 'Percentage of revenue from each rental' },
                { setting: 'Maintenance Fee', value: '₹50/month', description: 'Platform maintenance charge' },
                { setting: 'Minimum Rental Duration', value: '1 day', description: 'Minimum rental period' },
                { setting: 'Maximum Rental Duration', value: '30 days', description: 'Maximum rental period' },
              ].map((item, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-6 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-agri-dark">{item.setting}</h3>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                  <button className="bg-agri-green text-white px-6 py-2 rounded-lg hover:shadow-lg transition">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
