import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './Components/Theme';
import Header from './Components/Header';
import ProjectCard from './Components/ProjectCard';
import SearchBar from './components/SearchBar';
import ProjectDetails from './Pages/ProjectDetails';
import NewProjectModal from './components/NewProjectModal';
import AuthModal from './Components/AuthModal';
import Templates from './Components/Templates';

const Home = ({ projects, onAddProject, onLoginClick }) => {
  return (
    <>
      <Header 
        onNewProjectClick={onAddProject} 
        onLoginClick={onLoginClick} 
      />
      <SearchBar />
      <div className="mt-8 space-y-6">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
};

function App() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      title: "Modern Downtown Loft",
      assignee: "Sarah Johnson",
      status: "progress",
      docDate: "Jan 15",
      isOverdue: true,
      cardsCount: 4,
      location: "Downtown, NYC",
      updated: "Jan 8"
    },
    {
      id: 2,
      title: "Suburban Family Home",
      assignee: "The Martinez Family",
      status: "completed",
      docDate: "Feb 28",
      isOverdue: false,
      cardsCount: 3,
      location: "UpTown, NY",
      updated: "Jan 7"
    },
    {
      id: 3,
      title: "Corporate Office Redesign",
      assignee: "TechCorp Inc.",
      status: "pending",
      docDate: "Jan 20",
      isOverdue: true,
      cardsCount: 5,
      location: "Midtown, NYC",
      updated: "Jan 9"
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState('login');

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSaveProject = (projectData) => {
    const newProject = {
      id: projects.length + 1,
      title: projectData.title,
      assignee: projectData.assignee,
      status: "progress",
      docDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      isOverdue: false,
      cardsCount: 0,
      location: projectData.location,
      updated: "Just now",
      description: projectData.description
    };
    setProjects([...projects, newProject]);
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
                    projects={projects} 
                    onAddProject={handleOpenModal}
                    onLoginClick={() => handleOpenAuthModal('login')}
                  />
                } 
              />
              <Route path="/project/:id" element={<ProjectDetails />} />
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