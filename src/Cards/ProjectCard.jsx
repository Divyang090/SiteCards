import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../Components/StatusBadge';
import { useTheme } from '../Components/ThemeContext';
import { BASE_URL } from '../Configuration/Config';
import { useAuth } from '../Components/AuthContext'; // Add this import

const ProjectCard = ({ project, onEdit, onDelete }) => {
  const { isDark } = useTheme();
  const { user, authFetch } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMembersDropdownOpen, setIsMembersDropdownOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingMembers, setAddingMembers] = useState({});
  const menuRef = useRef(null);
  const membersDropdownRef = useRef(null);
  const [addedMembers, setAddedMembers] = useState({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (membersDropdownRef.current && !membersDropdownRef.current.contains(event.target)) {
        setIsMembersDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch members when dropdown opens
  useEffect(() => {
    if (isMembersDropdownOpen && user?.company_id) {
      fetchMembers();
    }
  }, [isMembersDropdownOpen, user?.company_id]);

  // Filter members based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = members.filter(member =>
        member.user_name.toLowerCase().includes(query) ||
        member.user_email.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  //Fetch Members
  const fetchMembers = async () => {
    console.log('🔍 fetchMembers called');
    console.log('User company_id:', user?.company_id);

    if (!user?.company_id) {
      console.error('❌ No company_id found');
      return;
    }

    setLoading(true);
    try {
      const apiUrl = `${BASE_URL}/user/get_users_by_company/${user.company_id}`;
      console.log('📡 API URL:', apiUrl);

      // Try with authFetch first
      const response = await authFetch(apiUrl);

      console.log('📨 Response status:', response.status);
      console.log('📨 Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`API failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ API Success - Data:', data);

      // Transform the data to match your expected format
      const membersList = Array.isArray(data) ? data : [];
      console.log('👥 Members transformed:', membersList);

      setMembers(membersList);
      setFilteredMembers(membersList);

    } catch (error) {
      console.error('❌ Error fetching members:', error);

      // Fallback: Try direct fetch
      try {
        const token = localStorage.getItem('accessToken');
        const apiUrl = `${BASE_URL}/api/user/get_users_by_company/${user.company_id}`;

        const directResponse = await fetch(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (directResponse.ok) {
          const directData = await directResponse.json();
          console.log('✅ Direct fetch success:', directData);

          const membersList = Array.isArray(directData) ? directData : [];
          setMembers(membersList);
          setFilteredMembers(membersList);
        }
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        setMembers([]);
        setFilteredMembers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (member) => {
    console.log('Adding member:', member);
    const isCurrentlyAdded = addedMembers[member.user_id];

    // If already added, remove it
    if (isCurrentlyAdded) {
      setAddedMembers(prev => {
        const newState = { ...prev };
        delete newState[member.user_id];
        return newState;
      });
      return;
    }

    // If not added, add it
    setAddingMembers(prev => ({ ...prev, [member.user_id]: true }));

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mark as added successfully
      setAddedMembers(prev => ({ ...prev, [member.user_id]: true }));
      setAddingMembers(prev => ({ ...prev, [member.user_id]: 'success' }));

    } catch (error) {
      console.error('Error adding member:', error);
      setAddingMembers(prev => ({ ...prev, [member.user_id]: 'error' }));
    }
  };

  //edit handler
  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    onEdit?.(project);
  };

  //delete
  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    onDelete?.(project.id);
  };

  const handleAddMembersClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(false);
    setIsMembersDropdownOpen(true);
  };

  const getMemberButtonState = (memberId) => {
    const state = addingMembers[memberId];
    if (state === true) return 'loading';
    if (state === 'success') return 'success';
    if (state === 'error') return 'error';
    return 'default';
  };

  const renderMemberButton = (member) => {
    const state = getMemberButtonState(member.user_id);

    const buttonClasses = `w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${state === 'loading'
      ? 'bg-blue-100 text-blue-600 cursor-wait'
      : state === 'success'
        ? 'bg-green-100 text-green-600'
        : state === 'error'
          ? 'bg-red-100 text-red-600'
          : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
      }`;

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleAddMember(member);
        }}
        disabled={state === 'loading'}
        className={buttonClasses}
        title={state === 'success' ? 'Added' : state === 'error' ? 'Failed' : 'Add to project'}
      >
        {state === 'loading' ? (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : state === 'success' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        ) : state === 'error' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
        )}
      </button>
    );
  };

  return (
    <Link
      to={`/project/${project.id}`}
      className={`
        rounded-lg shadow-sm border hover:shadow-md transition-all duration-200 
        h-full flex flex-col relative
        ${isDark
          ? 'theme-bg-card theme-border hover:theme-bg-hover'
          : 'bg-white border-gray-200 hover:bg-blue-50'
        }
      `}
    >
      {/* Card Content */}
      <div className="flex-1 p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className={`text-lg font-semibold line-clamp-2 flex-1 mr-2
            ${isDark ? 'theme-text-primary' : 'text-gray-800'}`}>
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                  setIsMembersDropdownOpen(false);
                }}
                className={`p-1 rounded transition-colors duration-200
                  ${isDark
                    ? 'hover:theme-bg-hover text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                  }`}
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
              {isMenuOpen && !isMembersDropdownOpen && (
                <div
                  className={`animate-fadeInUp absolute right-0 top-6 mt-1 w-40 rounded-md shadow-lg py-1 z-20 
                    ${isDark
                      ? 'theme-bg-card theme-border'
                      : 'bg-white border border-gray-200'
                    }`}
                >
                  <button
                    onClick={handleAddMembersClick}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2
                      ${isDark
                        ? 'hover:theme-bg-hover theme-text-primary'
                        : 'hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Members
                  </button>

                  <button
                    onClick={handleEdit}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2
                      ${isDark
                        ? 'hover:theme-bg-hover theme-text-primary'
                        : 'hover:bg-gray-100 text-gray-700'
                      }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>

                  <button
                    onClick={handleDelete}
                    className={`block w-full text-left px-4 py-2 text-sm transition-colors duration-200 flex items-center gap-2
                      ${isDark
                        ? 'hover:theme-bg-hover text-red-400'
                        : 'hover:bg-gray-100 text-red-600'
                      }`}
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

        {/* Members Dropdown (Shows when Add Members is clicked) */}
        {isMembersDropdownOpen && (
          <div
            ref={membersDropdownRef}
            className={`animate-fadeInUp absolute right-0 top-10 mt-2 w-60 rounded-md shadow-2xl py-2 z-30
              ${isDark
                ? 'theme-bg-card theme-border'
                : 'bg-white border border-gray-200'
              }`}
            style={{ minWidth: '280px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-2 py-2 border-b border-gray-200">

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
                    ? 'theme-bg-primary theme-border theme-text-primary'
                    : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  onClick={(e) => e.stopPropagation()}
                />
                <svg
                  className={`absolute right-3 top-2.5 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Members List */}
            <div className="max-h-60 overflow-y-auto px-2">
              {loading ? (
                <div className="py-4 flex justify-center">
                  <svg className="animate-spin w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className={`py-4 text-center text-sm ${isDark ? 'theme-text-secondary' : 'text-gray-500'}`}>
                  {searchQuery ? 'No members found' : 'No members available'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-1 py-1">
                  {/* Members */}
                  {filteredMembers.map((member) => (
                    <div
                      key={member.user_id}
                      className={`flex items-center justify-between px-3 py-2 rounded transition-colors duration-200 border-t border-b theme-border ${isDark ? 'hover:theme-bg-hover' : 'hover:shadow-xl'
                        }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className={`font-medium text-sm truncate ${isDark ? 'theme-text-primary' : 'text-gray-700'}`}>
                          {member.user_name}
                        </div>
                        <div className={`text-xs truncate ${isDark ? 'theme-text-secondary' : 'text-gray-500'}`}>
                          {member.user_email}
                        </div>
                        {/* {member.created_at && (
                          <div className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            Joined: {new Date(member.created_at).toLocaleDateString()}
                          </div>
                        )} */}
                      </div>
                      {renderMemberButton(member)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className={`px-4 py-2 border-t text-xs ${isDark ? 'theme-border theme-text-secondary' : 'border-gray-200 text-gray-500'}`}>
              {filteredMembers.length} of {members.length} members shown
            </div>
          </div>
        )}

        <p
          className={`flex items-center gap-1 text-md mb-4 ${isDark ? 'theme-text-secondary' : 'text-gray-600'}`}
        >
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
            <span className={` flex items-center gap-1 text-sm font-medium
              ${isDark ? 'theme-text-secondary' : 'text-gray-700'}
            `}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg> Due Date
            </span>
            <span className={`text-sm font-medium ${project.isOverdue ? 'text-red-600' : (
              isDark ? 'theme-text-secondary' : 'text-gray-500'
            )}`}>
              {project.docDate} {project.isOverdue && '(Overdue)'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className={` flex items-center gap-1 text-sm
              ${isDark ? 'theme-text-secondary' : 'text-gray-700'}
            `}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M21 10c0 6-9 13-9 13S3 16 3 10a9 9 0 0 1 18 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg> Location
            </span>
            <span className={`
              text-sm font-medium
              ${isDark ? 'theme-text-secondary' : 'text-gray-500'}
            `}>
              {project.location}
            </span>
          </div>
        </div>

        {/* Block below the border */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <div className="flex items-center gap-1">
            <span className={`
              text-sm
              ${isDark ? 'theme-text-secondary' : 'text-gray-600'}
            `}>
              Cards:
            </span>
            <span className={`
              text-sm font-medium
              ${isDark ? 'theme-text-primary' : 'text-gray-900'}
            `}>
              {project.cardsCount}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`
              text-sm
              ${isDark ? 'theme-text-secondary' : 'text-gray-600'}
            `}>
              Updated:
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
    </Link>
  );
};

export default ProjectCard;