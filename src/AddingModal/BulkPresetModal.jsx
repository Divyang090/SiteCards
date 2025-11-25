import React, { useState, useEffect } from 'react';
import { useStatusMessage } from '../Alerts/StatusMessage';
import { BASE_URL } from '../Configuration/Config';
import { useParams } from 'react-router-dom';

const BulkPresetModal = ({ isOpen, onClose, onSiteMapsCreated, projectId, setRefreshTrigger }) => {
  const [presets, setPresets] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const { showMessage } = useStatusMessage();

  const groupPresets = (data) => {
    const map = {};

    data.forEach(item => {
      if (!map[item.preset_id]) {
        map[item.preset_id] = {
          preset_id: item.preset_id,
          preset_name: item.preset_name,
          preset_description: item.preset_description,
          spaces: []
        };
      }

      map[item.preset_id].spaces.push(item.space_details.space_name);
    });

    return Object.values(map);
  };


  // Fetch presets from backend
  useEffect(() => {
    const fetchPresets = async () => {
      const res = await fetch(`${BASE_URL}/preset/presets`)
      const data = await res.json();

      const grouped = groupPresets(data);
      setPresets(grouped);
    };

    fetchPresets();
  }, []);


  // Apply preset → fetch spaces for that preset
  const handleApplyPreset = async () => {
    if (!selectedPreset) return;

    setIsApplying(true);

    try {

      const res = await fetch(
        `${BASE_URL}/spaces/projects/${projectId}/apply-preset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ preset_id: selectedPreset.preset_id })
        }
      );

      const data = await res.json();

      if (res.ok) {
        showMessage("Preset applied successfully!", "success");
        setRefreshTrigger(prev => prev + 1);

        if (data.spaces) {
          onSiteMapsCreated(data.spaces);
        }

        onClose();
      } else {
        showMessage(data.message || "Failed to apply preset", "error");
      }

    } catch (err) {
      console.error("Error applying preset:", err);
      showMessage("Failed to apply preset", "error");
    } finally {
      setIsApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]"
      onClick={onClose}>
      <div className="theme-bg-card rounded-lg shadow-xl w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-500">
          <h2 className="text-xl font-semibold theme-text-primary">Choose Preset</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-400">Loading presets...</p>
          ) : (
            presets.map((preset) => (
              <div key={preset.preset_id} className="mb-6 last:mb-0">
                <div
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${selectedPreset?.preset_id === preset.preset_id
                    ? "border-green-500"
                    : "border-gray-200 hover:border-gray-300"
                    }`}
                  onClick={() => setSelectedPreset(preset)}
                >
                  <h3 className="text-lg font-medium theme-text-primary mb-1">
                    {preset.preset_name}
                  </h3>
                  <p className="text-sm theme-text-secondary mb-3">
                    {preset.preset_description || "No description"}
                  </p>
                </div>

                <div className="flex items-center my-4">
                  <div className="flex-1 border-t border-gray-500"></div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-500 theme-bg-secondary rounded-b-lg">
          <div className="flex justify-end gap-4 items-center">
            <button
              onClick={onClose}
              disabled={isApplying}
              className="px-4 py-2 text-gray-400 hover:text-gray-500 font-medium transition-colors duration-200 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              onClick={handleApplyPreset}
              disabled={!selectedPreset || isApplying}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 hover:bg-blue-700 flex items-center gap-2"
            >
              {isApplying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Loading...
                </>
              ) : (
                "Apply Preset"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BulkPresetModal;