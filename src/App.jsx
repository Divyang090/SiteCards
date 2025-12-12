import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import PinterestSuccess from './Components/PinterestSuccess';
import VendorsPage from './Pages/VendorsPage';
import PinterestBoardTest from './Pages/PinterestBoardTest';

const HomeWithDelete = ({ projects, onAddProject, onLoginClick, onSearch, onFilter, searchTerm, projectsloading, error, activeProjectsCount, onDeleteProject, onEditProject }) => {
    const { showMessage, showConfirmation } = useStatusMessage();
    const [statusFilter, setStatusFilter] = useState('all');
    const { authFetch } = useAuth();

    const handleDeleteWithMessage = async (projectId) => {
        const projectToDelete = projects.find(project => project.id === projectId);
        const projectTitle = projectToDelete?.title || 'this project';

        showConfirmation(
            'Delete Project',
            `Are you sure you want to delete "${projectTitle}"? This action cannot be undone`,
            async () => {
                try {
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

const ProtectedRoute = ({ children }) => {
    const { user, authLoading } = useAuth();
    const location = useLocation();

    if (authLoading) return null;

    // Allow reset-password route even without user
    if (location.pathname === '/user/reset-password') {
        return children;
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

const AppContent = () => {
    const { user, openAuthModal, authFetch, loading: authLoading } = useAuth();
    const location = useLocation();
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

    // Fix: Use useEffect with location dependency instead of interval
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const isResetPasswordPath = location.pathname === '/user/reset-password';

        if (isResetPasswordPath && token) {
            setShowForgotPasswordModal(true);
        } else {
            setShowForgotPasswordModal(false);
        }
    }, [location]);

    useEffect(() => {
        if (user && !authLoading) {
            const fetchProjects = async () => {
                try {
                    setProjectsLoading(true);
                    setError('');
                    const response = await authFetch(`${BASE_URL}/projects/projects`);

                    if (!response.ok) {
                        throw new Error(`Failed to load projects: ${response.status} ${response.statusText}`);
                    }

                    const result = await response.json();
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

                    if (!Array.isArray(projectsArray)) {
                        throw new Error('Invalid response format: projects data is not an array');
                    }

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
                    setError(err.message);
                    setProjects([]);
                } finally {
                    setProjectsLoading(false);
                }
            };

            fetchProjects();
        }
    }, [user, authLoading]);

    const handleDeleteProject = async (projectId) => {
        setProjects(prev => prev.filter(project => project.id !== projectId));
    };

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);

    const refreshProjects = async () => {
        const response = await authFetch(`${BASE_URL}/projects/projects`);

        if (!response.ok) {
            throw new Error(`Failed to load projects: ${response.status}`);
        }

        const result = await response.json();
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

        setProjects(transformedProjects);
    }

    const handleSaveProject = async (backendResponse) => {
        try {
            await refreshProjects();
            showMessage('Project created successfully!', 'success');
        } catch (err) {
            showMessage(`Failed to add project to list: ${err.message}`, 'error');
        }
    };

    const handleUpdateProject = async (updatedProject) => {
        try {
            await refreshProjects();
            showMessage('Project updated successfully!', 'success');
        } catch (err) {
            showMessage(`Failed to update project: ${err.message}`, 'error');
        }
    };

    const handleStatusFilter = (filterValue) => {
        setStatusFilter(filterValue);
    };

    const handleEditProject = (project) => {
        setEditingProject(project);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setEditingProject(null);
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    const getFilteredAndSortedProjects = () => {
        const filteredProjects = projects.filter(project => {
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

            if (statusFilter !== 'all') {
                return project.status === statusFilter;
            }

            return true;
        });

        return filteredProjects.sort((a, b) => {
            return a.title.localeCompare(b.title);
        });
    };

    const sortedAndFilteredProjects = getFilteredAndSortedProjects();

    return (
        <div className="min-h-screen bg-cover bg-center theme-bg-primary text-size">
            <div className="mx-auto md:px-4 md:py-8 px-2 py-4">

                {authLoading && (
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="theme-text-primary">Checking authentication...</p>
                        </div>
                    </div>
                )}

                {!authLoading && (
                    <Routes>
                        {/* PUBLIC ROUTES */}
                        <Route path="/invite/accept" element={<InviteAccept />} />
                        <Route path="/user/reset-password" element={<div />} />

                        {/* PROTECTED ROUTES WRAPPED IN ProtectedRoute */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
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
                                </ProtectedRoute>
                            }
                        />

                        <Route
                            path="/project/:id"
                            element={
                                <ProtectedRoute>
                                    <ProjectDetails projects={projects} />
                                </ProtectedRoute>
                            }
                        />

                        <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
                        <Route path="/debug/auth" element={<ProtectedRoute><AuthDebug /></ProtectedRoute>} />
                        <Route path="/vendors" element={<ProtectedRoute><VendorsPage /></ProtectedRoute>} />
                        <Route path="/test-boards" element={<ProtectedRoute><PinterestBoardTest /></ProtectedRoute>} />
                        <Route path="/pinterest/callback" element={<ProtectedRoute><PinterestCallback /></ProtectedRoute>} />
                        <Route path="/pinterest/success" element={<ProtectedRoute><PinterestSuccess /></ProtectedRoute>} />



                        {/* FALLBACK FOR UNKNOWN ROUTES WHEN LOGGED IN */}
                        <Route path="*" element={<ProtectedRoute><Navigate to="/" replace /></ProtectedRoute>} />
                    </Routes>
                )}

                {/* LOGGED OUT WELCOME/FALLBACK - Hide when reset modal is open */}
                {!user && !authLoading && !showForgotPasswordModal && (
                    <>
                        <div className="flex md:justify-between justify-center items-center p-6">
                            <Link to="/" className=" md:text-2xl text-6xl font-bold theme-text-primary">
                                SiteCards
                            </Link>
                            <button
                                onClick={openAuthModal}
                                className="px-4 py-2 theme-border theme-text-primary hidden sm:inline-block theme-bg-secondary border rounded-lg"
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

                {/* MODALS (Rendered outside Routes) */}
                <NewProjectModal
                    isOpen={isModalOpen && user}
                    onClose={handleCloseModal}
                    onSave={handleSaveProject}
                />
                <EditProjectModal
                    isOpen={isEditModalOpen && user}
                    onClose={handleCloseEditModal}
                    project={editingProject}
                    onSave={handleUpdateProject}
                />
                <AuthModal />
                <ForgotPasswordModal
                    isOpen={showForgotPasswordModal}
                    onClose={() => {
                        setShowForgotPasswordModal(false);
                        // Clear the URL when modal closes
                        if (window.location.pathname === '/user/reset-password') {
                            window.history.replaceState(null, '', '/');
                        }
                    }}
                    initialEmail=""
                />
            </div>
        </div>
    );
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <StatusMessageProvider>
                    <AppContent />
                </StatusMessageProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;