import { useState, useEffect } from 'react';
import { ArrowLeft } from '@phosphor-icons/react';

export default function Profile({ onNavigate }) {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    useEffect(() => {
        // Load initial values from localStorage
        setName(localStorage.getItem('admin-name') || '');
        setRole(localStorage.getItem('admin-role') || '');
        setAvatarUrl(localStorage.getItem('admin-avatar') || '');
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        localStorage.setItem('admin-name', name);
        localStorage.setItem('admin-role', role);
        localStorage.setItem('admin-avatar', avatarUrl);

        // Force a tiny visual feedback
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = 'Profile Saved!';
        setTimeout(() => {
            btn.innerText = originalText;
        }, 2000);
    };

    return (
        <div className="app-container settings-view">
            <header className="app-header">
                <div className="header-left">
                    <button className="btn-icon" onClick={() => onNavigate('board')} title="Back to Board">
                        <ArrowLeft />
                    </button>
                    <h1>User Profile</h1>
                </div>
            </header>

            <main className="board-container" style={{ overflowY: 'auto' }}>
                <div className="settings-content">

                    <section className="settings-section">
                        <h2>Profile Settings</h2>
                        <p className="settings-desc">Update your personal details. This will reflect in the top right corner.</p>

                        <form className="settings-form" onSubmit={handleSave}>
                            <div className="form-group w-full">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Alex"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div className="form-group w-full">
                                <label>Role / Designation</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Lead Developer"
                                    value={role}
                                    onChange={e => setRole(e.target.value)}
                                />
                            </div>
                            <div className="form-group w-full">
                                <label>Custom Avatar URL (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="https://example.com/photo.jpg"
                                    value={avatarUrl}
                                    onChange={e => setAvatarUrl(e.target.value)}
                                />
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Save Profile</button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}
