import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../Configuration/Config';
import { useStatusMessage } from '../Alerts/StatusMessage';
import StatusMessageProvider from '../Alerts/StatusMessage';
import { useAuth } from "../Components/AuthContext";

const AddVendorModal = ({ spaceId, projectId, onClose, onAdd }) => {
  const { showConfirmation, showMessage } = useStatusMessage();
  const [activeTab, setActiveTab] = useState('manual');
  const [selectedContact, setSelectedContact] = useState(null);
  const [isContactsApiSupported, setIsContactApiSupported] = useState(false);
  const { authFetch } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    phone: '',
    email: '',
    tags: [],
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customTag, setCustomTag] = useState('');

  const predefinedTags = [
    'supplier', 'contractor', 'service-provider', 'furniture', 'paint', 'tiles',
    'hardware', 'kitchen', 'sanitaryware', 'lighting', 'glass',
    'interior-design', 'plumbing', 'electrical', 'carpentry'
  ];

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };
  //Default Vendors
  const defaultVendors = [
    {
      id: 1,
      name: 'ABC Construction',
      description: 'General building contractor',
      tags: 'contractor,construction', // ✅ String format with no spaces
      company: 'ABC Builders Ltd.',
      phone: '+91 98765 43210',
      email: 'contact@aabcconstruction.com'
    },
    {
      id: 2,
      name: 'XYZ Electrical',
      description: 'Electrical works specialist',
      tags: 'electrical,lighting',
      company: 'XYZ Electric',
      phone: '+91 98765 43211',
      email: 'info@xayzelectrical.com'
    },
    {
      id: 3,
      name: 'Premium Paints',
      description: 'Painting and coating services',
      tags: 'paint,interior',
      company: 'Premium Paints Co.',
      phone: '+91 98765 43212',
      email: 'sales@paremiumpaints.com'
    },
    {
      id: 4,
      name: 'Winds',
      description: 'Turbines and Energy',
      tags: 'Turbines,Mills,Wheels', // ✅ String format with no spaces
      company: 'Winders',
      phone: '+91 65545 78945',
      email: 'winds@hoatmail.com'
    },
    {
      id: 5,
      name: 'Reserve Construction',
      description: 'Construction of Dams',
      tags: 'Dams,Reservoirs,Bridges,Hanging Bridges', // ✅ String format with no spaces
      company: 'Reserv Construction',
      phone: '+91 55584 55947',
      email: 'reserv@reaservconstructions.ac.in'
    }
  ];

  // Autofill data from default vendors
  const handleVendorSelect = async (vendor) => {
    console.log('=== VENDOR SELECT DEBUG START ===');
    console.log('Original vendor object:', vendor);

    // Validate required fields
    if (!vendor.email) {
      showMessage('Vendor email is required', 'error');
      return;
    }

    if (!vendor.company) {
      showMessage('Vendor company is required', 'error');
      return;
    }

    // If tags is already a string, use it as-is. If it's an array, convert with no spaces.
    const tagsString = Array.isArray(vendor.tags)
      ? vendor.tags.join(',') // ✅ No spaces between commas
      : (vendor.tags || '');

    const vendorData = {
      contact_person: vendor.name || '',
      company_name: vendor.company || '',
      vendor_email: vendor.email,
      contact_number: vendor.phone || '',
      tags: tagsString, // ✅ Will be in format "contractor,construction" with no spaces
      trade: ""
    };

    console.log('Processed vendor data:', vendorData);
    console.log('spaceId:', spaceId);
    console.log('URL:', `${BASE_URL}/vendors/vendors/post/space/${spaceId}`);
    console.log('=== VENDOR SELECT DEBUG END ===');

    try {
      setIsSubmitting(true);

      const response = await authFetch(`${BASE_URL}/vendors/vendors/post/space/${spaceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData),
      });

      console.log('DEBUG - Response status:', response.status);
      console.log('DEBUG - Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const newVendor = await response.json();
        console.log('DEBUG - Success response:', newVendor);

        const transformedVendor = {
          id: newVendor.vendor_id,
          name: vendor.company,
          contact: vendor.email,
          phone: vendor.phone,
          tags: tagsString
        };

        onAdd(transformedVendor);
        showMessage(`${vendor.name} added successfully!`, 'success');
        onClose();
      } else {
        const errorText = await response.text();
        console.error('DEBUG - Full error response:', errorText);

        // Try to parse the error for more details
        try {
          const errorJson = JSON.parse(errorText);
          console.error('DEBUG - Parsed error JSON:', errorJson);
          showMessage(`Failed to add vendor: ${errorJson.error || errorJson.message || 'Unknown error'}`, 'error');
        } catch {
          console.error('DEBUG - Raw error text:', errorText);
          showMessage('Failed to add vendor: ' + errorText, 'error');
        }
      }
    } catch (error) {
      console.error('Network error adding vendor:', error);
      showMessage('Failed to add vendor: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  //TAGS
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

  // Check if Contacts API is supported
  useEffect(() => {
    if ('contacts' in navigator && 'select' in navigator.contacts) {
      setIsContactApiSupported(true);
    }
  }, []);

  // Contact selection handler
  const handleOpenContacts = async () => {
    try {
      const contacts = await navigator.contacts.select(['name', 'email', 'tel', 'organization'], {
        multiple: false
      });

      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        const contactData = {
          name: contact.name ? contact.name[0] : '',
          phone: contact.tel ? contact.tel[0] : '',
          email: contact.email ? contact.email[0] : '',
          company: contact.organization ? contact.organization[0] : ''
        };

        setSelectedContact(contactData);

        // Auto-fill the form with contact data
        setFormData(prev => ({
          ...prev,
          name: contactData.name,
          company_name: contactData.company,
          phone: contactData.phone,
          email: contactData.email
        }));

        // Switch to manual tab to show filled data
        setActiveTab('manual');

        showMessage('Contact imported successfully!', 'success');
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
      showMessage('Failed to access contacts. Please check permissions.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {

      console.log('=== MANUAL SUBMIT DEBUG ===');
      console.log('Form data:', formData);

      const requestData = {
        contact_person: formData.name,
        company_name: formData.company_name,
        vendor_email: formData.email,
        contact_number: formData.phone,
        // trade: formData.tags.join(', '),
        tags: formData.tags.join(','),
        notes: formData.notes,
        space_id: spaceId,
        project_id: projectId
      };

      console.log('Manual request data:', requestData);
      console.log('Manual spaceId:', spaceId);
      console.log('=== MANUAL SUBMIT DEBUG END ===');

      const response = await authFetch(`${BASE_URL}/vendors/vendors/post/space/${spaceId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const newVendor = await response.json();
        console.log('New vendor created successfully:', newVendor);

        //Transform backend response to match frontend structure
        const transformedVendor = {
          id: newVendor.vendor_id,
          name: newVendor.company_name,
          category: newVendor.trade,
          contact: newVendor.vendor_email,
          phone: newVendor.contact_number,
          space_id: newVendor.space_id || spaceId
        };

        onAdd(transformedVendor);
        showMessage('Vendor added successfully!', 'success');
      } else {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`Failed to add vendor: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error adding vendor:', error);
      showMessage('Failed to add vendor: ' + error.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div className="overflow-y-scroll animate-fadeInUp shadow-2xl whitespace-nowrap scrollbar-hidden theme-bg-secondary rounded-lg max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 theme-text-primary">Add Vendor</h2>

        <form onSubmit={handleSubmit}>
          {/* TABS NAVIGATION */}
          <div className="flex mb-6 border-b theme-border-primary">
            <button
              type="button"
              className={`pb-2 px-4 w-full ${activeTab === 'manual' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'theme-text-secondary hover:theme-text-primary'}`}
              onClick={() => setActiveTab('manual')}
            >
              Manual
            </button>
            <button
              type="button"
              className={`pb-2 px-4 w-full ${activeTab === 'fromList' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'theme-text-secondary hover:theme-text-primary'}`}
              onClick={() => setActiveTab('fromList')}
            >
              From List
            </button>
            <button
              type="button"
              className={`pb-2 px-4 w-full ${activeTab === 'contacts' ? 'border-b-2 border-blue-500 text-blue-500 font-medium' : 'theme-text-secondary hover:theme-text-primary'}`}
              onClick={() => setActiveTab('contacts')}
            >
              Contacts
            </button>
          </div>

          {/* MANUAL TAB CONTENT */}
          {activeTab === 'manual' && (
            <div className="space-y-4 h-[400px]">
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

              {/* BUTTONS*/}
              <div className="flex justify-end gap-3 pb-4">
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
                  {isSubmitting ? 'Adding...' : 'Add Vendor'}
                </button>
              </div>
            </div>
          )}

          {/* LIST TAB CONTENT */}
          {activeTab === 'fromList' && (
            <div className="h-[400px] space-y-4 overflow-y-auto whitespace-nowrap scrollbar-hidden">
              <div>
                <p className="theme-text-secondary font-medium">Select from commonly used vendors</p>
              </div>

              {/* Map through default vendors */}
              {defaultVendors.map(vendor => (
                <div
                  key={vendor.id}
                  onClick={() => handleVendorSelect(vendor)}
                  className='w-full text-left p-3 rounded-lg border border-gray-300 hover:bg-blue-220 hover:border-blue-300 transition-colors cursor-pointer'
                >
                  <div className="font-medium theme-text-primary">{vendor.name}</div>
                  <div className='text-xs theme-text-secondary mt-0.5'>{vendor.description}</div>
                  <div className='flex flex-wrap gap-1 mt-1.5'>
                    {vendor.tags.split(',').map(tag => (
                      <span
                        key={tag}
                        className='inline-flex items-center px-2 py-0.5 rounded-full text-xs theme-bg-blue theme-text-blue border border-blue-200'
                      >
                        {tag.trim()} {/* Added trim() to remove any accidental spaces */}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* from Contacts */}
          {activeTab === 'contacts' && (
            <div className="space-y-4 border border-dashed rounded-lg border-gray-500">
              <div className="text-center flex flex-col items-center py-8">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className=' flex justify-center w-12 h-12' xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="theme-text-secondary mb-4">Import vendor from your contacts</p>

                {/* Contact Picker Button */}
                <button
                  type="button"
                  onClick={handleOpenContacts}
                  disabled={!isContactsApiSupported}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Choose from Contacts
                </button>

                {!isContactsApiSupported && (
                  <p className="text-sm theme-text-secondary mt-3">
                    Contact picker not supported in your browser
                  </p>
                )}
              </div>

              {/* Display selected contact info */}
              {selectedContact && (
                <div className="p-4 border border-green-300 rounded-lg bg-green-50">
                  <h4 className="font-medium text-green-800 mb-2">Selected Contact:</h4>
                  <p className="text-green-700"><strong>Name:</strong> {selectedContact.name}</p>
                  <p className="text-green-700"><strong>Phone:</strong> {selectedContact.phone}</p>
                  <p className="text-green-700"><strong>Email:</strong> {selectedContact.email}</p>
                  <p className="text-green-700"><strong>Company:</strong> {selectedContact.company}</p>
                </div>
              )}
            </div>
          )}


        </form>
      </div>
    </div>
  );
};

export default AddVendorModal;