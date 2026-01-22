import React from 'react';

// Land Preparation Equipment - Plow/Tractor
export const LandPreparationIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <ellipse cx="24" cy="26" rx="18" ry="8" fill={color} opacity="0.1"/>
    <rect x="14" y="14" width="20" height="12" rx="2" fill={color}/>
    <circle cx="18" cy="34" r="4" fill={color}/>
    <circle cx="30" cy="34" r="4" fill={color}/>
    <line x1="18" y1="30" x2="18" y2="34" stroke={color} strokeWidth="1.5"/>
    <line x1="30" y1="30" x2="30" y2="34" stroke={color} strokeWidth="1.5"/>
    <path d="M 10 18 Q 8 16 10 12" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

// Sowing & Planting Equipment - Seed/Seedling
export const SowingPlantingIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <ellipse cx="24" cy="32" rx="12" ry="4" fill={color} opacity="0.2"/>
    <path d="M 20 28 Q 18 20 20 12" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <path d="M 28 28 Q 30 20 28 12" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    <ellipse cx="20" cy="12" rx="2" ry="2.5" fill={color}/>
    <ellipse cx="28" cy="12" rx="2" ry="2.5" fill={color}/>
    <circle cx="24" cy="26" r="2" fill={color}/>
    <circle cx="20" cy="24" r="1.5" fill={color}/>
    <circle cx="28" cy="24" r="1.5" fill={color}/>
  </svg>
);

// Irrigation Equipment - Sprinkler/Water
export const IrrigationIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <rect x="18" y="26" width="12" height="6" rx="2" fill={color}/>
    <circle cx="24" cy="20" r="3" fill={color}/>
    <path d="M 18 20 L 14 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M 30 20 L 34 14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M 24 20 L 24 10" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="14" cy="12" r="1.5" fill={color}/>
    <circle cx="34" cy="12" r="1.5" fill={color}/>
    <circle cx="24" cy="8" r="1.5" fill={color}/>
  </svg>
);

// Crop Protection Equipment - Shield/Spray
export const CropProtectionIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <path d="M 24 12 L 18 16 L 18 26 C 18 32 24 36 24 36 C 24 36 30 32 30 26 L 30 16 Z" stroke={color} strokeWidth="2" fill={color} opacity="0.2"/>
    <path d="M 22 24 L 24 26 L 28 20" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Fertilizer & Manure Application - Spreader
export const FertilizerIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <rect x="16" y="18" width="16" height="8" rx="2" fill={color}/>
    <circle cx="20" cy="26" r="2" fill={color}/>
    <circle cx="24" cy="28" r="2" fill={color}/>
    <circle cx="28" cy="26" r="2" fill={color}/>
    <path d="M 20 26 L 18 32" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M 24 28 L 24 34" stroke={color} strokeWidth="1.5" fill="none"/>
    <path d="M 28 26 L 30 32" stroke={color} strokeWidth="1.5" fill="none"/>
    <circle cx="18" cy="34" r="1" fill={color}/>
    <circle cx="24" cy="36" r="1" fill={color}/>
    <circle cx="30" cy="34" r="1" fill={color}/>
  </svg>
);

// Harvesting Equipment - Combine Harvester
export const HarvestingIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <rect x="12" y="16" width="24" height="10" rx="2" fill={color} opacity="0.3"/>
    <rect x="14" y="18" width="20" height="6" fill={color}/>
    <circle cx="16" cy="32" r="3" fill={color}/>
    <circle cx="32" cy="32" r="3" fill={color}/>
    <path d="M 16 29 L 16 32" stroke={color} strokeWidth="1.5"/>
    <path d="M 32 29 L 32 32" stroke={color} strokeWidth="1.5"/>
    <path d="M 20 28 L 22 22" stroke={color} strokeWidth="2" fill="none"/>
    <path d="M 28 28 L 26 22" stroke={color} strokeWidth="2" fill="none"/>
  </svg>
);

// Post-Harvest Equipment - Thresher
export const PostHarvestIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <circle cx="24" cy="22" r="6" fill="none" stroke={color} strokeWidth="2"/>
    <line x1="24" y1="16" x2="24" y2="28" stroke={color} strokeWidth="1.5"/>
    <line x1="18" y1="22" x2="30" y2="22" stroke={color} strokeWidth="1.5"/>
    <rect x="18" y="28" width="12" height="6" rx="1" fill={color} opacity="0.2" stroke={color}/>
    <path d="M 20 34 L 20 36" stroke={color} strokeWidth="1.5"/>
    <path d="M 24 34 L 24 36" stroke={color} strokeWidth="1.5"/>
    <path d="M 28 34 L 28 36" stroke={color} strokeWidth="1.5"/>
  </svg>
);

