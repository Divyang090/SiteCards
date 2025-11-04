import React, { useState } from "react";

const EditableVendorField = ({ vendor, field, onUpdate, className = "" }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(vendor[field]);

  const handleSave = () => {
    if (value !== vendor[field]) {
      onUpdate(vendor.id, { [field]: value });
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      {isEditing ? (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyPress={handleKeyPress}
          className="border-b-2 border-blue-500 bg-transparent outline-none px-1"
          autoFocus
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className="cursor-pointer hover:bg-blue-50 px-1 rounded transition-colors"
        >
          {vendor[field] || 'Click to edit'}
        </span>
      )}
    </div>
  );
};

export default EditableVendorField;