import { createClient } from '@supabase/supabase-js';

export let supabase = null;

export const initSupabase = (url, key) => {
    if (!url || !key) return false;
    try {
        supabase = createClient(url, key);
        return true;
    } catch (e) {
        console.error("Failed to init supabase", e);
        return false;
    }
};

export const isSupabaseConfigured = () => supabase !== null;

// API Abstractions

export const getProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data;
};

export const createProject = async (name) => {
    const { data, error } = await supabase.from('projects').insert([{ name }]).select();
    if (error) throw error;
    return data[0];
};

export const getTasks = async (projectId) => {
    const { data, error } = await supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
};

export const createTask = async (taskData) => {
    const { data, error } = await supabase.from('tasks').insert([taskData]).select();
    if (error) throw error;
    return data[0];
};

export const updateTask = async (taskId, updates) => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', taskId).select();
    if (error) throw error;
    return data[0];
};

export const deleteTask = async (taskId) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);
    if (error) throw error;
    return true;
};
