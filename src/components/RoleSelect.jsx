import { User, ShieldStar } from '@phosphor-icons/react';

export default function RoleSelect({ onSelectRole }) {
    return (
        <div className="portal-layout">
            <div className="portal-glass-panel large">
                <h1 className="portal-title">Welcome to KanbanFlow</h1>
                <p className="portal-desc">
                    Choose your workspace to get started. Are you managing projects or building them?
                </p>

                <div className="role-cards-container">
                    <div className="role-card admin" onClick={() => onSelectRole('admin')}>
                        <div className="role-icon">
                            <ShieldStar weight="duotone" />
                        </div>
                        <h3>Admin Portal</h3>
                        <p>Manage projects, track developer shifts, and configure settings.</p>
                    </div>

                    <div className="role-card developer" onClick={() => onSelectRole('developer')}>
                        <div className="role-icon">
                            <User weight="duotone" />
                        </div>
                        <h3>Developer Workspace</h3>
                        <p>Track your active shift, view assigned tasks, and submit reports.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
