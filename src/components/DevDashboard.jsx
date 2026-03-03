import { useState, useEffect, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { supabase, updateTask, createDeveloperLog } from '../lib/supabase';
import Column from './Column';
import TaskModal from './Modals/TaskModal';
import { Clock, SignOut } from '@phosphor-icons/react';

const COLUMNS = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' }
];

export default function DevDashboard({ devUser, onLogout }) {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    // Timer State
    const [startTime] = useState(new Date());
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Tracking all activity for the shift report
    const [sessionActivity, setSessionActivity] = useState([]);

    // Modal State for viewing details (read-only for dev, or editable?)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // 1. Fetch Dev Tasks
    const fetchDevTasks = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('tasks')
                .select('*')
                .ilike('developer_name', `%${devUser.name}%`) // Match name loosely
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTasks(data || []);
        } catch (e) {
            console.error(e);
            alert("Failed to load your tasks");
        } finally {
            setLoading(false);
        }
    }, [devUser]);

    useEffect(() => {
        fetchDevTasks();
    }, [fetchDevTasks]);

    // 2. Timer Logic
    useEffect(() => {
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((new Date() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // 3. Drag and Drop Logic
    const handleDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId) return;

        const taskId = draggableId;
        const newStatus = destination.droppableId;
        const oldStatus = source.droppableId;

        const taskBeingMoved = tasks.find(t => t.id === taskId);

        // Optimistic Update
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

        // Format column names for logging
        const colNames = {
            'todo': 'To Do',
            'in-progress': 'In Progress',
            'done': 'Done'
        };

        // Track action for shift report
        setSessionActivity(prev => [...prev, {
            id: Date.now().toString(),
            title: `Moved "${taskBeingMoved?.title || 'Task'}" to ${colNames[newStatus] || newStatus}`,
            timestamp: new Date().toISOString()
        }]);

        try {
            await updateTask(taskId, { status: newStatus });
        } catch (e) {
            console.error(e);
            alert("Failed to move task");
            fetchDevTasks(); // revert
        }
    };

    const handleEndShift = async () => {
        const logoutTime = new Date();
        const durationMinutes = Math.floor(elapsedSeconds / 60);

        try {
            await createDeveloperLog({
                developer_name: devUser.name,
                login_time: startTime.toISOString(),
                logout_time: logoutTime.toISOString(),
                duration_minutes: durationMinutes,
                tasks_completed: sessionActivity // Storing comprehensive activity logs here
            });

            alert("Shift report submitted successfully. Great work!");
            onLogout();
        } catch (e) {
            console.error(e);
            alert("Failed to submit shift report. Please ensure your connection is stable.");
        }
    };

    const openTaskView = (task) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleTaskSave = async () => {
        await fetchDevTasks();
        if (editingTask) {
            setSessionActivity(prev => [...prev, {
                id: Date.now().toString(),
                title: `Edited "${editingTask.title}"`,
                timestamp: new Date().toISOString()
            }]);
        }
    };

    return (
        <div className="app-container">
            {/* Developer Header */}
            <header className="app-header" style={{ justifyContent: 'space-between' }}>
                <div className="header-left">
                    <div className="avatar" title={devUser.name}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(devUser.name)}&background=10b981&color=fff`} alt="Dev Avatar" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.2rem', marginBottom: '2px' }}>{devUser.name}'s Workspace</h1>
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981' }}>Active Shift</span>
                    </div>
                </div>

                <div className="header-right" style={{ gap: '1.5rem' }}>
                    <div className="timer-display" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 600 }}>
                        <Clock weight="bold" />
                        {formatTime(elapsedSeconds)}
                    </div>

                    <button className="btn-secondary danger-hover" onClick={handleEndShift}>
                        <SignOut weight="bold" /> End Shift
                    </button>
                </div>
            </header>

            {/* Board Area */}
            <main className="board-container">
                <div className="board-header">
                    <div className="board-title">
                        <h2>My Assigned Tasks</h2>
                        <p className="settings-desc">Drag tasks to 'Done' to include them in your shift report.</p>
                    </div>
                </div>

                <div className="columns-container" style={{ display: 'flex' }}>
                    {loading ? (
                        <div className="empty-state w-full">Loading your tasks...</div>
                    ) : (
                        <DragDropContext onDragEnd={handleDragEnd}>
                            {COLUMNS.map(col => (
                                <Column
                                    key={col.id}
                                    column={col}
                                    tasks={tasks.filter(t => t.status === col.id)}
                                    // Override standard handlers to prevent deletion by devs directly if preferred, 
                                    // or just allow viewing. Modifying TaskModal to be read-only is an option too.
                                    onEdit={openTaskView}
                                    onDelete={() => alert("Developers cannot delete tasks directly.")}
                                />
                            ))}
                        </DragDropContext>
                    )}
                </div>
            </main>

            {isModalOpen && (
                <TaskModal
                    currentProject={{ id: editingTask?.project_id, name: 'Assigned Project' }} // Passed a dummy project just to satisfy the form prop if needed
                    task={editingTask}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleTaskSave} // Tracks edits and refetches tasks
                />
            )}
        </div>
    );
}
