import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { getTasks, updateTask, deleteTask as deleteSupabaseTask } from '../lib/supabase';
import Column from './Column';
import TaskModal from './Modals/TaskModal';
import { List, GearSix, Plus } from '@phosphor-icons/react';

const COLUMNS = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
];

export default function KanbanBoard({ currentProject, toggleSidebar, onNavigate }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(false);

    // User Profile State
    const [userName, setUserName] = useState('User');
    const [userAvatar, setUserAvatar] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    useEffect(() => {
        // Load Admin Profile
        const storedName = localStorage.getItem('admin-name');
        const storedAvatar = localStorage.getItem('admin-avatar');
        if (storedName) setUserName(storedName);
        if (storedAvatar) setUserAvatar(storedAvatar);
    }, []);

    const fetchTasks = useCallback(async () => {
        if (!currentProject) return;
        try {
            setLoading(true);
            const data = await getTasks(currentProject.id);
            setTasks(data);
        } catch (e) {
            console.error(e);
            alert("Failed to load tasks");
        } finally {
            setLoading(false);
        }
    }, [currentProject]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId) {
            // Same column reordering not fully supported in this simple schema without an 'order' field,
            // but let's visually swap them in the local array if needed, or just ignore.
            return;
        }

        const taskId = draggableId;
        const newStatus = destination.droppableId;

        // Optimistic Update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        try {
            await updateTask(taskId, { status: newStatus });
        } catch (e) {
            console.error(e);
            alert("Failed to move task");
            fetchTasks(); // revert on fail
        }
    };

    const handleTaskDelete = async (taskId) => {
        if (confirm("Are you sure you want to delete this task?")) {
            setTasks(prev => prev.filter(t => t.id !== taskId));
            try {
                await deleteSupabaseTask(taskId);
            } catch (e) {
                console.error(e);
                alert("Failed to delete task");
                fetchTasks();
            }
        }
    };

    const openNewTaskModal = () => {
        setEditingTask(null);
        setIsModalOpen(true);
    };

    const openEditTaskModal = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const displayAvatar = userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=6366f1&color=fff`;

    return (
        <div className="app-container">
            {/* Header */}
            <header className="app-header">
                <div className="header-left">
                    <button className="btn-icon mobile-menu-btn" onClick={toggleSidebar}>
                        <List />
                    </button>
                    <h1>{currentProject ? currentProject.name : 'Select a Project'}</h1>
                </div>
                <div className="header-right">
                    <button className="btn-icon" title="Settings" onClick={() => onNavigate('settings')}>
                        <GearSix />
                    </button>
                    <div className="avatar" title={`${userName} (Click for Profile)`} onClick={() => onNavigate('profile')} style={{ cursor: 'pointer' }}>
                        <img src={displayAvatar} alt="User Avatar" />
                    </div>
                </div>
            </header>

            {/* Board */}
            <main className="board-container">
                <div className="board-header">
                    <div className="board-title">
                        <h2>Board</h2>
                        {currentProject && <span className="badge">Active</span>}
                    </div>
                    <div className="board-actions">
                        <button
                            className="btn-primary"
                            disabled={!currentProject}
                            onClick={openNewTaskModal}
                        >
                            <Plus weight="bold" /> New Task
                        </button>
                    </div>
                </div>

                <div className="columns-container" style={{ display: 'flex' }}>
                    {!currentProject ? (
                        <div className="empty-state w-full">
                            Please select or create a project from the sidebar to view tasks.
                        </div>
                    ) : loading ? (
                        <div className="empty-state w-full">Loading tasks...</div>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            {COLUMNS.map(col => (
                                <Column
                                    key={col.id}
                                    column={col}
                                    tasks={tasks.filter(t => t.status === col.id)}
                                    onEdit={openEditTaskModal}
                                    onDelete={handleTaskDelete}
                                />
                            ))}
                        </DragDropContext>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <TaskModal
                    currentProject={currentProject}
                    task={editingTask}
                    onClose={() => setIsModalOpen(false)}
                    onSave={fetchTasks}
                />
            )}
        </div>
    );
}
