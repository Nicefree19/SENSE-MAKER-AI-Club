import { supabase } from './supabase';

// ============================================
// PROJECTS CRUD
// ============================================

export const projectsApi = {
    // Get all projects (public) with pagination
    async getAll(options = {}) {
        const { page = 1, limit = 12, status, search, techStack } = options;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('projects')
            .select(`
                *,
                profiles:author_id (full_name, avatar_url)
            `, { count: 'exact' });

        if (status) {
            query = query.eq('status', status);
        }

        // Only show published projects in public list
        query = query.eq('published', true);

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }
        if (techStack) {
            query = query.contains('tech_stack', [techStack]);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;
        return { data, count, page, limit, totalPages: Math.ceil(count / limit) };
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
                tech_stack: project.techStack ? project.techStack.split(',').map(t => t.trim()).filter(Boolean) : [],
                github_url: project.githubUrl || null,
                demo_url: project.demoUrl || null,
                model_url: project.modelUrl || null,
                layout_config: project.layoutConfig || {},
                published: project.published || false,
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
                status: project.status || 'Planning',
                tech_stack: project.techStack ? project.techStack.split(',').map(t => t.trim()).filter(Boolean) : [],
                github_url: project.githubUrl || null,
                demo_url: project.demoUrl || null,
                model_url: project.modelUrl || null,
                layout_config: project.layoutConfig || {},
                published: project.published,
                updated_at: new Date().toISOString()
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
    },

    // Increment view count
    async incrementView(id) {
        const { error } = await supabase.rpc('increment_view_count', {
            table_name: 'projects',
            row_id: id
        });
        if (error) console.error('Failed to increment view:', error);
    }
};

// ============================================
// PROJECT MEMBERS (Collaboration)
// ============================================

