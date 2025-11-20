import React, { useState, useEffect } from "react";
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';

const EditVendorModal = ({ vendor, spaceId, projectId, onClose, onClick, onUpdate }) => {
  const { showMessage, showFailed } = useStatusMessage();
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    tags: [],
    notes: ''
  });
  const [customTag, setCustomTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const predefinedTags = [
    'supplier', 'contractor', 'service-provider', 'furniture', 'paint', 'tiles',
    'hardware', 'kitchen', 'sanitaryware', 'lighting', 'glass',
    'interior-design', 'plumbing', 'electrical', 'carpentry'
  ];


  useEffect(() => {
    if (vendor) {
      console.log('🔍 EDIT MODAL - FULL VENDOR OBJECT:', vendor);
      console.log('🔍 EDIT MODAL - Vendor ID:', vendor.id);
      console.log('🔍 EDIT MODAL - All vendor keys:', Object.keys(vendor));

      const newFormData = {
        name: vendor.name || '',
        company_name: vendor.company_name || vendor.name || '',
        phone: vendor.phone || '',
        email: vendor.email || vendor.contact || '',
        tags: vendor.tags || [],
        notes: vendor.notes || ''
      };

      console.log('🔍 EDIT MODAL - New form data:', newFormData);
      setFormData(newFormData);
    }
  }, [vendor]);

  useEffect(() => {
    if (vendor) {
      console.log('🔍 FULL VENDOR OBJECT:', vendor);

      const newFormData = {
        name: vendor.name || '',
        company_name: vendor.company_name || vendor.name || '',
        phone: vendor.phone || '',
        email: vendor.email || vendor.contact || '',
        tags: vendor.tags || [],
        notes: vendor.notes || ''
      };

      console.log('🔍 New form data:', newFormData);
      setFormData(newFormData);
    }
  }, [vendor]);

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAddCustomTag = () => {
    if (customTag.trim() && !formData.tags.includes(customTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, customTag.trim()]
      }));
      setCustomTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const vendorId = vendor.vendor_id || vendor.id;

      console.log('🔍 DEBUG VENDOR ID ANALYSIS:');
      console.log('vendor.vendor_id:', vendor.vendor_id);
      console.log('vendor.id:', vendor.id);
      console.log('Final vendorId being used:', vendorId);
      console.log('Full vendor object:', vendor);

      const requestData = {
        contact_person: formData.name,        // ✅ Correct field name
        company_name: formData.company_name,  // ✅ Use actual company_name from form
        vendor_email: formData.email,
        contact_number: formData.phone,
        tags: formData.tags,                  // ✅ Add tags array
        // notes: formData.notes,
        space_id: spaceId,
        // project_id: projectId
      };

      console.log('2. Request data to backend:', requestData);

      const response = await fetch(`${BASE_URL}/vendors/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('3. Response status:', response.status);

      if (response.ok) {
        let responseBody;
        try {
          responseBody = await response.json();
          console.log('4. RAW API RESPONSE:', responseBody);
        } catch (parseError) {
          console.error('5. Failed to parse JSON response:', parseError);
          const textResponse = await response.text();
          console.log('5. Text response:', textResponse);
          responseBody = textResponse;
        }

        // ✅ UPDATED TRANSFORMATION - REMOVE CATEGORY, ADD TAGS
        const transformedVendor = {
          id: vendorId,
          name: formData.company_name,
          contact: formData.email,
          phone: formData.phone,
          space_id: spaceId,
          tags: formData.tags  // ✅ Add tags instead of category
        };

        console.log('6. Final transformed vendor:', transformedVendor);

        onUpdate(transformedVendor);
        showMessage('Vendor updated successfully!', 'success');
      } else {
        const errorText = await response.text();
        console.error('7. Error response:', errorText);
        throw new Error(`Failed to update vendor: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('8. Catch block error:', error);
      showFailed('Failed to update vendor: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vendor) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div className="theme-bg-secondary rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">Edit Vendor</h2>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Vendor name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-secondary theme-text-primary"
              />
            </div>

            {/* Company Field */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">
                Company
              </label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                placeholder="Company name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-secondary theme-text-primary"
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-secondary theme-text-primary"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium theme-text-secondary mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="vendor@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-secondary theme-text-primary"
                />
              </div>
            </div>

            {/* Tags Field */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">
                Tags
              </label>

              {/* Selected Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs theme-bg-blue theme-text-blue border border-blue-200"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Predefined Tags */}
              <div className="flex flex-wrap gap-2 mb-3">
                {predefinedTags.map(tag => (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-xs border ${formData.tags.includes(tag)
                      ? 'theme-bg-blue theme-text-blue border-blue-200'
                      : 'theme-bg-secondary theme-text-secondary border-gray-300 hover:border-blue-300'
                      }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  placeholder="Add custom tag..."
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-secondary theme-text-primary text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddCustomTag}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:border-blue-500 theme-bg-secondary theme-text-primary text-sm"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Notes Field */}
            <div>
              <label className="block text-sm font-medium theme-text-secondary mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes about the vendor..."
                rows="3"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 theme-bg-secondary theme-text-primary resize-none"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 theme-text-secondary hover:theme-text-primary disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Updating...' : 'Update Vendor'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVendorModal;