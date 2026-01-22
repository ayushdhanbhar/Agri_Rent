// file to store all the logos of the app
import React from 'react';

// HelloFarmers Logo - Modern Agricultural Brand
export const HelloFarmersLogo = ({ size = 48, withText = false }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer Circle - Gradient Background */}
    <circle cx="24" cy="24" r="23" fill="#f0f4e8" stroke="#2d4a24" strokeWidth="2"/>
    
    {/* Inner Circle - Dark Green */}
    <circle cx="24" cy="24" r="20" fill="#2d4a24"/>
    
    {/* Left Leaf */}
    <path d="M 16 24 Q 14 20 16 14 Q 18 18 18 24 Q 18 28 16 28 Z" fill="#3d6e2e"/>
    
    {/* Center Leaf (Larger) */}
    <path d="M 24 16 Q 22 12 24 6 Q 26 12 26 20 Q 26 28 24 32 Z" fill="#5a8c3a"/>
    
    {/* Right Leaf */}
    <path d="M 32 24 Q 34 20 32 14 Q 30 18 30 24 Q 30 28 32 28 Z" fill="#3d6e2e"/>
    
    {/* Highlight on leaves */}
    <circle cx="24" cy="18" r="1.5" fill="#f0f4e8" opacity="0.6"/>
    <circle cx="18" cy="22" r="1" fill="#f0f4e8" opacity="0.5"/>
    <circle cx="30" cy="22" r="1" fill="#f0f4e8" opacity="0.5"/>
    
    {/* Water droplet at bottom - Irrigation theme */}
    <path d="M 24 34 Q 22 34 22 36 Q 22 38 24 38 Q 26 38 26 36 Q 26 34 24 34 Z" fill="#7d9e76" opacity="0.8"/>
  </svg>
);

// Favicon version (small, compact)
export const HelloFarmersLogoSmall = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="16" fill="#2d4a24"/>
    <path d="M 11 16 Q 9 13 11 8 Q 13 12 13 16 Q 13 19 11 19 Z" fill="#5a8c3a"/>
    <path d="M 16 10 Q 14 6 16 2 Q 18 6 18 14 Q 18 20 16 22 Z" fill="#7d9e76"/>
    <path d="M 21 16 Q 23 13 21 8 Q 19 12 19 16 Q 19 19 21 19 Z" fill="#5a8c3a"/>
    <circle cx="16" cy="16" r="1" fill="#f0f4e8" opacity="0.7"/>
  </svg>
);
