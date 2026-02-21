import { useState } from 'react';

export default function SetupModal({ onConnect }) {
    const [url, setUrl] = useState('');
    const [key, setKey] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onConnect(url.trim(), key.trim());
    };

    return (
        <div className="modal-overlay active">
            <div className="modal-content" style={{ maxWidth: '600px' }}>
                <div className="modal-header">
                    <h3>Supabase Configuration Required</h3>
                </div>

                <div className="setup-instructions" style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <p>To use the live database, please run this SQL in your Supabase SQL Editor:</p>
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '6px', marginTop: '0.5rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', fontSize: '0.8rem', border: '1px solid var(--border-subtle)', maxHeight: '200px', overflowY: 'auto' }}>
                        {`create table public.projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references public.projects(id) on delete cascade not null,
  title text not null,
  description text,
  status text not null,
  priority text not null,
  developer_name text,
  developer_designation text,
  deadline date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Fix 401 Unauthorized errors by lowering RLS policies for public access (No Auth Required)
alter table public.projects disable row level security;
alter table public.tasks disable row level security;`}
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group w-full">
                        <label>Project URL</label>
                        <input type="text" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://xxxx.supabase.co" />
                    </div>
                    <div className="form-group w-full">
                        <label>Anon Public Key</label>
                        <input type="text" value={key} onChange={e => setKey(e.target.value)} required placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." />
                    </div>
                    <div className="modal-actions">
                        <button type="submit" className="btn-primary">Connect to Supabase</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
