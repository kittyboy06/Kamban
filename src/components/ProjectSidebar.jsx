import { useState, useEffect } from 'react';
import { getProjects, createProject } from '../lib/supabase';
import { Kanban, Folder, FolderPlus } from '@phosphor-icons/react';

export default function ProjectSidebar({ currentProject, setCurrentProject, isOpen, setIsOpen }) {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

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

    const handleNewProject = async () => {
        const name = prompt("Enter new project name:");
        if (name && name.trim()) {
            try {
                const newProj = await createProject(name.trim());
                setProjects([...projects, newProj]);
                setCurrentProject(newProj);
            } catch (e) {
                console.error(e);
                alert("Failed to create project");
            }
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
                <button className="btn-primary w-full" onClick={handleNewProject}>
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
                        >
                            <Folder /> {proj.name}
                        </div>
                    ))
                )}
                {!loading && projects.length === 0 && (
                    <div className="sidebar-loading">No projects yet</div>
                )}
            </nav>
        </aside>
    );
}
