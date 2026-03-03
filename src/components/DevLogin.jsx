import { useState } from 'react';
import { authenticateDeveloper } from '../lib/supabase';
import { ArrowLeft, User, Key, LockKeyOpen } from '@phosphor-icons/react';

export default function DevLogin({ onLoginSuccess, onBack }) {
    const [name, setName] = useState('');
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name || !passcode) {
            setError("Please fill in both fields.");
            return;
        }

        setLoading(true);
        try {
            const dev = await authenticateDeveloper(name, passcode);
            if (dev) {
                onLoginSuccess(dev);
            } else {
                setError("Invalid Name or Passcode.");
            }
        } catch (err) {
            console.error(err);
            setError("Authentication failed. Please check connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="portal-layout">
            <button
                className="back-btn-corner"
                onClick={onBack}
                title="Back to Role Selection"
            >
                <ArrowLeft size={28} />
            </button>

            <div className="portal-glass-panel">
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.1)', color: 'var(--status-done)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: '1.5rem', fontSize: '2rem'
                }}>
                    <LockKeyOpen weight="duotone" />
                </div>

                <h2 className="portal-title" style={{ fontSize: '2rem' }}>Developer Portal</h2>
                <p className="portal-desc" style={{ marginBottom: '2rem' }}>
                    Authenticate to access your workspace and begin your shift tracking.
                </p>

                {error && <div className="error-message" style={{ color: '#ef4444', marginBottom: '1.5rem', width: '100%', textAlign: 'left', background: 'rgba(239,68,68,0.1)', padding: '0.75rem', borderRadius: '8px' }}>{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label><User weight="bold" /> Developer Name</label>
                        <input
                            type="text"
                            placeholder="e.g. John Doe"
                            value={name}
                            onChange={e => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label><Key weight="bold" /> Access Passcode</label>
                        <input
                            type="password"
                            placeholder="••••"
                            value={passcode}
                            onChange={e => setPasscode(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading}>
                        {loading ? 'Authenticating...' : 'Start Shift'}
                    </button>
                </form>
            </div>
        </div>
    );
}
