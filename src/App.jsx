import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider,useTheme } from './Components/ThemeContext';
import Header from './Components/Header';
import ProjectCard from './Components/ProjectCard';
import SearchBar from './Components/SearchBar';
import ProjectDetails from './Pages/ProjectDetails';
import NewProjectModal from './Components/NewProjectModal';
import AuthModal from './Components/AuthModal';
import Templates from './Components/ProjectTemplates';

const Home = ({ projects, onAddProject, onLoginClick, onSearch, searchTerm, loading, error }) => {
  if (loading) {
    return (
      <>
        <Header 
          onNewProjectClick={onAddProject} 
          onLoginClick={onLoginClick} 
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
      />
      <SearchBar onSearch={onSearch} />
      <div className="mt-8 space-y-6">
        {projects.length === 0 ? (
          <div className="text-center py-12">
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
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </>
  );
};

function App() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch projects from API on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Fetching projects from API...');
        
        const response = await fetch('http://127.0.0.1:5000/api/projects/projects');
        
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
          // Case 1: Direct array response
          projectsArray = result;
        } else if (result && Array.isArray(result.data)) {
          // Case 2: Object with data property containing array
          projectsArray = result.data;
        } else if (result && Array.isArray(result.projects)) {
          // Case 3: Object with projects property containing array
          projectsArray = result.projects;
        } else if (result && typeof result === 'object') {
          // Case 4: Single project object or other structure
          console.log('Object keys:', Object.keys(result));
          // If it's a single project, wrap it in an array
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
          assignee: project.client_name || project.assignee,
          status: project.status || 'open',
          docDate: project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                  project.due_date ? new Date(project.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date',
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

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveProject = async (backendResponse) => {
    try {
      console.log('Raw backend response received:', backendResponse);

      // Transform backend response to frontend structure
      const transformedProject = {
        id: backendResponse.id || backendResponse.project_id,
        title: backendResponse.project_name || backendResponse.title,
        assignee: backendResponse.client_name || backendResponse.assignee,
        status: backendResponse.status || 'open',
        docDate: backendResponse.end_date ? new Date(backendResponse.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
                backendResponse.due_date ? new Date(backendResponse.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No Date',
        isOverdue: false,
        cardsCount: 0,
        location: backendResponse.location || 'No location',
        updated: "Just now",
        description: backendResponse.project_description || backendResponse.description
      };

      console.log('Transformed project for frontend:', transformedProject);
      
      // Add the new project to the beginning of the list
      setProjects(prev => [transformedProject, ...prev]);
      
    } catch (err) {
      console.error('Error processing saved project:', err);
      alert(`Failed to add project to list: ${err.message}`);
    }
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
// Filter projects based on search term - FIXED VERSION
const filteredProjects = projects.filter(project => {
  if (!searchTerm.trim()) return true; // Show all projects when search is empty
  
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
    <ThemeProvider>
      <Router>
        <div className="min-h-screen theme-bg-primary">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <Routes>
              <Route 
                path="/" 
                element={
                  <Home 
                    projects={sortedAndFilteredProjects}
                    onAddProject={handleOpenModal}
                    onLoginClick={() => handleOpenAuthModal('login')}
                    onSearch={handleSearch}
                    searchTerm={searchTerm}
                    loading={loading}
                    error={error}
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
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;