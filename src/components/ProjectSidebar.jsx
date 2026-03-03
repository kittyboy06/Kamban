import { useState, useEffect } from 'react';
import { getProjects, createProject, deleteProject } from '../lib/supabase';
import { Kanban, Folder, FolderPlus, Trash } from '@phosphor-icons/react';

export default function ProjectSidebar({ currentProject, setCurrentProject, isOpen, setIsOpen }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const data = await getProjects();
            setProjects(data);
            if (data.length > 0 && !currentProject) {
                setCurrentProject(data[0]);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleNewProjectClick = () => {
        setNewProjectName('');
        setIsProjectModalOpen(true);
    };

    const handleCreateProjectSubmit = async (e) => {
        e.preventDefault();
        if (!newProjectName.trim()) return;

        setIsCreating(true);
        try {
            const newProj = await createProject(newProjectName.trim());
            setProjects([...projects, newProj]);
            setCurrentProject(newProj);
            setIsProjectModalOpen(false);
        } catch (e) {
            console.error(e);
            alert("Failed to create project");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteProjectClick = (e, proj) => {
        e.stopPropagation();
        setProjectToDelete(proj);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteProject = async () => {
        if (!projectToDelete) return;

        setIsDeleting(true);
        try {
            await deleteProject(projectToDelete.id);
            const updatedProjects = projects.filter(p => p.id !== projectToDelete.id);
            setProjects(updatedProjects);
            if (currentProject?.id === projectToDelete.id) {
                setCurrentProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
            }
            setIsDeleteModalOpen(false);
            setProjectToDelete(null);
        } catch (error) {
            console.error(error);
            alert("Failed to delete project. Ensure tasks are deleted first or cascading deletes are enabled.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-icon">
                    <Kanban weight="bold" />
                </div>
                <h2>Projects</h2>
            </div>

            <div className="sidebar-actions">
                <button className="btn-primary w-full" onClick={handleNewProjectClick}>
                    <FolderPlus weight="bold" /> New Project
                </button>
            </div>

            <nav className="project-list">
                {loading ? (
                    <div className="sidebar-loading">Loading projects...</div>
                ) : (
                    projects.map(proj => (
                        <div
                            key={proj.id}
                            className={`project-item ${currentProject?.id === proj.id ? 'active' : ''}`}
                            onClick={() => {
                                setCurrentProject(proj);
                                setIsOpen(false);
                            }}
                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Folder /> {proj.name}
                            </div>
                            <button
                                className="btn-icon danger-hover"
                                style={{ padding: '4px' }}
                                onClick={(e) => handleDeleteProjectClick(e, proj)}
                                title="Delete Project"
                            >
                                <Trash size={16} />
                            </button>
                        </div>
                    ))
                )}
                {!loading && projects.length === 0 && (
                    <div className="sidebar-loading">No projects yet</div>
                )}
            </nav>

            {/* Custom Project Creation Modal to bypass prompt blockers */}
            {isProjectModalOpen && (
                <div className="modal-overlay active" style={{ zIndex: 1100 }}>
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3>Create New Project</h3>
                        </div>
                        <form onSubmit={handleCreateProjectSubmit}>
                            <div className="form-group">
                                <label>Project Name</label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="e.g. Website Redesign"
                                    autoFocus
                                    required
                                />
                            </div>
                            <div className="modal-actions mt-4">
                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setIsProjectModalOpen(false)}
                                    disabled={isCreating}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" disabled={isCreating}>
                                    {isCreating ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Project Deletion Modal */}
            {isDeleteModalOpen && (
                <div className="modal-overlay active" style={{ zIndex: 1100 }}>
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 style={{ color: 'var(--priority-high)' }}>Delete Project?</h3>
                        </div>
                        <div style={{ padding: '1rem 0' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete <strong>{projectToDelete?.name}</strong>? This action may not be reversible.</p>
                        </div>
                        <div className="modal-actions mt-4">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setIsDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                style={{ background: 'var(--priority-high)' }}
                                onClick={confirmDeleteProject}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
}
