import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import UseTemplateModal from './UseTemplateModal';

const defaultTemplates = [
  {
    id: 1,
    title: "Kitchen Renovation",
    description: "Complete kitchen remodel with modern appliances and finishes",
    type: "renovation",
    cards: 15,
    duration: "8-12 weeks",
    tags: ["kitchen", "renovation", "appliances", "cabinets"],
    includedCards: [
      { type: "site", title: "Demolition Phase", description: "Remove existing cabinets, countertops, and appliances" },
      { type: "vendor", title: "Cabinet Supplier", description: "Local cabinet maker for custom kitchen units" },
      { type: "inspiration", title: "Modern Kitchen Design", description: "Clean lines with quartz countertops and subway tile" },
      { type: "note", title: "Client Preferences", description: "Prefers white/light colors, needs extra storage" }
    ]
  },
  {
    id: 2,
    title: "Bathroom Remodel",
    description: "Full bathroom renovation with luxury finishes",
    type: "renovation",
    cards: 12,
    duration: "6-8 weeks",
    tags: ["bathroom", "renovation", "tiles", "fixtures"],
    includedCards: [
      { type: "site", title: "Plumbing Updates", description: "Install new plumbing for updated layout" },
      { type: "vendor", title: "Tile Supplier", description: "Premium tile showroom for natural stone" },
      { type: "inspiration", title: "Spa-like Bathroom", description: "Natural stone with rainfall shower" },
      { type: "note", title: "Accessibility Notes", description: "Consider grab bars and non-slip surfaces" }
    ]
  }
];

const ProjectTemplates = () => {
  const [activeTab, setActiveTab] = useState('All Templates');
  const [searchQuery, setSearchQuery] = useState(''); 
  const [templates, setTemplates] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTemplates, setselectedTemplates] =useState(null);
  const [isUseTemplateModalOpen, setIsUseTemplateModalOpen] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching templates from API...');
        const response = await fetch(`http://192.168.1.22:8087/api/templates/templates`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const rawData = await response.json();
        console.log('Raw API response:', rawData);

        let extractedTemplates = [];

        // Handle single template object
        if (rawData && typeof rawData === 'object' && rawData.template_id) {
          console.log('Single template object detected');
          
          //backend to frontend mapping
          const singleTemplate = {
            template_id: rawData.template_id,
            title: rawData.template_name,
            description: rawData.description,
            type: "assessment", 
            cards: rawData.files ? rawData.files.length : 0,
            duration: "Not specified",
            tags: ["site-assessment", "initial-visit", "protocol"],
            includedCards: [
              { 
                type: "site", 
                title: "Site Assessment", 
                description: "Document environmental factors and access issues" 
              },
              { 
                type: "note", 
                title: "Municipal Permits", 
                description: "Check required permits before project initiation" 
              }
            ]
          };

          extractedTemplates = [singleTemplate];
        }
        // handle array of templates
        else if (Array.isArray(rawData)) {
          extractedTemplates = rawData.map(item => ({
            template_id: item.template_id || item.id,
            title: item.template_name || item.title,
            description: item.description,
            type: item.type || "Residential",
            cards: item.files ? item.files.length : 0,
            duration: item.duration || "Not specified",
            tags: item.tags || [],
            includedCards: item.includedCards || [
              { type: item.type || "site", title: item.template_name || "Site Assessment", description: "Initial site evaluation" },
              { type: "note", title: "Project Notes", description: "Important project considerations" }
            ]
          }));
        }
        //object with templates array

        else if (rawData && Array.isArray(rawData.templates)) {
          extractedTemplates = rawData.templates;
        }
        // fallback to default templates if no valid data
        else {
          console.warn('No valid template data found in API response, using default templates');
          extractedTemplates = defaultTemplates;
        }

        console.log('Final templates:', extractedTemplates);
        setTemplates(extractedTemplates);
        
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(`Failed to load templates: ${err.message}`);
        console.log('Falling back to default templates');
        setTemplates(defaultTemplates);
      } finally {
        setLoading(false);
      }
    }; 
    
    fetchTemplates();
  }, []);

  const tabs = ["All Templates", "Residential", "Commercial", "Renovation", "New Construction"];

  const filteredTemplates = templates.filter(template => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      template.title?.toLowerCase().includes(searchLower) ||
      template.description?.toLowerCase().includes(searchLower) ||
      template.tags?.some(tag => tag.toLowerCase().includes(searchLower));
    
    const matchesTab = activeTab === 'All Templates' || 
                      template.type?.toLowerCase() === activeTab.toLowerCase() ||
                      template.tags?.includes(activeTab.toLowerCase());
    
    return matchesSearch && matchesTab;
  });

  const getCardIcon = (type) => {
    switch(type) {
      case 'site': return '';
      case 'vendor': return '';
      case 'inspiration': return '';
      case 'note': return '';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen theme-bg-primary py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center theme-text-secondary hover:theme-text-primary mb-6">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl theme-text-primary font-bold">Project Templates</h1>
              <p className="text-sm mt-1">Start your project with pre-built card templates</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 theme-border rounded-sm theme-bg-card theme-text-primary focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Single Line Tabs */}
          <div className="border-b theme-border mb-6">
            <nav className="mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-xs ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading templates...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-4 rounded-lg ">
              <p className=" font-medium">{error}</p>
              <p className="text-sm  mt-1">
                Showing default templates instead
              </p>
            </div>
          )}

          {/* Templates */}
          {!loading && filteredTemplates.length > 0 && (
            <div className="space-y-6 theme-bg-secondary rounded-lg">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="theme-bg-card rounded-lg shadow-sm theme-border hover:shadow-md transition-shadow duration-150 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="mb-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold theme-text-primary mb-2">
                            {template.title}
                          </h3>
                          <p className="theme-text-secondary text-lg mb-4">
                            {template.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                          {template.type}
                        </span>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-500 font-medium">{template.cards} cards</span>
                        <span className="text-gray-500 text-sm">•</span>
                        <span className="text-gray-500 font-medium">{template.duration}</span>
                      </div>

                      {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {template.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-block theme-bg-primary theme-text-primary text-sm px-3 py-1.5 rounded-lg"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-semibold theme-text-primary mb-4">Included Cards:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {template.includedCards.map((card, index) => (
                          <div
                            key={index}
                            className="theme-bg-primary rounded-lg p-4 theme-border hover:bg-gray-100 transition-colors duration-150"
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-lg shrink-0 mt-0.5">
                                {getCardIcon(card.type)}
                              </span>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold theme-text-primary text-base mb-1">
                                  {card.title}
                                </h5>
                                <p className="theme-text-primary text-sm leading-relaxed">
                                  {card.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                      {/* use Template */}
                    <div className="border-t border-gray-200 pt-6">
                      <button onClick={() => {
                        setselectedTemplates(template);
                        setIsUseTemplateModalOpen(true);
                      }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 flex items-center justify-center space-x-2 text-base">
                        <span className="text-lg">+</span>
                        <span>Use Template</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isUseTemplateModalOpen && selectedTemplate && (
  <UseTemplateModal
    template={selectedTemplate}
    onClose={() => {
      setIsUseTemplateModalOpen(false);
      setSelectedTemplate(null);
    }}
    onSave={(projectData) => {
      // Handle creating project from template
      console.log('Creating project from template:', projectData);
      setIsUseTemplateModalOpen(false);
      setSelectedTemplate(null);
    }}
  />
)}

          {!loading && !error && filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-600">
                {searchQuery ? 'Try adjusting your search terms' : 'No templates available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectTemplates;