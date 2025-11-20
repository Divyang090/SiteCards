import React, { useState } from 'react';
import { useStatusMessage } from '../Alerts/StatusMessage';
import { BASE_URL } from '../Configuration/Config';

const BulkPresetModal = ({ isOpen, onClose, onSiteMapsCreated }) => {
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const { showMessage } = useStatusMessage();

  const categories = [
    'Custom',
    'Floor Plan',
    'Electrical',
    'Plumbing',
    'Structural',
    'Landscape'
  ];

  const presets = [
    {
      id: 'residential',
      name: 'Residential Basic',
      description: 'Common spaces for a home',
      spaces: [
        'Foyer',
        'Living Room',
        'Kitchen',
        'Master Bedroom',
        'Bedroom',
        'Main Bathroom',
        'Balcony',
        'Utility Room'
      ]
    },
    {
      id: 'office',
      name: 'Office Basic',
      description: 'Standard office layout',
      spaces: [
        'Reception',
        'Workstations',
        'Conference Room',
        'Manager Cabin',
        'Pantry',
        'Restroom'
      ]
    }
  ];

  // Function to get a random category
  const getRandomCategory = () => {
    const randomIndex = Math.floor(Math.random() * categories.length);
    return categories[randomIndex];
  };

  const handleApplyPreset = async () => {
    if (!selectedPreset) return;
    
    setIsCreating(true);
    try {
      const createdSiteMaps = [];
      
      // Create site maps for each space with random categories
      for (const spaceName of selectedPreset.spaces) {
        const randomCategory = getRandomCategory();
        
        const response = await fetch(`${BASE_URL}/spaces/spaces`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: spaceName,
            category: randomCategory,
          }),
        });

        if (response.ok) {
          const newSiteMap = await response.json();
          createdSiteMaps.push(newSiteMap);
        } else {
          throw new Error(`Failed to create site map: ${spaceName}`);
        }
      }

      // Notify parent component about the new site maps
      if (onSiteMapsCreated) {
        onSiteMapsCreated(createdSiteMaps);
      }
      
      showMessage(`${createdSiteMaps.length} site maps created successfully!`, 'success');
      onClose();
      
    } catch (error) {
      console.error('Error creating bulk site maps:', error);
      showMessage('Failed to create some site maps', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]"
    onClick={onClose}
    >
      <div className="theme-bg-card rounded-lg shadow-xl w-full max-w-xl"
      onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-500">
          <h2 className="text-xl font-semibold theme-text-primary">Choose Preset</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {presets.map((preset) => (
            <div key={preset.id} className="mb-6 last:mb-0">
              <div 
                className={`p-3 rounded-lg border-2 border-gray-500 cursor-pointer transition-all duration-200 ${
                  selectedPreset?.id === preset.id 
                    ? 'border-green-500' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedPreset(preset)}
              >
                <h3 className="text-lg font-medium theme-text-primary mb-1">
                  {preset.name}
                </h3>
                <p className="text-sm theme-text-secondary mb-3">
                  {preset.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {preset.spaces.map((space, index) => (
                    <div 
                      key={index} 
                      className={`text-sm pl-3 ${
                        index === 0 ? 'theme-text-secondary' : 'theme-text-secondary'
                      }`}
                    >
                      {index === 0 ? '• ' : '• '}{space}
                    </div>
                  ))}
                </div>
              </div>

              {preset.id !== presets[presets.length - 1].id && (
                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-500"></div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-500 theme-bg-secondary rounded-b-lg">
          <div className="flex justify-end gap-4 items-center">
            <button
              onClick={onClose}
              disabled={isCreating}
              className="px-4 py-2 text-gray-400 hover:text-gray-500 font-medium transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleApplyPreset}
              disabled={!selectedPreset || isCreating}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                'Apply Preset'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkPresetModal;