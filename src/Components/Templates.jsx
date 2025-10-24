// import React, { useState } from 'react';

// const ProjectTemplates = () => {
//   const [activeTab, setActiveTab] = useState('All Templates');
//   const [searchQuery, setSearchQuery] = useState('');

//   const templates = [
//     {
//       id: 1,
//       title: "Kitchen Renovation",
//       description: "Complete kitchen remodel with modern appliances and finishes",
//       type: "renovation",
//       cards: 15,
//       duration: "8-12 weeks",
//       tags: ["kitchen", "renovation", "appliances", "cabinets"],
//       includedCards: [
//         { type: "site", title: "Demolition Phase", description: "Remove existing cabinets, countertops, and appliances" },
//         { type: "vendor", title: "Cabinet Supplier", description: "Local cabinet maker for custom kitchen units" },
//         { type: "inspiration", title: "Modern Kitchen Design", description: "Clean lines with quartz countertops and subway tile" },
//         { type: "note", title: "Client Preferences", description: "Prefers white/light colors, needs extra storage" }
//       ]
//     },
//     {
//       id: 2,
//       title: "Bathroom Remodel",
//       description: "Full bathroom renovation with luxury finishes",
//       type: "renovation",
//       cards: 12,
//       duration: "6-8 weeks",
//       tags: ["bathroom", "renovation", "tiles", "fixtures"],
//       includedCards: [
//         { type: "site", title: "Plumbing Updates", description: "Install new plumbing for updated layout" },
//         { type: "vendor", title: "Tile Supplier", description: "Premium tile showroom for natural stone" },
//         { type: "inspiration", title: "Spa-like Bathroom", description: "Natural stone with rainfall shower" },
//         { type: "note", title: "Accessibility Notes", description: "Consider grab bars and non-slip surfaces" }
//       ]
//     }
//   ];

//   const tabs = ["All Templates", "Residential", "Commercial", "Renovation", "New Construction"];

//   const filteredTemplates = templates.filter(template => {
//     const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                          template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
//     const matchesTab = activeTab === 'All Templates' || 
//                       template.type === activeTab.toLowerCase() ||
//                       template.tags.includes(activeTab.toLowerCase());
    
//     return matchesSearch && matchesTab;
//   });

// //   const getCardIcon = (type) => {
// //     switch(type) {
// //       case 'site': return '';
// //       case 'vendor': return '';
// //       case 'inspiration': return '';
// //       case 'note': return '';
// //       default: return '';
// //     }
// //   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Project Templates</h1>
//               <p className="text-gray-600 text-sm mt-1">Start your project with pre-built card templates</p>
//             </div>
//           </div>

//           {/* Search Bar */}
//           <div className="mb-4">
//             <input
//               type="text"
//               placeholder="Search templates..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
//             />
//           </div>

//           {/* Single Line Tabs */}
//           <div className="border-b border-gray-200">
//             <nav className="flex space-x-4">
//               {tabs.map((tab) => (
//                 <button
//                   key={tab}
//                   onClick={() => setActiveTab(tab)}
//                   className={`whitespace-nowrap py-2 px-3 border-b-2 font-medium text-xs ${
//                     activeTab === tab
//                       ? 'border-blue-500 text-blue-600'
//                       : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               ))}
//             </nav>
//           </div>
//         </div>

//         {/* Single Template Layout - Full Width */}
//         <div className="space-y-6">
//           {filteredTemplates.map((template) => (
//             <div
//               key={template.id}
//               className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-150 overflow-hidden"
//             >
//               <div className="p-6">
//                 {/* Template Header */}
//                 <div className="mb-6">
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex-1">
//                       <h3 className="text-2xl font-bold text-gray-900 mb-2">
//                         {template.title}
//                       </h3>
//                       <p className="text-gray-600 text-lg mb-4">
//                         {template.description}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Meta Information */}
//                   <div className="flex items-center gap-4 mb-4">
//                     <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
//                       {template.type}
//                     </span>
//                     <span className="text-gray-600 text-sm">•</span>
//                     <span className="text-gray-700 font-medium">{template.cards} cards</span>
//                     <span className="text-gray-600 text-sm">•</span>
//                     <span className="text-gray-700 font-medium">{template.duration}</span>
//                   </div>

//                   {/* Tags */}
//                   <div className="flex flex-wrap gap-2">
//                     {template.tags.map((tag) => (
//                       <span
//                         key={tag}
//                         className="inline-block bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg"
//                       >
//                         #{tag}
//                       </span>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Included Cards - Full Width Grid */}
//                 <div className="mb-6">
//                   <h4 className="text-lg font-semibold text-gray-900 mb-4">Included Cards:</h4>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//                     {template.includedCards.map((card, index) => (
//                       <div
//                         key={index}
//                         className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:bg-gray-100 transition-colors duration-150"
//                       >
//                         <div className="flex items-start space-x-3">
//                           <span className="text-lg flex-shrink-0 mt-0.5">
//                             {getCardIcon(card.type)}
//                           </span>
//                           <div className="flex-1 min-w-0">
//                             <h5 className="font-semibold text-gray-900 text-base mb-1">
//                               {card.title}
//                             </h5>
//                             <p className="text-gray-600 text-sm leading-relaxed">
//                               {card.description}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>

//                 {/* Use Template Button - Now Below Cards */}
//                 <div className="border-t border-gray-200 pt-6">
//                   <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-150 flex items-center justify-center space-x-2 text-base">
//                     <span className="text-lg">+</span>
//                     <span>Use Template</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Empty State */}
//         {filteredTemplates.length === 0 && (
//           <div className="text-center py-12">
//             <h3 className="text-xl font-medium text-gray-900 mb-2">No templates found</h3>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ProjectTemplates;

import React from 'react'

const Templates = () => {
  return (
    <div>sdu</div>
  )
}

export default Templates