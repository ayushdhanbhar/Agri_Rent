import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { io } from "socket.io-client";

// Fix default marker icon paths for Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).toString(),
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
});

const API_BASE = "http://localhost:8000/api";
const SOCKET_URL = "http://localhost:8000";

export default function EquipmentMap({ district }) {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const qs = district ? `?district=${encodeURIComponent(district)}` : "";
        const res = await fetch(`${API_BASE}/v1/equipments/map${qs}`);
        const data = await res.json();
        if (!cancelled) setEquipments(data.data || []);
      } catch (e) {
        if (!cancelled) setEquipments([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [district]);

  // Socket.IO for real-time updates
  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on("connect", () => {
      console.log("EquipmentMap connected to socket:", socket.id);
    });

    socket.on("equipment_location_update", (updatedData) => {
      console.log("Received location update:", updatedData);
      setEquipments((prev) => {
        return prev.map((eq) => {
          if (eq._id === updatedData.equipment_id) {
            return {
              ...eq,
              location: updatedData.location,
              location_label: updatedData.location_label,
            };
          }
          return eq;
        });
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const points = useMemo(() => {
    return (equipments || [])
      .map((e) => {
        const coords = e.location?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) return null;
        const [lng, lat] = coords;
        if (typeof lat !== "number" || typeof lng !== "number") return null;
        return { ...e, lat, lng };
      })
      .filter(Boolean);
  }, [equipments]);

  const center = points.length ? [points[0].lat, points[0].lng] : [18.5204, 73.8567]; // Pune fallback

  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden border bg-white shadow-sm">
      {loading && <div className="p-4 text-sm text-gray-600">Loading map…</div>}
      <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((e) => (
          <Marker key={e._id} position={[e.lat, e.lng]}>
            <Popup>
              <div className="space-y-1">
                <div className="font-bold">{e.equipment_name}</div>
                <div className="text-xs text-gray-600">{e.category}</div>
                <div className="text-xs text-gray-600">{e.location_label || e.district}</div>
                <div className="text-xs">
                  ₹{e.price_per_hour}/hr · ₹{e.price_per_day}/day
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

