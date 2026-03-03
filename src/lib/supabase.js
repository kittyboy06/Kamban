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

export const deleteProject = async (projectId) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
    return true;
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

// ================= DEVELOPER API =================

export const getDevelopers = async () => {
    const { data, error } = await supabase
        .from('developers')
        .select('*')
        .order('name');
    if (error) throw error;
    return data;
};

export const createDeveloper = async (developerData) => {
    const { data, error } = await supabase
        .from('developers')
        .insert([developerData])
        .select();
    if (error) throw error;
    return data[0];
};

export const deleteDeveloper = async (developerId) => {
    const { error } = await supabase
        .from('developers')
        .delete()
        .eq('id', developerId);
    if (error) throw error;
    return true;
};

export const authenticateDeveloper = async (name, passcode) => {
    const { data, error } = await supabase
        .from('developers')
        .select('*')
        .eq('name', name)
        .eq('passcode', passcode)
        .single();
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is no rows found
    return data;
};

export const createDeveloperLog = async (logData) => {
    const { data, error } = await supabase
        .from('developer_logs')
        .insert([logData])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const getDeveloperLogs = async () => {
    const { data, error } = await supabase
        .from('developer_logs')
        .select('*')
        .order('logout_time', { ascending: false });
    if (error) throw error;
    return data;
};

export const deleteDeveloperLog = async (logId) => {
    const { error } = await supabase
        .from('developer_logs')
        .delete()
        .eq('id', logId);
    if (error) throw error;
    return true;
};
