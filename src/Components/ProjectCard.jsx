import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { useTheme } from './Theme';

const ProjectCard = ({ project }) => {
  return (
    <div className="bg-gradient-to-r from-blue-100 to-slate-200 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 w-full">
      <div className="flex flex-col md:flex-row">
        <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-gray-900">{project.title}</h3>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-sm text-gray-600 mb-4">Assignee: {project.assignee}</p>
          
          <div className="mb-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Due Date</span>
              <span className={`text-sm font-medium ${project.isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                {project.docDate} {project.isOverdue && '(Overdue)'}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{project.cardsCount} cards</p>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Location</span>
              <span className="text-sm text-gray-900 font-medium">{project.location}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Updated</span>
              <span className="text-sm text-gray-500">{project.updated}</span>
            </div>
          </div>
        </div>
      </div>

      <Link 
        to={`/project/${project.id}`} 
        className="block px-6 py-3 bg-gray-50 border-t border-gray-100 rounded-b-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>View details</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Link>
    </div>
  );
};

export default ProjectCard;