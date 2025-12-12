import React, { useState, useRef, useEffect } from 'react';
import '../assets/responsive.css'
import { motion } from "framer-motion";

const SearchBar = ({ onSearch, onFilter, currentFilter, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef(null);

  const statusFilters = [
    { value: 'all', label: 'All Projects', color: 'gray' },
    { value: 'Planning', label: 'Planning', color: 'yellow' },
    { value: 'In Progress', label: 'In Progress', color: 'blue' },
    { value: 'review', label: 'Review', color: 'purple' },
    { value: 'completed', label: 'Completed', color: 'green' }
  ];
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterSelect = (filterValue) => {
    setShowFilterDropdown(false);
    if (onFilter) {
      onFilter(filterValue);
    }
  };

  const handleClearFilter = () => {
    if (onFilter) {
      onFilter('all');
    }
  };

  const getCurrentFilterLabel = () => {
    const current = statusFilters.find(f => f.value === currentFilter);
    return current ? current.label : 'Filter';
  };

  const getColorClass = (color) => {
    const colorMap = {
      gray: 'bg-gray-500',
      yellow: 'bg-yellow-500',
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  return (
    <div className="flex gap-2 items-center">
      {/* Search Input */}
      <div className="relative flex-1">
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
        />
      </div>

      {/* Filter Button with Dropdown */}
      <div className="relative" ref={filterRef}>
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`p-2 theme-border rounded-lg transition-colors duration-200 flex items-center justify-center ${currentFilter !== 'all'
                ? 'bg-blue-100 border-blue-300 text-blue-700'
                : 'theme-bg-card theme-text-primary hover:gray-500'
              }`}
          >
            <motion.svg
  initial={{ rotate: 0 }}
  animate={{ rotate: showFilterDropdown ? 180 : 0 }}
  transition={{ duration: 0.35, ease: "easeInOut" }}
  className="w-5 h-5"
  fill="none"
  viewBox="0 0 24 24"
  stroke="currentColor"
>
  <path
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth={2}
    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
  />
</motion.svg>

          </button>

          {/* Clear Filter Button*/}
          {currentFilter !== 'all' && (
            <button
              onClick={handleClearFilter}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Clear filter"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        {showFilterDropdown && (
          <div className="animate-fadeInUp absolute top-full right-0 mt-1 w-48 theme-bg-card theme-border rounded-lg shadow-lg z-10 border">
            <div className="p-2 border-b theme-border">
              <h3 className="text-sm font-medium theme-text-primary">Filter by Status</h3>
            </div>
            {statusFilters.map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleFilterSelect(filter.value)}
                className={`w-full text-left px-4 py-3 transition-all duration-200 flex items-center gap-3 group ${currentFilter === filter.value
                    ? 'bg-blue-50 dark:bg-blue-200/30 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-500 hover:text-gray-900 dark:hover:text-gray-100 theme-text-primary'
                  }`}
              >
                {/* Color indicator */}
                <div className={`w-3 h-3 rounded-full ${getColorClass(filter.color)}`}></div>

                {/* Filter label */}
                <span className="flex-1 text-sm">{filter.label}</span>

                {/* Checkmark for selected filter */}
                {currentFilter === filter.value && (
                  <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;