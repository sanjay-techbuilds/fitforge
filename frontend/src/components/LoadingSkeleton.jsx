// frontend/src/components/LoadingSkeleton.jsx
import React from 'react';

export const LoadingSkeleton = () => (
  <div className="skeleton-container">
    <div className="skeleton-image"></div>
    <div className="skeleton-text-container">
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
    </div>
  </div>
);