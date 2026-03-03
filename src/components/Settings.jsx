import { useState, useEffect } from 'react';
import { ArrowLeft, Trash, Plus } from '@phosphor-icons/react';
import { getDevelopers, createDeveloper, deleteDeveloper } from '../lib/supabase';

export default function Settings({ onNavigate }) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [supabaseUrl, setSupabaseUrl] = useState('');

    const [developers, setDevelopers] = useState([]);
    const [newDevName, setNewDevName] = useState('');
    const [newDevDesignation, setNewDevDesignation] = useState('');
    const [newDevPasscode, setNewDevPasscode] = useState('');
    const [devError, setDevError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false);

    useEffect(() => {
        // Load initial values from localStorage
        setName(localStorage.getItem('admin-name') || '');
        setRole(localStorage.getItem('admin-role') || '');
        setAvatarUrl(localStorage.getItem('admin-avatar') || '');

        // Load Supabase info
        const envUrl = import.meta.env.VITE_SUPABASE_URL;
        const localUrl = localStorage.getItem('supabase-url');
        setSupabaseUrl(envUrl || localUrl || 'Not Configured');

        fetchDevelopers();
    }, []);

    const fetchDevelopers = async () => {
        try {
            const data = await getDevelopers();
            setDevelopers(data);
        } catch (e) {
            console.error("Failed to fetch developers:", e);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('admin-name', name);
        localStorage.setItem('admin-role', role);
        localStorage.setItem('admin-avatar', avatarUrl);

        // Force a tiny visual feedback
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = 'Saved!';
        setTimeout(() => {
            btn.innerText = originalText;
        }, 2000);
    };

    const handleDisconnectClick = () => {
        setIsDisconnectModalOpen(true);
    };

    const confirmDisconnect = () => {
        localStorage.removeItem('supabase-url');
        localStorage.removeItem('supabase-key');
        window.location.reload();
    };

    const handleAddDeveloper = async (e) => {
        e.preventDefault();
        setDevError('');
        if (!newDevName || !newDevDesignation || !newDevPasscode) {
            setDevError("Name, Designation, and Passcode are required.");
            return;
        }

        setIsLoading(true);
        try {
            const newDev = await createDeveloper({
                name: newDevName,
                designation: newDevDesignation,
                passcode: newDevPasscode
            });
            setDevelopers([...developers, newDev]);
            setNewDevName('');
            setNewDevDesignation('');
            setNewDevPasscode('');
        } catch (error) {
            console.error("Failed to create developer:", error);
            setDevError("Failed to add developer. Ensure uniqueness and check connection.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDeveloper = async (id) => {
        try {
            await deleteDeveloper(id);
            setDevelopers(developers.filter(d => d.id !== id));
        } catch (error) {
            console.error("Error deleting developer:", error);
            // Replace native alert with inline error state if possible, or just log
            setDevError("Failed to delete developer.");
        }
    };

    return (
        <div className="app-container settings-view">
            <header className="app-header">
                <div className="header-left">
                    <button className="btn-icon" onClick={() => onNavigate('board')} title="Back to Board">
                        <ArrowLeft />
                    </button>
                    <h1>Admin Settings</h1>
                </div>
            </header>

            <main className="board-container" style={{ overflowY: 'auto' }}>
                <div className="settings-content">

                    <section className="settings-section mt-4">
                        <h2>Developer Management</h2>
                        <p className="settings-desc">Add or remove developer access codes for the Workspace portal.</p>

                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Active Developers</h3>
                            {developers.length === 0 ? (
                                <p style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No developers registered yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {developers.map(dev => (
                                        <div key={dev.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{dev.name} {dev.designation && <span style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', marginLeft: '0.5rem', padding: '2px 6px', background: 'rgba(99,102,241,0.1)', borderRadius: '4px' }}>{dev.designation}</span>}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Created: {new Date(dev.created_at).toLocaleDateString()}</div>
                                            </div>
                                            <button className="btn-icon danger-hover" onClick={() => handleDeleteDeveloper(dev.id)} title="Revoke Access">
                                                <Trash />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleAddDeveloper} style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Add New Developer</h3>
                            {devError && <div style={{ color: 'var(--priority-high)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' }}>{devError}</div>}
                            <div className="form-row" style={{ alignItems: 'flex-end', gap: '0.5rem' }}>
                                <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
                                    <label>Display Name</label>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        value={newDevName}
                                        onChange={e => setNewDevName(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
                                    <label>Designation</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Backend Engineer"
                                        value={newDevDesignation}
                                        onChange={e => setNewDevDesignation(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                                    <label>Passcode</label>
                                    <input
                                        type="text"
                                        placeholder="PIN"
                                        value={newDevPasscode}
                                        onChange={e => setNewDevPasscode(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-primary" disabled={isLoading} style={{ height: '42px', padding: '0 1rem' }}>
                                    <Plus /> {isLoading ? '...' : 'Add'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="settings-section mt-4">
                        <h2>System Settings</h2>
                        <p className="settings-desc">Manage your connection to the live Supabase database.</p>

                        <div className="database-status-card">
                            <div className="status-indicator active"></div>
                            <div className="db-info">
                                <strong>Connected to Supabase</strong>
                                <span>{supabaseUrl}</span>
                            </div>
                            <button className="btn-secondary danger-hover" onClick={handleDisconnectClick}>
                                Disconnect
                            </button>
                        </div>
                    </section>

                </div>
            </main>

            {/* Custom Disconnect Confirmation Modal to bypass native blockers */}
            {isDisconnectModalOpen && (
                <div className="modal-overlay active" style={{ zIndex: 1100 }}>
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h3 style={{ color: 'var(--priority-high)' }}>Confirm Disconnect</h3>
                        </div>
                        <div style={{ padding: '1rem 0' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>Disconnecting will clear local Supabase credentials and reload the app. Continue?</p>
                        </div>
                        <div className="modal-actions mt-4">
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => setIsDisconnectModalOpen(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn-primary"
                                style={{ background: 'var(--priority-high)' }}
                                onClick={confirmDisconnect}
                            >
                                Disconnect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
