import React, { useState } from 'react';  // 🔥 CHANGED: Added useState import
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Components/Header';
import ProjectCard from './components/ProjectCard';
import SearchBar from './components/SearchBar';
import ProjectDetails from './pages/ProjectDetails';
import NewProjectModal from './components/NewProjectModal';  // 🔥 CHANGED: Added modal import

const Home = ({ projects, onAddProject }) => {  // 🔥 CHANGED: Added props parameter
  return (
    <>
      <Header onNewProjectClick={onAddProject} />  {/* 🔥 CHANGED: Passed onClick prop */}
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
  // 🔥 CHANGED: Moved projects to useState and added modal state
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
      status: "progress",
      docDate: "Feb 28",
      isOverdue: true,
      cardsCount: 3,
      location: "Westchester, NY",
      updated: "Jan 7"
    },
    {
      id: 3,
      title: "Corporate Office Redesign",
      assignee: "TechCorp Inc.",
      status: "progress",
      docDate: "Jan 20",
      isOverdue: true,
      cardsCount: 5,
      location: "Midtown, NYC",
      updated: "Jan 9"
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);  // 🔥 CHANGED: Added modal state

  // 🔥 CHANGED: Added modal handlers
  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/" 
              element={
                <Home 
                  projects={projects} 
                  onAddProject={handleOpenModal}  // 🔥 CHANGED: Passed props
                />
              } 
            />
            <Route path="/project/:id" element={<ProjectDetails />} />
          </Routes>

          {/*modal component */}
          <NewProjectModal 
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onSave={handleSaveProject}
          />
        </div>
      </div>
    </Router>
  );
}

export default App;