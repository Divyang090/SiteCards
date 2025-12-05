import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../Components/ThemeContext';
import { useAuth } from '../Components/AuthContext';

const AddMembersDropdown = ({ 
  project, 
  isOpen, 
  onClose, 
  position = { right: 0, top: 0 }
}) => {
  const { isDark } = useTheme();
  const { authFetch } = useAuth();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingMembers, setAddingMembers] = useState({});
  const [addedMembers, setAddedMembers] = useState({});
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Fetch members when dropdown opens
  useEffect(() => {
    if (isOpen && project?.id) {
      fetchMembers();
    }
  }, [isOpen, project?.id]);

  // Filter members based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMembers(members);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = members.filter(member =>
        member.user_name?.toLowerCase().includes(query) ||
        member.user_email?.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, members]);

  // Fetch members from API
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const response = await authFetch(
        `http://127.0.0.1:5000/user/get_users_by_company/${project?.company_id || ''}`
      );

      if (!response.ok) throw new Error('Failed to fetch members');

      const data = await response.json();
      const membersList = Array.isArray(data) ? data : [];
      
      setMembers(membersList);
      setFilteredMembers(membersList);
      
      // TODO: Fetch already added members for this project
      // fetchExistingMembers();
      
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
      setFilteredMembers([]);
    } finally {
      setLoading(false);
    }
  };

  // Add members to project API
  const addMembersToProject = async (userIds) => {
    try {
      const response = await authFetch(
        `http://127.0.0.1:5000/api/companies/projects/${project.id}/members`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_ids: userIds,
            role: 'member'
          })
        }
      );

      if (!response.ok) throw new Error('Failed to add members');

      const data = await response.json();
      console.log('Add members response:', data);
      
      // Update added members state based on API response
      const newAddedMembers = { ...addedMembers };
      userIds.forEach(userId => {
        newAddedMembers[userId] = true;
      });
      setAddedMembers(newAddedMembers);
      
      return data;
    } catch (error) {
      console.error('Error adding members:', error);
      throw error;
    }
  };

  // Handle adding/removing a member
  const handleMemberAction = async (member) => {
    const isCurrentlyAdded = addedMembers[member.user_id];
    
    // If already added, remove it
    if (isCurrentlyAdded) {
      // TODO: Implement remove member API if needed
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
      await addMembersToProject([member.user_id]);
      setAddingMembers(prev => ({ ...prev, [member.user_id]: 'success' }));
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setAddingMembers(prev => ({ ...prev, [member.user_id]: false }));
      }, 2000);
      
    } catch (error) {
      console.error('Error adding member:', error);
      setAddingMembers(prev => ({ ...prev, [member.user_id]: 'error' }));
      
      // Reset error state after 1 second
      setTimeout(() => {
        setAddingMembers(prev => ({ ...prev, [member.user_id]: false }));
      }, 1000);
    }
  };

  // Get button state
  const getMemberButtonState = (memberId) => {
    if (addedMembers[memberId]) return 'added';
    const state = addingMembers[memberId];
    if (state === true) return 'loading';
    if (state === 'success') return 'success';
    if (state === 'error') return 'error';
    return 'default';
  };

  // Render member button
  const renderMemberButton = (member) => {
    const state = getMemberButtonState(member.user_id);
    const isAdded = state === 'added';

    const buttonClasses = `w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
      state === 'loading' 
        ? 'bg-blue-100 text-blue-600 cursor-wait' 
        : state === 'success'
        ? 'bg-green-100 text-green-600'
        : state === 'error'
        ? 'bg-red-100 text-red-600'
        : isAdded
        ? 'bg-red-100 text-red-600 hover:bg-red-200'
        : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
    }`;

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleMemberAction(member);
        }}
        disabled={state === 'loading'}
        className={buttonClasses}
        title={
          state === 'success' ? 'Added' : 
          state === 'error' ? 'Failed' : 
          isAdded ? 'Remove from project' : 
          'Add to project'
        }
      >
        {state === 'loading' ? (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : isAdded ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
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

  // Separate added and not added members
  const addedMembersList = filteredMembers.filter(member => addedMembers[member.user_id]);
  const notAddedMembersList = filteredMembers.filter(member => !addedMembers[member.user_id]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={`fixed animate-fadeInUp rounded-md shadow-2xl py-2 z-50
        ${isDark
          ? 'theme-bg-card theme-border'
          : 'bg-white border border-gray-200'
        }`}
      style={{
        width: '320px',
        right: position.right,
        top: position.top,
        maxHeight: '80vh'
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className={`font-medium text-sm ${isDark ? 'theme-text-primary' : 'text-gray-700'}`}>
            Add Members to {project?.title || 'Project'}
          </h4>
          <button
            onClick={onClose}
            className={`p-1 rounded ${isDark ? 'hover:theme-bg-hover' : 'hover:bg-gray-100'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-3 py-2 text-sm rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark 
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
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 120px)' }}>
        {loading ? (
          <div className="py-8 flex justify-center">
            <svg className="animate-spin w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className={`py-8 text-center text-sm ${isDark ? 'theme-text-secondary' : 'text-gray-500'}`}>
            {searchQuery ? 'No members found' : 'No members available'}
          </div>
        ) : (
          <>
            {/* Added Members Section */}
            {addedMembersList.length > 0 && (
              <>
                <div className={`px-4 py-2 ${isDark ? 'theme-text-primary' : 'text-gray-700'}`}>
                  <div className="text-xs font-medium uppercase tracking-wider">
                    Added to Project ({addedMembersList.length})
                  </div>
                </div>
                <div className="space-y-1 px-2 mb-3">
                  {addedMembersList.map((member) => (
                    <div
                      key={member.user_id}
                      className={`flex items-center justify-between px-3 py-2 rounded transition-colors duration-200 ${
                        isDark ? 'hover:theme-bg-hover' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className={`font-medium text-sm truncate ${isDark ? 'theme-text-primary' : 'text-gray-700'}`}>
                          {member.user_name}
                        </div>
                        <div className={`text-xs truncate ${isDark ? 'theme-text-secondary' : 'text-gray-500'}`}>
                          {member.user_email}
                        </div>
                      </div>
                      {renderMemberButton(member)}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Separator */}
            {addedMembersList.length > 0 && notAddedMembersList.length > 0 && (
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className={`w-full border-t ${isDark ? 'theme-border' : 'border-gray-200'}`}></div>
                </div>
                <div className="relative flex justify-center">
                  <span className={`px-3 text-xs font-medium ${isDark ? 'theme-bg-card theme-text-secondary' : 'bg-white text-gray-500'}`}>
                    Not Added
                  </span>
                </div>
              </div>
            )}

            {/* Not Added Members Section */}
            {notAddedMembersList.length > 0 && (
              <div className="space-y-1 px-2 mt-3">
                {notAddedMembersList.map((member) => (
                  <div
                    key={member.user_id}
                    className={`flex items-center justify-between px-3 py-2 rounded transition-colors duration-200 ${
                      isDark ? 'hover:theme-bg-hover' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className={`font-medium text-sm truncate ${isDark ? 'theme-text-primary' : 'text-gray-700'}`}>
                        {member.user_name}
                      </div>
                      <div className={`text-xs truncate ${isDark ? 'theme-text-secondary' : 'text-gray-500'}`}>
                        {member.user_email}
                      </div>
                    </div>
                    {renderMemberButton(member)}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className={`px-4 py-3 border-t text-xs ${isDark ? 'theme-border theme-text-secondary' : 'border-gray-200 text-gray-500'}`}>
        <div className="flex justify-between">
          <span>Added: {addedMembersList.length}</span>
          <span>Not Added: {notAddedMembersList.length}</span>
          <span>Total: {filteredMembers.length}</span>
        </div>
      </div>
    </div>
  );
};

export default AddMembersDropdown;