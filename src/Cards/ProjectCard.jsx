import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../Components/StatusBadge';
import { useTheme } from '../Components/ThemeContext';
import AddMembersDropdown from '../AddingModal/AddMembersDropdown';

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const { isDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ right: 0, top: 0 });
  const menuRef = useRef(null);
  const kebabButtonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    onEdit?.(project);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete?.(project.id);
  };

  const handleAddMembersClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (kebabButtonRef.current) {
      const rect = kebabButtonRef.current.getBoundingClientRect();
      const cardRect = e.currentTarget.closest('.project-card-container')?.getBoundingClientRect();

      // Calculate position relative to card
      setMenuPosition({
        top: rect.bottom - (cardRect?.top || 0) + 8, // Position from top of card
        left: rect.right - (cardRect?.left || 0) - 260 // Align to the right (260 is dropdown width)
      });
    }

    setIsMenuOpen(false);
    setShowAddMembers(true);
  };

  return (
    <div className='relative'>
      <Link
        to={`/project/${project.id}`}
        className="rounded-lg shadow-sm border hover:shadow-2xl transition-all duration-200 h-full flex flex-col relative theme-bg-card theme-border hover:theme-bg-hover"
      >
        {/* Card Content */}
        <div className="flex-1 p-6">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold line-clamp-2 flex-1 mr-2 theme-text-primary">
              {project.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge
                status={project.status}
                dueDate={project.due_date || project.end_date || project.docDate}
              />

              {/* Kebab Menu */}
              <div className="relative" ref={menuRef}>
                <button
                  ref={kebabButtonRef}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMenuOpen(!isMenuOpen);
                  }}
                  className="p-1 rounded transition-colors duration-200 hover:theme-bg-hover text-gray-400 hover:text-gray-600"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>

                {/* Main Dropdown Menu */}
                {isMenuOpen && (
                  <div className="animate-fadeInUp absolute right-0 top-6 mt-1 w-40 rounded-md shadow-lg py-1 z-20 theme-bg-card theme-border">
                    <button
                      onClick={handleAddMembersClick}
                      className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2 hover:bg-gray-100 theme-text-primary"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      Add Members
                    </button>

                    <button
                      onClick={handleEdit}
                      className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2 hover:bg-gray-100 theme-text-primary"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>

                    <button
                      onClick={handleDelete}
                      className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2 hover:bg-gray-100 text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <p className="flex items-center gap-1 text-md mb-4 theme-text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
            </svg>
            {project.assignee}
          </p>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="flex items-center gap-1 text-sm font-medium theme-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg> Due Date
              </span>
              <span className={`text-sm font-medium ${project.isOverdue ? 'text-red-600' : 'theme-text-secondary'}`}>
                {project.docDate} {project.isOverdue && '(Overdue)'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1 text-sm theme-text-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg> Location
              </span>
              <span className="text-sm font-medium theme-text-secondary">
                {project.location}
              </span>
            </div>
          </div>

          {/* Block below the border */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <div className="flex items-center gap-1">
              <span className="text-sm theme-text-secondary">
                Cards:
              </span>
              <span className="text-sm font-medium theme-text-primary">
                {project.cardsCount}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm theme-text-secondary">
                Updated:
              </span>
              <span className="text-sm theme-text-secondary">
                {project.updated}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Add Members Dropdown */}
      <AddMembersDropdown
        project={project}
        isOpen={showAddMembers}
        onClose={() => setShowAddMembers(false)}
        position={menuPosition}
      />
    </div>
  );
};

export default ProjectCard;