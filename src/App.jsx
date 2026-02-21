import { useState, useEffect } from 'react';
import ProjectSidebar from './components/ProjectSidebar';
import KanbanBoard from './components/KanbanBoard';
import SetupModal from './components/Modals/SetupModal';
import Settings from './components/Settings';
import Profile from './components/Profile';
import { supabase, initSupabase, isSupabaseConfigured } from './lib/supabase';

function App() {
    const [isConfigured, setIsConfigured] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [currentView, setCurrentView] = useState('board'); // 'board', 'settings', or 'profile'

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

        // 2. Fallback to localStorage (from previous Setup Modal entries)
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

    return (
        <div className="app-layout">
            {isConfigured ? (
                <>
                    <ProjectSidebar
                        currentProject={currentProject}
                        setCurrentProject={setCurrentProject}
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                    />
                    {currentView === 'board' && (
                        <KanbanBoard
                            currentProject={currentProject}
                            toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                            onNavigate={setCurrentView}
                        />
                    )}
                    {currentView === 'settings' && <Settings onNavigate={setCurrentView} />}
                    {currentView === 'profile' && <Profile onNavigate={setCurrentView} />}
                </>
            ) : (
                <SetupModal onConnect={handleConfigSubmit} />
            )}
        </div>
    );
}

export default App;