export const projectMembersApi = {
    // Get project members
    async getByProjectId(projectId) {
        const { data, error } = await supabase
            .from('project_members')
            .select(`
                *,
                profiles:user_id (id, full_name, avatar_url, email)
            `)
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Add member to project
    async addMember(projectId, userId, role = 'member') {
        const { data, error } = await supabase
            .from('project_members')
            .insert({
                project_id: projectId,
                user_id: userId,
                role: role
            })
            .select(`
                *,
                profiles:user_id (id, full_name, avatar_url, email)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    // Update member role
    async updateRole(projectId, userId, role) {
        const { data, error } = await supabase
            .from('project_members')
            .update({ role })
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Remove member from project
    async removeMember(projectId, userId) {
        const { error } = await supabase
            .from('project_members')
            .delete()
            .eq('project_id', projectId)
            .eq('user_id', userId);

        if (error) throw error;
        return true;
    },

    // Check if user is member of project
    async isMember(projectId, userId) {
        const { data, error } = await supabase
            .from('project_members')
            .select('id, role')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    // Get projects where user is a member
    async getMyProjects() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('project_members')
            .select(`
                role,
                projects:project_id (
                    *,
                    profiles:author_id (full_name, avatar_url)
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};

// ============================================
// POSTS (BLOG) CRUD
// ============================================

export const postsApi = {
    // Get all published posts (public) with pagination
    async getPublished(options = {}) {
        const { page = 1, limit = 12, tag, search } = options;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from('posts')
            .select(`
                *,
                profiles:author_id (full_name, avatar_url)
            `, { count: 'exact' })
            .eq('published', true);

        if (tag) {
            query = query.contains('tags', [tag]);
        }
        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }

        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) throw error;
        return { data, count, page, limit, totalPages: Math.ceil(count / limit) };
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
                subtitle: post.subtitle || null,
                content: post.content,
                image_url: post.imageUrl || null,
                tags: post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
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
                subtitle: post.subtitle || null,
                content: post.content,
                image_url: post.imageUrl || null,
                tags: post.tags ? post.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
                published: post.published,
                updated_at: new Date().toISOString()
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
    },

    // Increment view count
    async incrementView(id) {
        const { error } = await supabase.rpc('increment_view_count', {
            table_name: 'posts',
            row_id: id
        });
        if (error) console.error('Failed to increment view:', error);
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

    // Get profile by ID
    async getById(id) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    // Get all profiles (public members)
    async getAll() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Update profile
    async update(profile) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id: user.id,
                username: profile.username,
                full_name: profile.fullName,
                avatar_url: profile.avatarUrl,
                bio: profile.bio,
                website: profile.website,
                github: profile.github,
                linkedin: profile.linkedin,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// ============================================
// COMMENTS
// ============================================

export const commentsApi = {
    // Get comments for a post
    async getByPostId(postId) {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                profiles:author_id (full_name, avatar_url),
                replies:comments!parent_id (
                    *,
                    profiles:author_id (full_name, avatar_url)
                )
            `)
            .eq('post_id', postId)
            .is('parent_id', null)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Get comments for a project
    async getByProjectId(projectId) {
        const { data, error } = await supabase
            .from('comments')
            .select(`
                *,
                profiles:author_id (full_name, avatar_url),
                replies:comments!parent_id (
                    *,
                    profiles:author_id (full_name, avatar_url)
                )
            `)
            .eq('project_id', projectId)
            .is('parent_id', null)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    },

    // Create comment
    async create(comment) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('comments')
            .insert({
                content: comment.content,
                post_id: comment.postId || null,
                project_id: comment.projectId || null,
                parent_id: comment.parentId || null,
                author_id: user.id
            })
            .select(`
                *,
                profiles:author_id (full_name, avatar_url)
            `)
            .single();

        if (error) throw error;
        return data;
    },

    // Update comment
    async update(id, content) {
        const { data, error } = await supabase
            .from('comments')
            .update({
                content,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Delete comment
    async delete(id) {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

// ============================================
// LIKES
// ============================================

export const likesApi = {
    // Check if user liked a post
    async hasLikedPost(postId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    },

    // Check if user liked a project
    async hasLikedProject(projectId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('likes')
            .select('id')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    },

    // Get like count for post
    async getPostLikeCount(postId) {
        const { count, error } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

        if (error) throw error;
        return count || 0;
    },

    // Get like count for project
    async getProjectLikeCount(projectId) {
        const { count, error } = await supabase
            .from('likes')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', projectId);

        if (error) throw error;
        return count || 0;
    },

    // Toggle like for post
    async togglePostLike(postId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const hasLiked = await this.hasLikedPost(postId);

        if (hasLiked) {
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);
            if (error) throw error;
            return false;
        } else {
            const { error } = await supabase
                .from('likes')
                .insert({ post_id: postId, user_id: user.id });
            if (error) throw error;
            return true;
        }
    },

    // Toggle like for project
    async toggleProjectLike(projectId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const hasLiked = await this.hasLikedProject(projectId);

        if (hasLiked) {
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('project_id', projectId)
                .eq('user_id', user.id);
            if (error) throw error;
            return false;
        } else {
            const { error } = await supabase
                .from('likes')
                .insert({ project_id: projectId, user_id: user.id });
            if (error) throw error;
            return true;
        }
    }
};

// ============================================
// BOOKMARKS
// ============================================

export const bookmarksApi = {
    // Get user's bookmarks
    async getMyBookmarks() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { posts: [], projects: [] };

        const [postsRes, projectsRes] = await Promise.all([
            supabase
                .from('bookmarks')
                .select(`
                    *,
                    posts:post_id (*)
                `)
                .eq('user_id', user.id)
                .not('post_id', 'is', null),
            supabase
                .from('bookmarks')
                .select(`
                    *,
                    projects:project_id (*)
                `)
                .eq('user_id', user.id)
                .not('project_id', 'is', null)
        ]);

        if (postsRes.error) throw postsRes.error;
        if (projectsRes.error) throw projectsRes.error;

        return {
            posts: postsRes.data?.map(b => b.posts) || [],
            projects: projectsRes.data?.map(b => b.projects) || []
        };
    },

    // Check if post is bookmarked
    async hasBookmarkedPost(postId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;

        const { data, error } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return !!data;
    },

    // Toggle bookmark for post
    async togglePostBookmark(postId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const hasBookmarked = await this.hasBookmarkedPost(postId);

        if (hasBookmarked) {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);
            if (error) throw error;
            return false;
        } else {
            const { error } = await supabase
                .from('bookmarks')
                .insert({ post_id: postId, user_id: user.id });
            if (error) throw error;
            return true;
        }
    },

    // Toggle bookmark for project
    async toggleProjectBookmark(projectId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .single();

        if (data) {
            const { error } = await supabase
                .from('bookmarks')
                .delete()
                .eq('project_id', projectId)
                .eq('user_id', user.id);
            if (error) throw error;
            return false;
        } else {
            const { error } = await supabase
                .from('bookmarks')
                .insert({ project_id: projectId, user_id: user.id });
            if (error) throw error;
            return true;
        }
    }
};

// ============================================
// NOTIFICATIONS
// ============================================

export const notificationsApi = {
    // Get user's notifications
    async getMyNotifications(limit = 20) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    },

    // Get unread count
    async getUnreadCount() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return 0;

        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (error) throw error;
        return count || 0;
    },

    // Mark as read
    async markAsRead(id) {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
        return true;
    },

    // Mark all as read
    async markAllAsRead() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (error) throw error;
        return true;
    },

    // Delete notification
    async delete(id) {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

// ============================================
// CONTACT MESSAGES (Admin)
// ============================================

export const contactApi = {
    // Send contact message (public)
    async send(message) {
        const { data, error } = await supabase
            .from('contact_messages')
            .insert({
                name: message.name,
                email: message.email,
                message: message.message
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // Get all messages (admin only)
    async getAll() {
        const { data, error } = await supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    // Mark as read (admin only)
    async markAsRead(id) {
        const { error } = await supabase
            .from('contact_messages')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};

// ============================================
// ACTIVITY LOGS
// ============================================

export const activityApi = {
    // Get recent activities
    async getRecent(limit = 20) {
        const { data, error } = await supabase
            .from('activity_logs')
            .select(`
                *,
                profiles:user_id (full_name, avatar_url)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    },

    // Log activity
    async log(action, targetType, targetId, metadata = {}) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('activity_logs')
            .insert({
                user_id: user.id,
                action,
                target_type: targetType,
                target_id: targetId,
                metadata
            });

        if (error) console.error('Failed to log activity:', error);
    }
};

// ============================================
// USER SETTINGS
// ============================================

export const settingsApi = {
    // Get user settings
    async get() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    // Update or create settings
    async upsert(settings) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('user_settings')
            .upsert({
                user_id: user.id,
                theme: settings.theme,
                email_notifications: settings.emailNotifications,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    }
};

// ============================================
// IMAGE UPLOAD (Supabase Storage)
// ============================================

export const storageApi = {
    // Upload image
    async uploadImage(file, bucket = 'images') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(data.path);

        return publicUrl;
    },

    // Delete image
    async deleteImage(url, bucket = 'images') {
        const path = url.split(`${bucket}/`)[1];
        if (!path) return;

        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) throw error;
        return true;
    }
};
