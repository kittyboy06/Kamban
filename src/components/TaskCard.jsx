import { Draggable } from '@hello-pangea/dnd';
import { Clock, PencilSimple, Trash } from '@phosphor-icons/react';
import { format, isBefore, startOfDay } from 'date-fns';

export default function TaskCard({ task, index, onEdit, onDelete }) {
    const getAvatarUrl = (name) => `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'U')}&background=random`;

    const isOverdue = (deadlineStr) => {
        if (!deadlineStr || task.status === 'done') return false;
        const deadline = new Date(deadlineStr);
        const today = startOfDay(new Date());
        return isBefore(deadline, today);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'No Date';
        return format(new Date(dateStr), 'MMM d, yyyy');
    };

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={provided.draggableProps.style}
                >
                    <div className="task-header-row">
                        <div className="task-labels">
                            <span className={`label-priority ${task.priority}`}>{task.priority}</span>
                        </div>
                        {task.deadline && (
                            <div className={`task-deadline ${isOverdue(task.deadline) ? 'overdue' : ''}`}>
                                <Clock /> {formatDate(task.deadline)}
                            </div>
                        )}
                    </div>

                    <h4>{task.title}</h4>
                    <p>{task.description}</p>

                    <div className="task-footer">
                        <div className="task-developer">
                            <img src={getAvatarUrl(task.developer_name)} alt="Avatar" />
                            <div className="dev-info">
                                <span className="dev-name">{task.developer_name || 'Unknown'}</span>
                                <span className="dev-role">{task.developer_designation || 'Developer'}</span>
                            </div>
                        </div>

                        <div className="task-actions">
                            <button className="btn-icon edit-btn" onClick={() => onEdit(task)} title="Edit">
                                <PencilSimple />
                            </button>
                            <button className="btn-icon delete-btn" onClick={() => onDelete()} title="Delete">
                                <Trash />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
}
