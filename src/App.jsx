import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './Components/ThemeContext';
import Header from './Components/Header';
import ProjectCard from './Components/ProjectCard';
import SearchBar from './Components/SearchBar';
import ProjectDetails from './Pages/ProjectDetails';
import NewProjectModal from './Components/NewProjectModal';
import AuthModal from './Components/AuthModal';
import Templates from './Components/ProjectTemplates';
import StatusMessageProvider, { useStatusMessage } from './Alerts/StatusMessage';
import EditProjectModal from './Components/EditProjectModal';
import { BASE_URL } from './Configuration/Config';

// Create a wrapper component that can use the StatusMessage hook
const HomeWithDelete = ({ projects, onAddProject, onLoginClick, onSearch, searchTerm, loading, error, activeProjectsCount, onDeleteProject, onEditProject }) => {
  const { showMessage, showConfirmation } = useStatusMessage();

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

          const response = await fetch(`${BASE_URL}/projects/projects/${projectId}`, {
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

  // ... rest of HomeWithDelete component remains the same
  if (loading) {
    return (
      <>
        <Header
          onNewProjectClick={onAddProject}
          onLoginClick={onLoginClick}
          activeProjectsCount={activeProjectsCount}
        />
        <SearchBar onSearch={onSearch} />
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
        <SearchBar onSearch={onSearch} />
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
        onNewProjectClick={onAddProject}
        onLoginClick={onLoginClick}
        activeProjectsCount={activeProjectsCount}
      />
      <SearchBar onSearch={onSearch} />
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
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
    </>
  );
};

// Main App Content with Status Messages
const AppContent = () => {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const { showMessage } = useStatusMessage(); // Now this works!

  const activeProjectsCount = projects.filter(project =>
    project.status !== 'completed').length;

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching projects from API...');

        const response = await fetch(`${BASE_URL}/projects/projects`);

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to load projects: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log('API Response received:', result);
        console.log('Type of result:', typeof result);
        console.log('Is array?:', Array.isArray(result));

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

        console.log('Final projects array:', projectsArray);

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

        console.log('Transformed projects:', transformedProjects);
        setProjects(transformedProjects);

      } catch (err) {
        console.error('Error fetching projects:', err);
        setError(err.message);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // DeleteProject from the menu
  const handleDeleteProject = async (projectId) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  // Save Project
  const handleSaveProject = async (backendResponse) => {
    try {
      console.log('Raw backend response received:', backendResponse);

      // Refreshing project list 
      const response = await fetch(`${BASE_URL}/projects/projects`);

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

      console.log('All transformed projects:', transformedProjects);
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
      console.log('Project updated, refreshing list...');

      // Refresh the entire projects list to get updated data
      const response = await fetch(`${BASE_URL}/projects/projects`);

      if (!response.ok) {
        throw new Error(`Failed to load projects: ${response.status}`);
      }

      const result = await response.json();
      console.log('Refreshed projects after update:', result);

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

      console.log('All transformed projects after update:', transformedProjects);
      setProjects(transformedProjects);
      showMessage('Project updated successfully!', 'success');

    } catch (err) {
      console.error('Error updating project:', err);
      showMessage(`Failed to update project: ${err.message}`, 'error');
    }
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

  const handleOpenAuthModal = (view = 'login') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  const handleCloseAuthModal = () => {
    setIsAuthModalOpen(false);
    setAuthView('login');
  };

  const handleSwitchAuthView = (view) => setAuthView(view);

  const handleLogin = (loginData) => {
    console.log('Login data:', loginData);
    handleCloseAuthModal();
  };

  const handleRegister = (registerData) => {
    console.log('Register data:', registerData);
    handleCloseAuthModal();
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => {
    if (!searchTerm.trim()) return true;

    const term = searchTerm.toLowerCase().trim();
    return (
      (project.title && project.title.toLowerCase().includes(term)) ||
      (project.assignee && project.assignee.toLowerCase().includes(term)) ||
      (project.location && project.location.toLowerCase().includes(term))
    );
  });

  const sortedAndFilteredProjects = filteredProjects.sort((a, b) => {
    return a.title.localeCompare(b.title);
  });

  return (
    <Router>
      <div className="min-h-screen theme-bg-primary">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route
              path="/"
              element={
                <HomeWithDelete
                  projects={sortedAndFilteredProjects}
                  onAddProject={handleOpenModal}
                  onLoginClick={() => handleOpenAuthModal('login')}
                  onSearch={handleSearch}
                  searchTerm={searchTerm}
                  loading={loading}
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
          </Routes>

          <NewProjectModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveProject}
          />

          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={handleCloseAuthModal}
            currentView={authView}
            onSwitchView={handleSwitchAuthView}
            onLogin={handleLogin}
            onRegister={handleRegister}
          />

          <EditProjectModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            project={editingProject}
            onSave={handleUpdateProject}
          />
        </div>
      </div>
    </Router>
  );
};

// Main App Component
function App() {
  return (
    <ThemeProvider>
      <StatusMessageProvider>
        <AppContent />
      </StatusMessageProvider>
    </ThemeProvider>
  );
}

export default App;