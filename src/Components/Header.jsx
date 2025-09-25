import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onNewProjectClick }) => {  
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700">
          Cards
        </Link>
        <p className="text-gray-600 mt-1">3 active projects</p>
      </div>
      <button 
        onClick={onNewProjectClick}  
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        New Project
      </button>
    </div>
  );
};

export default Header;