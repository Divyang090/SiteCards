import React from 'react';

const VendorCard = ({ vendor, onEdit, onDelete }) => {
  return (
    <div className="border theme-bg-primary rounded-lg p-4 hover:shadow-md transition-shadow duration-200 group overflow-x-auto whitespace-nowrap scrollbar-hidden">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-semibold theme-text-primary text-lg mb-1">{vendor.name}</h3>
          <p className="text-sm theme-text-secondary mb-1">{vendor.category}</p>
          <div className="flex items-center gap-4 text-sm">
  {/* Mail - Clickable */}
  <a 
    href={`mailto:${vendor.contact}`}
    className="flex items-center gap-1 theme-text-secondary hover:text-blue-600 transition-colors duration-200"
    onClick={(e) => e.stopPropagation()} // Prevent card click when clicking mail
  >
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
      stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m0 8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2v8z" />
    </svg>
    {vendor.contact}
  </a>

  {/* Phone - Clickable */}
  {vendor.phone && vendor.phone !== 'No phone' && (
    <a 
      href={`tel:${vendor.phone}`}
      className="flex items-center gap-1 theme-text-primary hover:text-blue-600 transition-colors duration-200"
      onClick={(e) => e.stopPropagation()} // Prevent card click when clicking phone
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M3 5a2 2 0 012-2h2a2 2 0 012 2v3a2 2 0 01-2 2H5v3a11 11 0 0011 11h3a2 2 0 002-2v-2a2 2 0 00-2-2h-1a2 2 0 01-2-2v-1a2 2 0 012-2h3a2 2 0 012 2v2a5 5 0 01-5 5h-3a13 13 0 01-13-13V5z" />
      </svg>
      {vendor.phone}
    </a>
  )}
</div>
        </div>
        <div className="flex gap-1 ml-4 md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit && onEdit(vendor)}
            className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50 transition-colors duration-200"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete && onDelete(vendor.id)}
            className="text-red-600 hover:text-red-800 p-1.5 rounded hover:bg-red-50 transition-colors duration-200"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorCard;