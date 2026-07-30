import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-extrabold text-indigo-600 mb-2">403</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
      <p className="text-gray-600 max-w-md mb-6">
        You don't have permission to view this page. Please contact an administrator or return home.
      </p>
      <Link
        to="/"
        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default Unauthorized;
