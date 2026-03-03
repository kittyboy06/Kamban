import { useState, useEffect } from 'react';
import ProjectSidebar from './components/ProjectSidebar';
import KanbanBoard from './components/KanbanBoard';
import SetupModal from './components/Modals/SetupModal';
import Settings from './components/Settings';
import Profile from './components/Profile';
import RoleSelect from './components/RoleSelect';
import DevLogin from './components/DevLogin';
import DevDashboard from './components/DevDashboard';
import AdminReports from './components/AdminReports';
import { supabase, initSupabase, isSupabaseConfigured } from './lib/supabase';
import { App as CapApp } from '@capacitor/app';

function App() {
    const [isConfigured, setIsConfigured] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState('role_select');
    const [devUser, setDevUser] = useState(null); // Used when currentView is dev_dashboard

    useEffect(() => {
        let listenerHandle;
        CapApp.addListener('backButton', () => {
            if (currentView === 'role_select') {
                CapApp.exitApp();
            } else {
                setCurrentView('role_select');
            }
        }).then(handle => {
            listenerHandle = handle;
        });

        return () => {
            if (listenerHandle) {
                listenerHandle.remove();
            }
        };
    }, [currentView]);

    useEffect(() => {
        // 1. Check for Vite Environment Variables
        const envUrl = import.meta.env.VITE_SUPABASE_URL;
        const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (envUrl && envKey && envUrl !== 'your_supabase_url_here') {
            if (initSupabase(envUrl, envKey)) {
                setIsConfigured(true);
                return;
            }
        }

        // 2. Fallback to localStorage
        const savedUrl = localStorage.getItem('supabase-url');
        const savedKey = localStorage.getItem('supabase-key');

        if (savedUrl && savedKey) {
            if (initSupabase(savedUrl, savedKey)) {
                setIsConfigured(true);
            }
        }
    }, []);

    const handleConfigSubmit = (url, key) => {
        if (initSupabase(url, key)) {
            localStorage.setItem('supabase-url', url);
            localStorage.setItem('supabase-key', key);
            setIsConfigured(true);
        } else {
            alert("Failed to initialize Supabase. Check credentials.");
        }
    };

    const isAdminView = ['board', 'settings', 'profile', 'admin_reports'].includes(currentView);

    return (
        <div className="app-layout">
            {isConfigured ? (
                <>
                    {/* Admin Sidebar Elements */}
                    {isAdminView && (
                        <>
                            <div
                                className={`sidebar-backdrop ${isSidebarOpen ? 'active' : ''}`}
                                onClick={() => setIsSidebarOpen(false)}
                            ></div>
                            <ProjectSidebar
                                currentProject={currentProject}
                                setCurrentProject={setCurrentProject}
                                isOpen={isSidebarOpen}
                                setIsOpen={setIsSidebarOpen}
                            />
                        </>
                    )}

                    {/* Router Setup */}
                    {currentView === 'role_select' && (
                        <RoleSelect
                            onSelectRole={(r) => setCurrentView(r === 'admin' ? 'board' : 'dev_login')}
                        />
                    )}

                    {currentView === 'dev_login' && (
                        <DevLogin
                            onBack={() => setCurrentView('role_select')}
                            onLoginSuccess={(user) => {
                                setDevUser(user);
                                setCurrentView('dev_dashboard');
                            }}
                        />
                    )}

                    {currentView === 'dev_dashboard' && (
                        <DevDashboard
                            devUser={devUser}
                            onLogout={() => {
                                setDevUser(null);
                                setCurrentView('role_select');
                            }}
                        />
                    )}

                    {currentView === 'board' && (
                        <KanbanBoard
                            currentProject={currentProject}
                            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                            onNavigate={setCurrentView}
                        />
                    )}
                    {currentView === 'settings' && <Settings onNavigate={setCurrentView} />}
                    {currentView === 'profile' && <Profile onNavigate={setCurrentView} />}
                    {currentView === 'admin_reports' && <AdminReports onNavigate={setCurrentView} />}
                </>
            ) : (
                <SetupModal onConnect={handleConfigSubmit} />
            )}
        </div>
    );
}

export default App;
