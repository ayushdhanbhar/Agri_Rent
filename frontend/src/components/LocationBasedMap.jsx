import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';

// You'll need to get a Mapbox access token from https://account.mapbox.com/
// Add it to your .env file as VITE_MAPBOX_ACCESS_TOKEN=your_token_here
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example'; // Replace with your actual token

const API_BASE = "http://localhost:8000/api";

export default function LocationBasedMap({ farmerId }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [farmerLocation, setFarmerLocation] = useState(null);
  const [nearbyOwners, setNearbyOwners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Mapbox
  useEffect(() => {
    if (map.current) return; // initialize map only once

    if (!MAPBOX_ACCESS_TOKEN || MAPBOX_ACCESS_TOKEN.includes('example')) {
      setError('Mapbox access token not configured. Please add VITE_MAPBOX_ACCESS_TOKEN to your .env file.');
      setLoading(false);
      return;
    }

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [78.9629, 20.5937], // Center of India
      zoom: 5
    });

    // Add navigation control
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add geocoder
    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      placeholder: 'Search location...'
    });
    map.current.addControl(geocoder, 'top-left');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Geocode an address to coordinates
  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        return { lat, lng };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Fetch farmer location and nearby owners
  useEffect(() => {
    const fetchLocations = async () => {
      if (!farmerId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch farmer details
        const farmerRes = await fetch(`${API_BASE}/v1/users/${farmerId}`);
        const farmerData = await farmerRes.json();

        if (!farmerData.data) {
          setError('Failed to fetch farmer location');
          return;
        }

        const farmer = farmerData.data;
        // Build farmer address with available location data
        const addressParts = [farmer.village, farmer.taluka, farmer.district, farmer.state].filter(Boolean);
        const farmerAddress = `${addressParts.join(', ')}, ${farmer.pincode}, India`;

        // Geocode farmer address
        const farmerCoords = await geocodeAddress(farmerAddress);
        if (!farmerCoords) {
          setError('Could not geocode farmer address');
          return;
        }

        setFarmerLocation({
          ...farmerCoords,
          address: farmerAddress,
          name: farmer.name
        });

        // Fetch all equipment with owner details
        const equipmentRes = await fetch(`${API_BASE}/v1/equipments/fetch`);
        const equipmentData = await equipmentRes.json();

        if (!equipmentData.data) {
          setError('Failed to fetch equipment data');
          return;
        }

        // Group equipment by owner and geocode owner locations
        const ownerMap = new Map();

        for (const equipment of equipmentData.data) {
          const owner = equipment.owner_id;
          if (!owner) continue;

          const ownerKey = owner._id;
          if (!ownerMap.has(ownerKey)) {
            // Build owner address with available location data
            const ownerAddressParts = [owner.village, owner.taluka, owner.district, owner.state].filter(Boolean);
            const ownerAddress = `${ownerAddressParts.join(', ')}, ${owner.pincode}, India`;

            const ownerCoords = await geocodeAddress(ownerAddress);
            if (ownerCoords) {
              const distance = calculateDistance(
                farmerCoords.lat, farmerCoords.lng,
                ownerCoords.lat, ownerCoords.lng
              );

              // Only include owners within 50km radius
              if (distance <= 50) {
                ownerMap.set(ownerKey, {
                  ...ownerCoords,
                  address: ownerAddress,
                  name: owner.name,
                  distance: Math.round(distance * 10) / 10, // Round to 1 decimal
                  equipment: []
                });
              }
            }
          }

          // Add equipment to owner's list
          if (ownerMap.has(ownerKey)) {
            ownerMap.get(ownerKey).equipment.push(equipment);
          }
        }

        const nearbyOwnersArray = Array.from(ownerMap.values());
        setNearbyOwners(nearbyOwnersArray);

        // Update map view to show farmer location
        if (map.current) {
          map.current.setCenter([farmerCoords.lng, farmerCoords.lat]);
          map.current.setZoom(10);
        }

      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load map data');
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, [farmerId]);

  // Add markers to map
  useEffect(() => {
    if (!map.current || !farmerLocation) return;

    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());

    // Add farmer marker (blue pin)
    const farmerEl = document.createElement('div');
    farmerEl.className = 'farmer-marker';
    farmerEl.style.width = '30px';
    farmerEl.style.height = '30px';
    farmerEl.style.backgroundColor = '#3B82F6';
    farmerEl.style.border = '3px solid white';
    farmerEl.style.borderRadius = '50%';
    farmerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

    new mapboxgl.Marker(farmerEl)
      .setLngLat([farmerLocation.lng, farmerLocation.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <h3 class="font-bold text-blue-600">Your Location</h3>
          <p class="text-sm text-gray-600">${farmerLocation.name}</p>
          <p class="text-xs text-gray-500">${farmerLocation.address}</p>
        </div>
      `))
      .addTo(map.current);

    // Add owner markers (red pins)
    nearbyOwners.forEach(owner => {
      const ownerEl = document.createElement('div');
      ownerEl.className = 'owner-marker';
      ownerEl.style.width = '25px';
      ownerEl.style.height = '25px';
      ownerEl.style.backgroundColor = '#EF4444';
      ownerEl.style.border = '2px solid white';
      ownerEl.style.borderRadius = '50%';
      ownerEl.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

      const equipmentList = owner.equipment.map(eq =>
        `<li class="text-xs">${eq.subCategory} (${eq.category})</li>`
      ).join('');

      new mapboxgl.Marker(ownerEl)
        .setLngLat([owner.lng, owner.lat])
        .setPopup(new mapboxgl.Popup().setHTML(`
          <div class="p-2">
            <h3 class="font-bold text-red-600">${owner.name}</h3>
            <p class="text-sm text-gray-600">${owner.distance} km away</p>
            <p class="text-xs text-gray-500 mb-2">${owner.address}</p>
            <div class="text-xs">
              <strong>Equipment Available:</strong>
              <ul class="mt-1 ml-2">${equipmentList}</ul>
            </div>
          </div>
        `))
        .addTo(map.current);
    });

  }, [farmerLocation, nearbyOwners]);

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden border bg-white shadow-lg">
      {loading && (
        <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-green mx-auto mb-4"></div>
            <p className="text-gray-600">Loading map and nearby equipment...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
          <div className="text-center text-red-600">
            <p className="mb-2">⚠️ {error}</p>
            <p className="text-sm text-gray-500">Please check your internet connection and try again.</p>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-full" />

      {!loading && !error && (
        <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md z-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm font-medium">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">Equipment Owners ({nearbyOwners.length} within 50km)</span>
          </div>
        </div>
      )}
    </div>
  );
}