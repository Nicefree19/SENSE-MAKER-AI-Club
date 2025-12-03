import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';
import { supabase } from '../../lib/supabase';
import { bookmarksApi } from '../../lib/database';
import {
    Bookmark,
    Loader2,
    AlertCircle,
    FileText,
    FolderKanban,
    ExternalLink,
    Trash2,
    Calendar
} from 'lucide-react';

const MemberBookmarks = () => {
    const navigate = useNavigate();
    const [bookmarks, setBookmarks] = useState({ posts: [], projects: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        loadBookmarks();
    }, []);

    const loadBookmarks = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/member/login');
                return;
            }

            const data = await bookmarksApi.getUserBookmarks(user.id);

            // Separate posts and projects
            const posts = data.filter(b => b.post_id && b.posts).map(b => ({
                ...b.posts,
                bookmark_id: b.id,
                bookmarked_at: b.created_at
            }));

            const projects = data.filter(b => b.project_id && b.projects).map(b => ({
                ...b.projects,
                bookmark_id: b.id,
                bookmarked_at: b.created_at
            }));

            setBookmarks({ posts, projects });
        } catch (err) {
            console.error('Failed to load bookmarks:', err);
            setError('북마크를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveBookmark = async (bookmarkId, type) => {
        try {
            await supabase.from('bookmarks').delete().eq('id', bookmarkId);

            if (type === 'post') {
                setBookmarks(prev => ({
                    ...prev,
                    posts: prev.posts.filter(p => p.bookmark_id !== bookmarkId)
                }));
            } else {
                setBookmarks(prev => ({
                    ...prev,
                    projects: prev.projects.filter(p => p.bookmark_id !== bookmarkId)
                }));
            }
        } catch (err) {
            console.error('Failed to remove bookmark:', err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <MemberLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 size={40} className="animate-spin text-primary" />
                </div>
            </MemberLayout>
        );
    }

    return (
        <MemberLayout>
            <SEO
                title="북마크"
                description="저장한 게시글과 프로젝트를 확인합니다."
            />

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <Bookmark size={28} className="text-primary" />
                    <h1 className="text-2xl font-bold text-white">내 북마크</h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-4 mb-6 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('posts')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                            activeTab === 'posts'
                                ? 'text-primary border-primary'
                                : 'text-gray-400 border-transparent hover:text-white'
                        }`}
                    >
                        <FileText size={18} />
                        블로그 ({bookmarks.posts.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${
                            activeTab === 'projects'
                                ? 'text-primary border-primary'
                                : 'text-gray-400 border-transparent hover:text-white'
                        }`}
                    >
                        <FolderKanban size={18} />
                        프로젝트 ({bookmarks.projects.length})
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'posts' ? (
                    bookmarks.posts.length === 0 ? (
                        <div className="bg-dark-surface rounded-xl border border-white/5 p-12 text-center">
                            <FileText size={48} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">북마크한 블로그 글이 없습니다.</p>
                            <Link
                                to="/blog"
                                className="inline-block mt-4 text-primary hover:text-primary-light"
                            >
                                블로그 둘러보기 →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookmarks.posts.map((post) => (
                                <div
                                    key={post.id}
                                    className="bg-dark-surface rounded-xl border border-white/5 p-6 hover:border-primary/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <Link
                                                to={`/blog/${post.id}`}
                                                className="text-lg font-semibold text-white hover:text-primary transition-colors"
                                            >
                                                {post.title}
                                            </Link>
                                            <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                                                {post.content?.substring(0, 150)}...
                                            </p>
                                            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {formatDate(post.created_at)}
                                                </span>
                                                {post.tags && post.tags.length > 0 && (
                                                    <div className="flex gap-2">
                                                        {post.tags.slice(0, 3).map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={`/blog/${post.id}`}
                                                className="p-2 text-gray-500 hover:text-white transition-colors"
                                            >
                                                <ExternalLink size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleRemoveBookmark(post.bookmark_id, 'post')}
                                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    bookmarks.projects.length === 0 ? (
                        <div className="bg-dark-surface rounded-xl border border-white/5 p-12 text-center">
                            <FolderKanban size={48} className="mx-auto text-gray-600 mb-4" />
                            <p className="text-gray-400">북마크한 프로젝트가 없습니다.</p>
                            <Link
                                to="/projects"
                                className="inline-block mt-4 text-primary hover:text-primary-light"
                            >
                                프로젝트 둘러보기 →
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bookmarks.projects.map((project) => (
                                <div
                                    key={project.id}
                                    className="bg-dark-surface rounded-xl border border-white/5 p-6 hover:border-primary/30 transition-all group"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <Link
                                                to={`/projects/${project.id}`}
                                                className="text-lg font-semibold text-white hover:text-primary transition-colors"
                                            >
                                                {project.title}
                                            </Link>
                                            <p className="text-gray-400 text-sm mt-2 line-clamp-2">
                                                {project.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-3">
                                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                    project.status === 'Completed'
                                                        ? 'bg-green-500/20 text-green-400'
                                                        : project.status === 'In Progress'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Link
                                                to={`/projects/${project.id}`}
                                                className="p-2 text-gray-500 hover:text-white transition-colors"
                                            >
                                                <ExternalLink size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleRemoveBookmark(project.bookmark_id, 'project')}
                                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </MemberLayout>
    );
};

export default MemberBookmarks;
