import React from "react";

const EmptySiteMapsState = ({ onUpload }) => (
  <div className="text-center py-12 theme-bg-card rounded-lg border-2 border-dashed theme-border">
    <div className="theme-text-muted mb-3">
      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium theme-text-primary mb-2">No site maps yet</h3>
    <p className="theme-text-secondary text-sm mb-4">Upload site maps to visualize your project</p>
    <button
      onClick={onUpload}
      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
    >
      + Upload your first site map
    </button>
  </div>
);

export default EmptySiteMapsState;