import { useState, useEffect } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';

export default function Settings({ onNavigate }) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [supabaseUrl, setSupabaseUrl] = useState('');

    useEffect(() => {
        // Load initial values from localStorage
        setName(localStorage.getItem('admin-name') || '');
        setRole(localStorage.getItem('admin-role') || '');
        setAvatarUrl(localStorage.getItem('admin-avatar') || '');

        // Load Supabase info
        const envUrl = import.meta.env.VITE_SUPABASE_URL;
        const localUrl = localStorage.getItem('supabase-url');
        setSupabaseUrl(envUrl || localUrl || 'Not Configured');
    }, []);

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

    const handleDisconnect = () => {
        if (confirm("Disconnecting will clear local Supabase credentials and reload the app. Continue?")) {
            localStorage.removeItem('supabase-url');
            localStorage.removeItem('supabase-key');
            window.location.reload();
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
                        <h2>System Settings</h2>
                        <p className="settings-desc">Manage your connection to the live Supabase database.</p>

                        <div className="database-status-card">
                            <div className="status-indicator active"></div>
                            <div className="db-info">
                                <strong>Connected to Supabase</strong>
                                <span>{supabaseUrl}</span>
                            </div>
                            <button className="btn-secondary danger-hover" onClick={handleDisconnect}>
                                Disconnect
                            </button>
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
