import { useState, useEffect } from 'react';
import { createTask, updateTask } from '../../lib/supabase';
import { X } from '@phosphor-icons/react';

export default function TaskModal({ currentProject, task, onClose, onSave }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [developerName, setDeveloperName] = useState('');
    const [developerDesignation, setDeveloperDesignation] = useState('');
    const [status, setStatus] = useState('todo');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState('low');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setDeveloperName(task.developer_name || '');
            setDeveloperDesignation(task.developer_designation || '');
            setStatus(task.status);
            setDeadline(task.deadline || '');
            setPriority(task.priority || 'low');
        }
    }, [task]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !currentProject) return;

        setSaving(true);
        const taskData = {
            title: title.trim(),
            description: description.trim(),
            developer_name: developerName.trim(),
            developer_designation: developerDesignation.trim(),
            status,
            priority,
            deadline: deadline ? deadline : null,
            project_id: currentProject.id
        };

        try {
            if (task) {
                await updateTask(task.id, taskData);
            } else {
                await createTask(taskData);
            }
            onSave(); // Refetch tasks in parent
            onClose();
        } catch (error) {
            console.error(error);
            alert("Failed to save task");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay active">
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{task ? 'Edit Task' : 'Create New Task'}</h3>
                    <button className="btn-icon close-modal" onClick={onClose}><X /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group w-full">
                            <label>Title</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="e.g. Design Landing Page" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea rows="3" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add some details..."></textarea>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label>Developer Name</label>
                            <input type="text" value={developerName} onChange={(e) => setDeveloperName(e.target.value)} placeholder="e.g. Alex" />
                        </div>
                        <div className="form-group half">
                            <label>Designation</label>
                            <input type="text" value={developerDesignation} onChange={(e) => setDeveloperDesignation(e.target.value)} placeholder="e.g. Frontend Engineer" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label>Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="todo">To Do</option>
                                <option value="in-progress">In Progress</option>
                                <option value="done">Done</option>
                            </select>
                        </div>
                        <div className="form-group half">
                            <label>Deadline</label>
                            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Priority</label>
                        <div className="priority-selector">
                            <label className="priority-option low">
                                <input type="radio" name="priority" value="low" checked={priority === 'low'} onChange={() => setPriority('low')} />
                                <span>Low</span>
                            </label>
                            <label className="priority-option medium">
                                <input type="radio" name="priority" value="medium" checked={priority === 'medium'} onChange={() => setPriority('medium')} />
                                <span>Medium</span>
                            </label>
                            <label className="priority-option high">
                                <input type="radio" name="priority" value="high" checked={priority === 'high'} onChange={() => setPriority('high')} />
                                <span>High</span>
                            </label>
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
