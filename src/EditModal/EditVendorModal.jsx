import React, { useState, useEffect } from "react";
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';

const EditVendorModal = ({ vendor, spaceId, projectId, onClose, onUpdate }) => {
  const { showMessage, showFailed } = useStatusMessage();
  const [formData, setFormData] = useState({
    company_name: '',
    trade: '',
    vendor_email: '',
    contact_number: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (vendor) {
      setFormData({
        company_name: vendor.company_name || vendor.name || '',
        trade: vendor.trade || vendor.category || '',
        vendor_email: vendor.vendor_email || vendor.contact || '',
        contact_number: vendor.contact_number || vendor.phone || ''
      });
    }
  }, [vendor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const vendorId = vendor.vendor_id || vendor.id;
      const response = await fetch(`${BASE_URL}/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          space_id: spaceId,
          project_id: projectId
        }),
      });

      if (response.ok) {
        const updatedVendor = await response.json();
        onUpdate(updatedVendor);
        showMessage('Vendor updated successfully!', 'success');
      } else {
        const errorText = await response.text();
        throw new Error(`Failed to update vendor: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating vendor:', error);
      showFailed('Failed to update vendor: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!vendor) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]">
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Edit Vendor</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Company Name</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder='Enter company name...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Trade/Category</label>
              <input
                type="text"
                value={formData.trade}
                onChange={(e) => setFormData(prev => ({ ...prev, trade: e.target.value }))}
                placeholder='Enter trade or category...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Email</label>
              <input
                type="email"
                value={formData.vendor_email}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor_email: e.target.value }))}
                placeholder='Enter email address...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Phone Number</label>
              <input
                type="tel"
                value={formData.contact_number}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                placeholder='Enter phone number...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVendorModal;