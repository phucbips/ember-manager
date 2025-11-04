
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="text-center p-8">
      <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 mx-auto"></div>
      <p className="text-gray-500">Loading content...</p>
    </div>
  );
};

export default Spinner;
