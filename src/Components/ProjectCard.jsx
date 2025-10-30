import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { useTheme } from './ThemeContext';

const ProjectCard = ({ project }) => {
  const { isDark } = useTheme(); // Get theme state

  return (
    <div className={`
      rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 w-full
      ${isDark 
        ? 'theme-bg-card theme-border' 
        : 'bg-gradient-to-r from-blue-100 to-slate-200 border-gray-200'
      }
    `}>
      <div className="flex flex-col md:flex-row">
        <div className={`
          flex-1 p-6 border-b md:border-b-0 md:border-r
          ${isDark ? 'theme-border' : 'border-gray-100'}
        `}>
          <div className="flex justify-between items-start mb-3">
            {/*Hardcoded in light, theme in dark */}
            <h3 className={`
              text-lg font-semibold
              ${isDark ? 'theme-text-primary' : 'text-gray-900'}
            `}>
              {project.title}
            </h3>
            <StatusBadge status={project.status} />
          </div>
          
          {/* CONDITIONAL TEXT COLORS */}
          <p className={`
            text-sm mb-4
            ${isDark ? 'theme-text-secondary' : 'text-gray-600'}
          `}>
            Assignee: {project.assignee}
          </p>
          
          <div className="mb-3">
            <div className="flex justify-between items-center">
              <span className={`
                text-sm font-medium
                ${isDark ? 'theme-text-secondary' : 'text-gray-700'}
              `}>
                Due Date
              </span>

              <span className={`text-sm font-medium ${project.isOverdue ? 'text-red-600' : (
                isDark ? 'theme-text-secondary' : 'text-gray-500'
              )}`}>
                {project.docDate} {project.isOverdue && '(Overdue)'}
              </span>
            </div>
            <p className={`
              text-sm mt-1
              ${isDark ? 'theme-text-secondary' : 'text-gray-600'}
            `}>
              {project.cardsCount} cards
            </p>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`
                text-sm
                ${isDark ? 'theme-text-secondary' : 'text-gray-600'}
              `}>
                Location
              </span>
              <span className={`
                text-sm font-medium
                ${isDark ? 'theme-text-primary' : 'text-gray-900'}
              `}>
                {project.location}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`
                text-sm
                ${isDark ? 'theme-text-secondary' : 'text-gray-600'}
              `}>
                Updated
              </span>
              <span className={`
                text-sm
                ${isDark ? 'theme-text-secondary' : 'text-gray-500'}
              `}>
                {project.updated}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CONDITIONAL FOOTER */}
  <Link
  to={`/project/${project.id}`}
  className={`
    group block px-6 py-3 border-t rounded-b-lg transition-colors duration-200
    ${isDark
      ? 'theme-bg-secondary theme-border hover:theme-bg-hover'
      : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
    }
  `}
>
  {/* View Details Footer */}
  <div
    className={`
      flex justify-between items-center text-xs transition-colors duration-200
      ${isDark
        ? 'theme-bg-secondary group-hover:theme-bg-hover group-hover:theme-text-primary theme-text-secondary'
        : 'text-gray-500 group-hover:text-gray-900'
      }
    `}
  >
    <span>View details</span>
    <svg
      className="w-4 h-4 transition-colors duration-200 group-hover:text-current"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </div>
</Link>
    </div>
  );
};

export default ProjectCard;