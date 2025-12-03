import { supabase } from './supabase';

// ============================================
// PROJECTS CRUD
// ============================================

export const projectsApi = {
    // Get all projects (public)
    async getAll() {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                profiles:author_id (full_name, avatar_url)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get single project by ID
    async getById(id) {
        const { data, error } = await supabase
            .from('projects')
            .select(`
                *,
                profiles:author_id (full_name, avatar_url)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Get projects by current user
    async getMyProjects(userId) {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Create new project
    async create(project) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('projects')
            .insert({
                title: project.title,
                description: project.description,
                status: project.status || 'Planning',
                tech_stack: project.techStack ? project.techStack.split(',').map(t => t.trim()) : [],
                image_url: project.imageUrl || null,
                author_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update project
    async update(id, project) {
        const { data, error } = await supabase
            .from('projects')
            .update({
                title: project.title,
                description: project.description,
                status: project.status,
                tech_stack: project.techStack ? project.techStack.split(',').map(t => t.trim()) : [],
                image_url: project.imageUrl || null
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete project
    async delete(id) {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

// ============================================
// POSTS (BLOG) CRUD
// ============================================

export const postsApi = {
    // Get all published posts (public)
    async getPublished() {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:author_id (full_name, avatar_url)
            `)
            .eq('published', true)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Get single post by ID
    async getById(id) {
        const { data, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:author_id (full_name, avatar_url)
            `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Get posts by current user (including drafts)
    async getMyPosts(userId) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Create new post
    async create(post) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('posts')
            .insert({
                title: post.title,
                content: post.content,
                tags: post.tags ? post.tags.split(',').map(t => t.trim()) : [],
                published: post.published || false,
                author_id: user.id
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Update post
    async update(id, post) {
        const { data, error } = await supabase
            .from('posts')
            .update({
                title: post.title,
                content: post.content,
                tags: post.tags ? post.tags.split(',').map(t => t.trim()) : [],
                published: post.published
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete post
    async delete(id) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Toggle publish status
    async togglePublish(id, published) {
        const { data, error } = await supabase
            .from('posts')
            .update({ published })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// ============================================
// PROFILES
// ============================================

export const profilesApi = {
    // Get current user profile
    async getCurrentProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;
        return data;
    },

    // Update profile
    async update(profile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('profiles')
            .update({
                username: profile.username,
                full_name: profile.fullName,
                avatar_url: profile.avatarUrl,
                updated_at: new Date().toISOString()
            })
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};
