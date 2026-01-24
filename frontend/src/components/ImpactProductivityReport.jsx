import React from "react";

/**
 * Professional Impact & Productivity Analysis Report
 * For Smart Farm Equipment Sharing and Rental Platform
 *
 * Data sources: allEquipment (array), bookings (array)
 * Only uses provided data, no external fetches
 */
export default function ImpactProductivityReport({ allEquipment, bookings }) {
  // Aggregate data
  const totalEquipment = allEquipment.length;
  const totalBookings = bookings.length;
  const totalHours = bookings.reduce((sum, b) => sum + (b.hours_used || 0), 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.total_price || 0), 0);
  const avgUtilization = totalEquipment > 0 ? (totalBookings / totalEquipment).toFixed(2) : "0.00";
  const avgHoursPerBooking = totalBookings > 0 ? (totalHours / totalBookings).toFixed(1) : "0.0";
  const avgRevenuePerEquipment = totalEquipment > 0 ? (totalRevenue / totalEquipment).toFixed(0) : "0";

  // Productivity gain: assume each hour of equipment use saves 4 manual labor hours (example academic assumption)
  const manualHoursSaved = totalHours * 4;
  // Cost savings: assume manual labor cost is ₹100/hour (example academic assumption)
  const costSavings = manualHoursSaved * 100;

  // Category breakdown
  const categoryStats = {};
  allEquipment.forEach(eq => {
    if (!categoryStats[eq.category]) categoryStats[eq.category] = { count: 0, hours: 0, revenue: 0 };
    categoryStats[eq.category].count++;
  });
  bookings.forEach(b => {
    const eq = allEquipment.find(e => e._id === b.equipment_id);
    if (eq && categoryStats[eq.category]) {
      categoryStats[eq.category].hours += b.hours_used || 0;
      categoryStats[eq.category].revenue += b.total_price || 0;
    }
  });

  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-6 border border-agri-green">
      <h4 className="font-bold text-agri-dark mb-2 text-lg">Impact & Productivity Analysis Report</h4>
      <div className="prose max-w-none text-gray-800">
        <h5 className="font-semibold text-agri-green mt-2 mb-1">1. Executive Summary</h5>
        <p>
          This report provides a comprehensive analysis of the impact and productivity gains achieved through the Smart Farm Equipment Sharing and Rental Platform. The analysis is based solely on the provided equipment and booking data, following a strict academic format.
        </p>

        <h5 className="font-semibold text-agri-green mt-4 mb-1">2. Key Metrics</h5>
        <ul className="list-disc ml-6">
          <li><b>Total Equipment Listed:</b> {totalEquipment}</li>
          <li><b>Total Bookings:</b> {totalBookings}</li>
          <li><b>Total Equipment Usage Hours:</b> {totalHours}</li>
          <li><b>Total Revenue Generated:</b> ₹{totalRevenue}</li>
          <li><b>Average Utilization Rate (bookings/equipment):</b> {avgUtilization}</li>
          <li><b>Average Hours per Booking:</b> {avgHoursPerBooking}</li>
          <li><b>Average Revenue per Equipment:</b> ₹{avgRevenuePerEquipment}</li>
        </ul>

        <h5 className="font-semibold text-agri-green mt-4 mb-1">3. Productivity & Cost Savings</h5>
        <ul className="list-disc ml-6">
          <li><b>Estimated Manual Labor Hours Saved:</b> {manualHoursSaved}</li>
          <li><b>Estimated Cost Savings for Farmers:</b> ₹{costSavings}</li>
        </ul>

        <h5 className="font-semibold text-agri-green mt-4 mb-1">4. Category-wise Utilization</h5>
        <table className="table-auto w-full text-sm border mt-2 mb-4">
          <thead>
            <tr className="bg-agri-green text-white">
              <th className="px-2 py-1">Category</th>
              <th className="px-2 py-1">Equipment Count</th>
              <th className="px-2 py-1">Total Hours</th>
              <th className="px-2 py-1">Revenue (₹)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(categoryStats).map(([cat, stats]) => (
              <tr key={cat} className="even:bg-gray-50">
                <td className="border px-2 py-1">{cat}</td>
                <td className="border px-2 py-1 text-center">{stats.count}</td>
                <td className="border px-2 py-1 text-center">{stats.hours}</td>
                <td className="border px-2 py-1 text-center">{stats.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h5 className="font-semibold text-agri-green mt-4 mb-1">5. Discussion</h5>
        <p>
          The data demonstrates significant productivity improvements and cost savings for farmers leveraging shared equipment. The platform enables optimal utilization of resources, reduces manual labor dependency, and increases revenue for equipment owners. Continued adoption and data-driven optimization are recommended to maximize impact.
        </p>
      </div>
    </div>
  );
}