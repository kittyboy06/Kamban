import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, Trash } from '@phosphor-icons/react';
import { getDeveloperLogs, deleteDeveloperLog } from '../lib/supabase';

export default function AdminReports({ onNavigate }) {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const data = await getDeveloperLogs();
            setLogs(data || []);
        } catch (err) {
            console.error(err);
            alert("Failed to fetch reports.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const formatDateTime = (isoString) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString(undefined, {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleDeleteClick = (log) => {
        setLogToDelete(log);
        setDeleteModalOpen(true);
    };

    const confirmDeleteLog = async () => {
        if (!logToDelete) return;
        setIsDeleting(true);
        try {
            await deleteDeveloperLog(logToDelete.id);
            setLogs(logs.filter(l => l.id !== logToDelete.id));
            setDeleteModalOpen(false);
            setLogToDelete(null);
        } catch (error) {
            console.error(error);
            alert("Failed to delete log entry.");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="app-container settings-view">
            <header className="app-header">
                <div className="header-left">
                    <button className="btn-icon" onClick={() => onNavigate('board')} title="Back to Board">
                        <ArrowLeft />
                    </button>
                    <h1>Developer Reports</h1>
                </div>
            </header>

            <main className="board-container" style={{ overflowY: 'auto' }}>
                <div className="settings-content" style={{ maxWidth: '1000px' }}>
                    <section className="settings-section">
                        <h2>Shift Logs</h2>
                        <p className="settings-desc">
                            Review completed developer shifts, including duration and tasks marked 'Done'.
                        </p>

                        {loading ? (
                            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading reports...</div>
                        ) : logs.length === 0 ? (
                            <div className="empty-state">No developer shifts recorded yet.</div>
                        ) : (
                            <div className="reports-table-wrapper" style={{ overflowX: 'auto', marginTop: '1.5rem' }}>
                                <table className="reports-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <tr>
                                            <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>Developer</th>
                                            <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>Login</th>
                                            <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>Logout</th>
                                            <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>Duration</th>
                                            <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>Activity Log</th>
                                            <th style={{ padding: '1rem', color: '#9ca3af', fontWeight: 500 }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map(log => (
                                            <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <td style={{ padding: '1rem', fontWeight: 600 }}>{log.developer_name}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{formatDateTime(log.login_time)}</td>
                                                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>{formatDateTime(log.logout_time)}</td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Clock weight="fill" /> {log.duration_minutes} min
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {log.tasks_completed && log.tasks_completed.length > 0 ? (
                                                        <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.9rem', color: '#d1d5db' }}>
                                                            {log.tasks_completed.map(t => (
                                                                <li key={t.id || Math.random()} style={{ marginBottom: '0.25rem' }}>
                                                                    {t.title?.includes('Edited') ? (
                                                                        <span style={{ color: '#fbbf24', marginRight: '0.25rem' }}>•</span>
                                                                    ) : t.title?.includes('Done') ? (
                                                                        <CheckCircle color="#10b981" weight="fill" style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                                                                    ) : (
                                                                        <span style={{ color: '#60a5fa', marginRight: '0.25rem' }}>•</span>
                                                                    )}
                                                                    {t.title || t.name || (typeof t === 'string' ? t : 'Unknown Action')}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : (
                                                        <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No activity</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <button
                                                        className="btn-icon danger-hover"
                                                        onClick={() => handleDeleteClick(log)}
                                                        title="Delete Log Entry"
                                                    >
                                                        <Trash />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            {/* Custom Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="modal-overlay active" style={{ zIndex: 1100 }}>
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 style={{ color: 'var(--priority-high)' }}>Delete Shift Log?</h3>
                        </div>
                        <div style={{ padding: '1rem 0' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>Are you sure you want to delete the shift log for <strong>{logToDelete?.developer_name}</strong> on {formatDateTime(logToDelete?.login_time)}?</p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>This action is permanent.</p>
                        </div>
                        <div className="modal-actions mt-4">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setDeleteModalOpen(false)}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                style={{ background: 'var(--priority-high)' }}
                                onClick={confirmDeleteLog}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
