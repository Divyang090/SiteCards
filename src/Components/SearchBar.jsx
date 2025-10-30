import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 theme-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        placeholder="Search projects..."
        value={searchTerm}
        onChange={handleChange}
        className="block w-full pl-10 pr-3 py-2 theme-border rounded-lg theme-bg-card theme-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-color)'
        }}
      />
    </div>
  );
};

export default SearchBar;