// Storage & Handling Equipment - Warehouse
export const StorageIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <rect x="12" y="16" width="24" height="16" rx="2" stroke={color} strokeWidth="2" fill={color} opacity="0.1"/>
    <line x1="12" y1="20" x2="36" y2="20" stroke={color} strokeWidth="1"/>
    <line x1="12" y1="24" x2="36" y2="24" stroke={color} strokeWidth="1"/>
    <line x1="12" y1="28" x2="36" y2="28" stroke={color} strokeWidth="1"/>
    <line x1="20" y1="16" x2="20" y2="32" stroke={color} strokeWidth="1"/>
    <line x1="28" y1="16" x2="28" y2="32" stroke={color} strokeWidth="1"/>
  </svg>
);

// Transport & Material Handling - Truck
export const TransportIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <rect x="12" y="16" width="20" height="10" rx="1" fill={color}/>
    <rect x="32" y="20" width="8" height="6" fill={color} opacity="0.5"/>
    <circle cx="16" cy="32" r="3" fill={color}/>
    <circle cx="32" cy="32" r="3" fill={color}/>
    <path d="M 32 22 L 28 26" stroke={color} strokeWidth="1.5"/>
    <line x1="32" y1="29" x2="32" y2="32" stroke={color} strokeWidth="1"/>
  </svg>
);

// Orchard & Plantation Equipment - Trees
export const OrchardIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <circle cx="16" cy="18" r="5" fill={color} opacity="0.4"/>
    <circle cx="32" cy="18" r="5" fill={color} opacity="0.4"/>
    <circle cx="24" cy="14" r="5" fill={color} opacity="0.4"/>
    <rect x="15" y="23" width="2" height="8" fill={color}/>
    <rect x="31" y="23" width="2" height="8" fill={color}/>
    <rect x="23" y="19" width="2" height="12" fill={color}/>
    <ellipse cx="24" cy="34" rx="10" ry="2" fill={color} opacity="0.2"/>
  </svg>
);

// Renewable & Smart Farming Equipment - Solar/Tech
export const RenewableIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <rect x="14" y="14" width="20" height="12" rx="1" stroke={color} strokeWidth="1.5" fill={color} opacity="0.1"/>
    <rect x="16" y="16" width="3" height="3" fill={color}/>
    <rect x="21" y="16" width="3" height="3" fill={color}/>
    <rect x="26" y="16" width="3" height="3" fill={color}/>
    <rect x="16" y="21" width="3" height="3" fill={color}/>
    <rect x="21" y="21" width="3" height="3" fill={color}/>
    <rect x="26" y="21" width="3" height="3" fill={color}/>
    <circle cx="24" cy="32" r="4" fill="none" stroke={color} strokeWidth="1.5"/>
    <path d="M 24 28 L 24 24" stroke={color} strokeWidth="1.5"/>
  </svg>
);

// Small Tools & Accessories - Wrench/Tools
export const ToolsIcon = ({ size = 48, color = '#3d6e2e' }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" fill="#f0f4e8" stroke={color} strokeWidth="2"/>
    <path d="M 12 28 L 20 20" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <circle cx="20" cy="20" r="2.5" fill={color}/>
    <path d="M 28 16 Q 32 12 36 12 Q 38 14 36 18" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="28" cy="24" r="3" fill="none" stroke={color} strokeWidth="2"/>
    <line x1="25" y1="27" x2="31" y2="27" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Mapping function to get icon by category
export const getCategoryIcon = (categoryName, size = 40, color = '#3d6e2e') => {
  const categoryMap = {
    "Land Preparation Equipment": <LandPreparationIcon size={size} color={color} />,
    "Sowing & Planting Equipment": <SowingPlantingIcon size={size} color={color} />,
    "Irrigation Equipment": <IrrigationIcon size={size} color={color} />,
    "Crop Protection Equipment": <CropProtectionIcon size={size} color={color} />,
    "Fertilizer & Manure Application": <FertilizerIcon size={size} color={color} />,
    "Harvesting Equipment": <HarvestingIcon size={size} color={color} />,
    "Post-Harvest Equipment": <PostHarvestIcon size={size} color={color} />,
    "Storage & Handling Equipment": <StorageIcon size={size} color={color} />,
    "Transport & Material Handling": <TransportIcon size={size} color={color} />,
    "Orchard & Plantation Equipment": <OrchardIcon size={size} color={color} />,
    "Renewable & Smart Farming Equipment": <RenewableIcon size={size} color={color} />,
    "Small Tools & Accessories": <ToolsIcon size={size} color={color} />,
  };

  return categoryMap[categoryName] || categoryMap["Small Tools & Accessories"];
};
