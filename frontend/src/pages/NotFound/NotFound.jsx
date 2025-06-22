import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center text-gray-800">
      <h1 className="text-6xl font-bold mb-4">😢</h1>
      <h2 className="text-4xl font-semibold mb-2">Oops! Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-6">
        The page you are looking for does not exist. It might have been moved or deleted.
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Go Back to Home
      </Link>
    </div>
  );
};

export default NotFound; 