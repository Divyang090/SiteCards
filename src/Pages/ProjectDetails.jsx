import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

const ProjectDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('All'); // State for active tab
  
  const projects = {
    1: {
      title: "Modern Downtown Loft",
      assignee: "Sarah Johnson",
      status: "Progress",
      dueDate: "Jan 15, 2024",
      location: "Downtown, NYC",
      description: "Complete renovation of a 2-bedroom loft with modern finishes and smart home integration.",
      board: "Site Map",
      cards: [
        {
          id: 1,
          title: "Modern Kitchen Design",
          description: "Stock white cabinets with quartz countertops",
          category: "Inspiration",
          type: "Reference",
          priority: "medium priority",
          tags: ["#design", "#kitchen", "#modern"],
          created: "Jan 3",
          updated: "Jan 3",
          tab: "Site"
        },
        {
          id: 2,
          title: "Bathroom Tile Selection",
          description: "Porcelain tiles with matte finish",
          category: "Materials",
          type: "Selection",
          priority: "high priority",
          tags: ["#materials", "#bathroom", "#tiles"],
          created: "Jan 5",
          updated: "Jan 6",
          tab: "Site"
        },
        {
          id: 3,
          title: "Open Concept Layout",
          description: "Remove wall between kitchen and living area",
          category: "Ideas",
          type: "Concept",
          priority: "low priority",
          tags: ["#layout", "#concept", "#modern"],
          created: "Jan 2",
          updated: "Jan 2",
          tab: "Ideas"
        },
        {
          id: 4,
          title: "Local Contractors",
          description: "List of recommended contractors in NYC area",
          category: "Vendors",
          type: "Contact",
          priority: "medium priority",
          tags: ["#contractors", "#vendors", "#local"],
          created: "Jan 4",
          updated: "Jan 4",
          tab: "Vendors"
        },
        {
          id: 5,
          title: "Client Preferences",
          description: "Notes from client meeting about design preferences",
          category: "Notes",
          type: "Meeting",
          priority: "high priority",
          tags: ["#client", "#meeting", "#preferences"],
          created: "Jan 1",
          updated: "Jan 3",
          tab: "Notes"
        }
      ]
    },
    2: {
      title: "Suburban Family Home",
      assignee: "The Martinez Family",
      status: "Progress",
      dueDate: "Feb 28, 2024",
      location: "Westchester, NY",
      description: "Family home renovation with focus on functionality and comfort.",
      board: "Site Plan",
      cards: [
        {
          id: 1,
          title: "Backyard Landscape Design",
          description: "Child-friendly garden with play area",
          category: "Ideas",
          type: "Concept",
          priority: "medium priority",
          tags: ["#landscape", "#garden", "#family"],
          created: "Jan 10",
          updated: "Jan 10",
          tab: "Ideas"
        }
      ]
    },
    3: {
      title: "Corporate Office Redesign",
      assignee: "TechCorp Inc.",
      status: "Progress",
      dueDate: "Jan 20, 2024",
      location: "Midtown, NYC",
      description: "Modern office space redesign to promote collaboration.",
      board: "Floor Plan",
      cards: [
        {
          id: 1,
          title: "Collaboration Spaces",
          description: "Design for open collaboration areas",
          category: "Site",
          type: "Layout",
          priority: "high priority",
          tags: ["#collaboration", "#spaces", "#office"],
          created: "Jan 7",
          updated: "Jan 8",
          tab: "Site"
        }
      ]
    }
  };

  const project = projects[id];

  // Filter cards based on active tab
  const filteredCards = activeTab === 'All' 
    ? project?.cards || []
    : project?.cards.filter(card => card.tab === activeTab) || [];

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Project Not Found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800 mt-4 inline-block">
            ← Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  const tabs = ['All', 'Site', 'Ideas', 'Vendors', 'Notes'];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Projects
        </Link>

        {/* Project Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
            <span>• {project.assignee}</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {project.status}
            </span>
            <span>• Due {project.dueDate}</span>
            <span>• {project.location}</span>
          </div>

          <div className="border-t border-b border-gray-200 py-4 my-6">
            <p className="text-gray-700">{project.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-500">Board</span>
              <p className="text-gray-900 font-semibold">{project.board}</p>
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredCards.length} of {project.cards?.length || 0} cards
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
                {tab !== 'All' && project.cards && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-100 rounded-full">
                    {project.cards.filter(card => card.tab === tab).length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Site Cards Section */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Site Cards</h2>
            <span className="text-sm text-gray-500">
              {activeTab === 'All' ? 'All Cards' : `${activeTab} Cards`}
            </span>
          </div>
          
          {filteredCards.length > 0 ? (
            <div className="space-y-4">
              {filteredCards.map((card) => (
                <div key={card.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                  {/* Card Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{card.title}</h3>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        {card.tab}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>Created {card.created}</span>
                      <span>•</span>
                      <span>Updated {card.updated}</span>
                    </div>
                  </div>

                  {/* Card Description */}
                  <p className="text-gray-700 mb-4">{card.description}</p>

                  {/* Card Metadata */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Category</span>
                      <span className="text-gray-900">{card.category}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Type</span>
                      <span className="text-gray-900">{card.type}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 block">Priority</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        card.priority === 'high priority' ? 'bg-red-100 text-red-800' :
                        card.priority === 'medium priority' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {card.priority}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">No cards found</p>
              <p className="text-gray-400 text-sm">
                {activeTab === 'All' 
                  ? "This project doesn't have any site cards yet." 
                  : `No ${activeTab.toLowerCase()} cards found.`}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200">
            Edit Project
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200">
            Add Site Card
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;