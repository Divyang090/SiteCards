import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { ThemeProvider } from './Components/ThemeContext';
import Header from './Components/Header';
import ProjectCard from './Cards/ProjectCard';
import SearchBar from './Components/SearchBar';
import ProjectDetails from './Pages/ProjectDetails';
import NewProjectModal from './AddingModal/NewProjectModal';
import AuthModal from './Components/AuthModal';
import Templates from './Components/ProjectTemplates';
import StatusMessageProvider, { useStatusMessage } from './Alerts/StatusMessage';
import EditProjectModal from './EditModal/EditProjectModal';
import { BASE_URL } from './Configuration/Config';
import InspirationClickModal from './Components/InspirationClickModal';
import { AuthProvider } from './Components/AuthContext';
import { useAuth } from './Components/AuthContext';
import ForgotPasswordModal from './Components/ForgotPasswordModal';
import AuthDebug from './Pages/AuthDebug';
import AddMembersModal from './AddingModal/AddMembersModal';
import InviteAccept from './Components/InviteAccept';
import PinterestCallback from './Components/PinterestCallback';

const HomeWithDelete = ({ projects, onAddProject, onLoginClick, onSearch, onFilter, searchTerm, projectsloading, error, activeProjectsCount, onDeleteProject, onEditProject }) => {
  const { showMessage, showConfirmation } = useStatusMessage();
  const [statusFilter, setStatusFilter] = useState('all');
  const { authFetch } = useAuth();

  const handleDeleteWithMessage = async (projectId) => {
    console.log('Project ID received:', projectId);
    console.log('Project objects:', projects.find(p => p.id === projectId));

    const projectToDelete = projects.find(project => project.id === projectId);
    const projectTitle = projectToDelete?.title || 'this project';

    showConfirmation(
      'Delete Project',
      `Are you sure you want to delete "${projectTitle}"? This action cannot be undone`,
      async () => {
        try {
          console.log('Deleting project:', projectId);

          const response = await authFetch(`${BASE_URL}/projects/projects/${projectId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            onDeleteProject(projectId);
            showMessage(`Project "${projectTitle}" deleted successfully!`, 'success');
          } else {
            const errorText = await response.text();
            throw new Error(`Failed to delete project: ${errorText}`);
          }
        } catch (error) {
          console.error('Error deleting project:', error);
          showMessage(`Failed to delete project "${projectTitle}": ` + error.message, 'error');
          throw error;
        }
      }
    );
  };

  const handleStatusFilter = (filterValue) => {
    setStatusFilter(filterValue);
    onFilter(filterValue);
  };

  if (projectsloading) {
    return (
      <>
        <Header
          onNewProjectClick={onAddProject}
          onLoginClick={onLoginClick}
          activeProjectsCount={activeProjectsCount}
        />
        <SearchBar
          onSearch={onSearch}
          onFilter={handleStatusFilter}
          currentFilter={statusFilter}
        />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-300"></div>
          <span className="ml-3 text-gray-600">Loading projects...</span>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          onNewProjectClick={onAddProject}
          onLoginClick={onLoginClick}
          activeProjectsCount={activeProjectsCount}
        />
        <SearchBar
          onSearch={onSearch}
          onFilter={handleStatusFilter}
          currentFilter={statusFilter}
        />
        <div className="text-center py-12">
          <div className="text-red-400 text-6xl mb-4"></div>
          <h3 className="text-lg font-medium theme-text-primary mb-2">Failed to load projects</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        // companyId={mySelectedCompanyId}
        onNewProjectClick={onAddProject}
        onLoginClick={onLoginClick}
        activeProjectsCount={activeProjectsCount}
      />
      <SearchBar
        onSearch={onSearch}
        onFilter={handleStatusFilter}
        currentFilter={statusFilter}
      />
      <div className='mt-2 h-screen overflow-y-auto whitespace-nowrap scrollbar-hidden'>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-6xl mb-4"></div>
              <h3 className="text-lg font-medium theme-text-primary mb-2">
                {searchTerm ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first project to get started'}
              </p>
            </div>
          ) : (
            projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteWithMessage}
                onEdit={onEditProject}
              />
            ))
          )}
        </div>
      </div>
    </>
  );
};

// Main App Content with Status Messages MAIN CONTENT
const AppContent = () => {
  const { user, openAuthModal, authFetch, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectsloading, setProjectsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const { showMessage } = useStatusMessage();

  const activeProjectsCount = projects.filter(project =>
    project.status !== 'completed').length;


  // Check for reset password token on app load
  useEffect(() => {
    const checkForToken = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const path = window.location.pathname;

      // console.log('🔍 App.jsx - Checking URL for token:', token, 'at path:', path);

      if (!token) return;

      if (path === '/reset-password') {
        console.log('✅ Reset password token found, opening ForgotPasswordModal');
        setShowForgotPasswordModal(true);
      } else if (path === '/invite/accept') {
        console.log('✅ Invite token found, redirecting to InviteAccept component');
      }
    };

    // Check immediately
    checkForToken();

    window.addEventListener('popstate', checkForToken);

    return () => {
      window.removeEventListener('popstate', checkForToken);
    };
  }, []);

  // Fetch projects from API
  useEffect(() => {
    if (user && !authLoading) {
      const fetchProjects = async () => {
        try {
          setProjectsLoading(true);
          setError('');
          // console.log('Fetching projects from API...');

          const response = await authFetch(`${BASE_URL}/projects/projects`);

          console.log('Response status:', response.status);

          if (!response.ok) {
            throw new Error(`Failed to load projects: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          // console.log('API Response received:', result);
          // console.log('Type of result:', typeof result);
          // console.log('Is array?:', Array.isArray(result));

          // Handle different API response structures
          let projectsArray = [];

          if (Array.isArray(result)) {
            projectsArray = result;
          } else if (result && Array.isArray(result.data)) {
            projectsArray = result.data;
          } else if (result && Array.isArray(result.projects)) {
            projectsArray = result.projects;
          } else if (result && typeof result === 'object') {
            console.log('Object keys:', Object.keys(result));
            if (result.id || result.project_id) {
              projectsArray = [result];
            }
          }

          if (!Array.isArray(projectsArray)) {
            throw new Error('Invalid response format: projects data is not an array');
          }

          // Transform backend data to match frontend structure
          const transformedProjects = projectsArray.map(project => ({
            id: project.id || project.project_id,
            title: project.project_name || project.title,
            assignee: project.client_name || project.assignee || '',
            status: project.status || 'open',
            docDate: project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
              project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date',
            isOverdue: project.is_overdue || false,
            cardsCount: project.cards_count || 0,
            location: project.location || 'No location',
            updated: project.updated_at ? new Date(project.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
            description: project.project_description || project.description
          }));

          setProjects(transformedProjects);

        } catch (err) {
          console.error('Error fetching projects:', err);
          setError(err.message);
          setProjects([]);
        } finally {
          setProjectsLoading(false);
        }
      };

      fetchProjects();
    }
  }, [user, authLoading]);

  // DeleteProject from the menu
  const handleDeleteProject = async (projectId) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Save Project API
  const handleSaveProject = async (backendResponse) => {
    try {
      console.log('Raw backend response received:', backendResponse);

      // Refreshing project list 
      const response = await authFetch(`${BASE_URL}/projects/projects`);

      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.status}`);
      }

      const result = await response.json();
      console.log('Refreshed projects from API:', result);

      let projectsArray = [];

      if (Array.isArray(result)) {
        projectsArray = result;
      } else if (result && Array.isArray(result.data)) {
        projectsArray = result.data;
      } else if (result && Array.isArray(result.projects)) {
        projectsArray = result.projects;
      } else if (result && typeof result === 'object') {
        if (result.id || result.project_id) {
          projectsArray = [result];
        }
      }

      // Transform all projects with proper IDs
      const transformedProjects = projectsArray.map(project => ({
        id: project.id || project.project_id,
        title: project.project_name || project.title,
        assignee: project.client_name || project.assignee,
        status: project.status || 'open',
        docDate: project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
          project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date',
        isOverdue: project.is_overdue || false,
        cardsCount: project.cards_count || 0,
        location: project.location || 'No location',
        updated: project.updated_at ? new Date(project.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
        description: project.project_description || project.description
      }));

      // console.log('All transformed projects:', transformedProjects);
      setProjects(transformedProjects);
      showMessage('Project created successfully!', 'success');

    } catch (err) {
      console.error('Error processing saved project:', err);
      showMessage(`Failed to add project to list: ${err.message}`, 'error');
    }
  };

  // Edit/Update Project
  const handleUpdateProject = async (updatedProject) => {
    try {
      // console.log('Project updated, refreshing list...');

      // Refresh the entire projects list to get updated data
      const response = await authFetch(`${BASE_URL}/projects/projects`);

      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.status}`);
      }

      const result = await response.json();
      // console.log('Refreshed projects after update:', result);

      let projectsArray = [];

      if (Array.isArray(result)) {
        projectsArray = result;
      } else if (result && Array.isArray(result.data)) {
        projectsArray = result.data;
      } else if (result && Array.isArray(result.projects)) {
        projectsArray = result.projects;
      } else if (result && typeof result === 'object') {
        if (result.id || result.project_id) {
          projectsArray = [result];
        }
      }

      // Transform all projects
      const transformedProjects = projectsArray.map(project => ({
        id: project.id || project.project_id,
        title: project.project_name || project.title,
        assignee: project.client_name || project.assignee || '',
        status: project.status || 'open',
        docDate: project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) :
          project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date',
        isOverdue: project.is_overdue || false,
        cardsCount: project.cards_count || 0,
        location: project.location || 'No location',
        updated: project.updated_at ? new Date(project.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Recently',
        description: project.project_description || project.description
      }));

      // console.log('All transformed projects after update:', transformedProjects);
      setProjects(transformedProjects);
      showMessage('Project updated successfully!', 'success');

    } catch (err) {
      // console.error('Error updating project:', err);
      showMessage(`Failed to update project: ${err.message}`, 'error');
    }
  };

  // Status Filter Function
  const handleStatusFilter = (filterValue) => {
    setStatusFilter(filterValue);
  };

  // Edit handler
  const handleEditProject = (project) => {
    setEditingProject(project);
    console.log('🔄 Project data when editing:', project);
    console.log('🔍 Assignee value:', project.assignee);
    console.log('🔍 Client name from backend:', project.client_name);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingProject(null);
  };

  const handleLogin = (loginData) => {
    console.log('Login data:', loginData);
    handleCloseAuthModal();
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleRegister = (registerData) => {
    console.log('Register data:', registerData);
    handleCloseAuthModal();
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // New comprehensive filtering function
  const getFilteredAndSortedProjects = () => {
    // First filter by search term and status
    const filteredProjects = projects.filter(project => {
      // Search term filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch = (
          (project.title && project.title.toLowerCase().includes(term)) ||
          (project.assignee && project.assignee.toLowerCase().includes(term)) ||
          (project.location && project.location.toLowerCase().includes(term)) ||
          (project.description && project.description.toLowerCase().includes(term))
        );
        if (!matchesSearch) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        return project.status === statusFilter;
      }

      return true;
    });

    // Then sort by title
    return filteredProjects.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });
  };

  const sortedAndFilteredProjects = getFilteredAndSortedProjects();

  return (
    <div className="min-h-screen bg-cover bg-center theme-bg-primary text-size">
      <div className="mx-auto md:px-4 md:py-8 px-2 py-4">
        {/* AUTH LOADING STATE */}
        {authLoading && (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="theme-text-primary">Checking authentication...</p>
            </div>
          </div>
        )}

        {/* NOT LOGGED IN STATE */}
        {!user && !authLoading && (
          <>
            <div className="flex md:justify-between justify-center items-center p-6">
              <Link to="/" className=" md:text-2xl text-6xl font-bold theme-text-primary">
                SiteCards
              </Link>
              <button
                onClick={openAuthModal}
                className="px-4 py-2  theme-border theme-text-primary hidden sm:inline-block theme-bg-secondary border rounded-lg"
              >
                Login
              </button>
            </div>

            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <h1 className="text-3xl font-bold theme-text-primary mb-4">
                  Welcome to SiteCards
                </h1>
                <p className="theme-text-secondary mb-6">
                  Please login or register to access your projects
                </p>
                <button
                  onClick={openAuthModal}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Get Started
                </button>
              </div>
            </div>
          </>
        )}

        {/* LOGGED IN STATE */}
        {user && !authLoading && (
          <>
            <Routes>
              <Route
                path="/"
                element={
                  <HomeWithDelete
                    projects={sortedAndFilteredProjects}
                    onAddProject={handleOpenModal}
                    onSearch={handleSearch}
                    onFilter={handleStatusFilter}
                    searchTerm={searchTerm}
                    projectsloading={projectsloading}
                    error={error}
                    activeProjectsCount={activeProjectsCount}
                    onDeleteProject={handleDeleteProject}
                    onEditProject={handleEditProject}
                  />
                }
              />

              <Route
                path="/project/:id"
                element={<ProjectDetails projects={projects} />}
              />
              <Route path="/templates" element={<Templates />} />

              <Route path="/debug/auth" element={<AuthDebug />} />

              <Route path="/reset-password" element={<ForgotPasswordModal />} />

              <Route path="/invite/accept" element={<InviteAccept />} />

              <Route path="/pinterest/callback" element={<PinterestCallback />} />

              {/* <Route path='/send' element={<AddMembersModal />}/> */}

            </Routes>

            <NewProjectModal
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSave={handleSaveProject}
            />

            <EditProjectModal
              isOpen={isEditModalOpen}
              onClose={handleCloseEditModal}
              project={editingProject}
              onSave={handleUpdateProject}
            />
          </>
        )}

        <AuthModal />
        <ForgotPasswordModal
          isOpen={showForgotPasswordModal}
          onClose={() => setShowForgotPasswordModal(false)}
          initialEmail=""
        />
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <StatusMessageProvider>
            <AppContent />
          </StatusMessageProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;