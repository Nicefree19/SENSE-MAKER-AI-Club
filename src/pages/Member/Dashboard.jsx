import React, { useState, useEffect } from 'react';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';
import { Folder, FileText, Clock, Loader2, Trash2, Edit, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { projectsApi, postsApi } from '../../lib/database';

const MemberDashboard = () => {
    const [myProjects, setMyProjects] = useState([]);
    const [myPosts, setMyPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                setUser(user);

                // Load projects and posts in parallel
                const [projects, posts] = await Promise.all([
                    projectsApi.getMyProjects(user.id),
                    postsApi.getMyPosts(user.id)
                ]);

                setMyProjects(projects || []);
                setMyPosts(posts || []);
            }
        } catch (err) {
            console.error('Error loading data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProject = async (id) => {
        if (!window.confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;

        try {
            await projectsApi.delete(id);
            setMyProjects(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert('삭제 중 오류가 발생했습니다: ' + err.message);
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm('정말 이 글을 삭제하시겠습니까?')) return;

        try {
            await postsApi.delete(id);
            setMyPosts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert('삭제 중 오류가 발생했습니다: ' + err.message);
        }
    };

    const handleTogglePublish = async (id, currentStatus) => {
        try {
            await postsApi.togglePublish(id, !currentStatus);
            setMyPosts(prev => prev.map(p =>
                p.id === id ? { ...p, published: !currentStatus } : p
            ));
        } catch (err) {
            alert('상태 변경 중 오류가 발생했습니다: ' + err.message);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusLabel = (status) => {
        const labels = {
            'Planning': '기획 단계',
            'In Progress': '진행 중',
            'Completed': '완료됨'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            'Planning': 'bg-yellow-500/10 text-yellow-400',
            'In Progress': 'bg-primary/10 text-primary-light',
            'Completed': 'bg-green-500/10 text-green-400'
        };
        return colors[status] || 'bg-gray-500/10 text-gray-400';
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
            <SEO title="멤버 대시보드" description="나의 활동 내역을 관리합니다." />

            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">내 대시보드</h1>
                    <p className="text-gray-400 mt-2">오늘도 멋진 아이디어를 실현해보세요!</p>
                </div>
                <div className="space-x-4">
                    <Link to="/member/projects/new" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        + 새 프로젝트
                    </Link>
                    <Link to="/member/posts/new" className="bg-dark-surface border border-white/20 hover:bg-white/5 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        + 새 글 쓰기
                    </Link>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                    데이터를 불러오는 중 오류가 발생했습니다: {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* My Projects Section */}
                <div className="bg-dark-surface rounded-xl border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Folder size={20} className="text-accent" />
                            내 프로젝트
                            <span className="text-sm font-normal text-gray-500">({myProjects.length})</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {myProjects.length > 0 ? (
                            myProjects.map((project) => (
                                <div key={project.id} className="p-4 bg-dark-bg rounded-lg border border-white/5 hover:border-accent/30 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-white group-hover:text-accent transition-colors">
                                                {project.title}
                                            </h3>
                                            <span className="text-xs text-gray-500 mt-1 inline-block">
                                                {formatDate(project.created_at)}
                                            </span>
                                            {project.tech_stack && project.tech_stack.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {project.tech_stack.slice(0, 3).map((tech, i) => (
                                                        <span key={i} className="text-xs px-2 py-0.5 bg-white/5 rounded text-gray-400">
                                                            {tech}
                                                        </span>
                                                    ))}
                                                    {project.tech_stack.length > 3 && (
                                                        <span className="text-xs text-gray-500">+{project.tech_stack.length - 3}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                                                {getStatusLabel(project.status)}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                title="삭제"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <Folder size={40} className="mx-auto text-gray-600 mb-3" />
                                <p className="text-gray-500">아직 등록된 프로젝트가 없습니다.</p>
                                <Link to="/member/projects/new" className="text-primary hover:text-primary-light text-sm mt-2 inline-block">
                                    첫 프로젝트 만들기 →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* My Posts Section */}
                <div className="bg-dark-surface rounded-xl border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText size={20} className="text-green-400" />
                            내 기술 블로그
                            <span className="text-sm font-normal text-gray-500">({myPosts.length})</span>
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {myPosts.length > 0 ? (
                            myPosts.map((post) => (
                                <div key={post.id} className="p-4 bg-dark-bg rounded-lg border border-white/5 hover:border-green-400/30 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">
                                                    {post.title}
                                                </h3>
                                                {!post.published && (
                                                    <span className="text-xs px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded">
                                                        임시저장
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center text-gray-500 text-xs mt-1">
                                                <Clock size={12} className="mr-1" />
                                                {formatDate(post.created_at)}
                                            </div>
                                            {post.tags && post.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {post.tags.slice(0, 3).map((tag, i) => (
                                                        <span key={i} className="text-xs px-2 py-0.5 bg-green-500/10 rounded text-green-400">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleTogglePublish(post.id, post.published)}
                                                className={`p-1.5 transition-colors ${post.published ? 'text-green-400 hover:text-yellow-400' : 'text-yellow-400 hover:text-green-400'}`}
                                                title={post.published ? '비공개로 전환' : '발행하기'}
                                            >
                                                {post.published ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleDeletePost(post.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                                title="삭제"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <FileText size={40} className="mx-auto text-gray-600 mb-3" />
                                <p className="text-gray-500">작성한 글이 없습니다.</p>
                                <Link to="/member/posts/new" className="text-green-400 hover:text-green-300 text-sm mt-2 inline-block">
                                    첫 글 작성하기 →
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
};

export default MemberDashboard;
