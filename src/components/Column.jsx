import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';

export default function Column({ column, tasks, onEdit, onDelete }) {
    return (
        <div className="column" data-column={column.id}>
            <div className="column-header">
                <div className="column-title">
                    <div className="dot"></div>
                    {column.title}
                </div>
                <div className="task-count">{tasks.length}</div>
            </div>

            <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                    <div
                        className={`task-list ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                    >
                        {tasks.length === 0 && !snapshot.isDraggingOver && (
                            <div className="empty-state" style={{ padding: '1rem', flex: 1 }}>No tasks here</div>
                        )}

                        {tasks.map((task, index) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                index={index}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </div>
    );
}
