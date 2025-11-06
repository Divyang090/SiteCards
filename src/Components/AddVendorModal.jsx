import React, { useState } from 'react';

const AddVendorModal = ({ spaceId, projectId, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    company_name: '',
    trade: '',
    vendor_email: '',
    contact_person: '',
    contact_number: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('=== VENDOR SUBMISSION DATA ===');
      console.log('Form data:', formData);
      console.log('spaceId:', spaceId);
      console.log('projectId:', projectId);

      const requestData = {
        company_name: formData.company_name,
        trade: formData.trade,
        vendor_email: formData.vendor_email,
        contact_person: formData.contact_person,
        contact_number: formData.contact_number,
        space_id: spaceId,
        project_id: projectId
      };

      console.log('Request data to be sent:', requestData);
      console.log('All keys in requestData:', Object.keys(requestData));

      const response = await fetch(`${BASE_URL}/vendors/vendors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const newVendor = await response.json();
        console.log('🎉 BACKEND RESPONSE - New vendor:', newVendor);
        console.log('🔍 Checking space_id in response:', newVendor.space_id);
        console.log('🔍 Expected space_id:', spaceId);
        console.log('New vendor created successfully:', newVendor);

        const transformedVendor = {
          id: newVendor.vendor_id || newVendor.id,
          name: newVendor.company_name || newVendor.name,
          category: newVendor.trade || newVendor.category,
          contact: newVendor.contact_person || newVendor.vendor_email,
          phone: newVendor.contact_number || newVendor.phone,
          space_id: newVendor.space_id || spaceId
        };

        onAdd(transformedVendor);
        alert('Vendor added successfully!');
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);

        let errorMessage = `Failed to add vendor: ${response.status}`;
        try {
          const errorData = JSON.parse(errorText);
          errorMessage += ` - ${JSON.stringify(errorData)}`;
        } catch {
          errorMessage += ` - ${errorText}`;
        }

        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
      alert('Failed to add vendor: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]">
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Add New Vendor</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder='Enter Company Name here...'
                className="w-full border  border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Trade/Category *</label>
              <select
                required
                value={formData.trade}
                onChange={(e) => setFormData(prev => ({ ...prev, trade: e.target.value }))}
                className="w-full border theme-bg-secondary border-gray-300 theme-text-secondary rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a trade...</option>
                <option value="General Contractor">General Contractor</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Painting">Painting</option>
                <option value="Flooring">Flooring</option>
                <option value="Roofing">Roofing</option>
                <option value="Landscaping">Landscaping</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Contact Person *</label>
              <input
                type="text"
                required
                value={formData.contact_person}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder='Enter Contact Person name here...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Vendor Email *</label>
              <input
                type="email"
                required
                value={formData.vendor_email}
                onChange={(e) => setFormData(prev => ({ ...prev, vendor_email: e.target.value }))}
                placeholder='Enter Vendor Email here...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">Contact Number</label>
              <input
                type="tel"
                value={formData.contact_number}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_number: e.target.value }))}
                placeholder='Enter Contact Number here...'
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 hover:text-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Adding...' : 'Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddVendorModal;