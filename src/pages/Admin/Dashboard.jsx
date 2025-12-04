import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import SEO from '../../components/SEO';
import ActivityTimeline from '../../components/ActivityTimeline';
import { supabase } from '../../lib/supabase';
import {
    Users,
    Eye,
    Activity,
    FileText,
    FolderKanban,
    MessageSquare,
    Mail,
    TrendingUp,
    Loader2
} from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        members: 0,
        projects: 0,
        posts: 0,
        comments: 0,
        messages: 0,
        views: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, [navigate]);

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/admin');
            return;
        }

        // Verify admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            navigate('/admin');
            return;
        }

        loadStats();
    };

    const loadStats = async () => {
        try {
            setLoading(true);

            // Fetch counts from Supabase
            const [
                { count: membersCount },
                { count: projectsCount },
                { count: postsCount },
                { count: messagesCount }
            ] = await Promise.all([
                supabase.from('profiles').select('*', { count: 'exact', head: true }),
                supabase.from('projects').select('*', { count: 'exact', head: true }),
                supabase.from('posts').select('*', { count: 'exact', head: true }).eq('published', true),
                supabase.from('contact_messages').select('*', { count: 'exact', head: true }).eq('is_read', false)
            ]);

            // Get total views
            const { data: postsData } = await supabase
                .from('posts')
                .select('view_count');

            const totalViews = postsData?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;

            setStats({
                members: membersCount || 0,
                projects: projectsCount || 0,
                posts: postsCount || 0,
                comments: 0,
                messages: messagesCount || 0,
                views: totalViews
            });
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: '총 멤버',
            value: stats.members,
            icon: <Users size={24} />,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10'
        },
        {
            title: '프로젝트',
            value: stats.projects,
            icon: <FolderKanban size={24} />,
            color: 'text-accent',
            bg: 'bg-accent/10'
        },
        {
            title: '발행된 글',
            value: stats.posts,
            icon: <FileText size={24} />,
            color: 'text-green-400',
            bg: 'bg-green-400/10'
        },
        {
            title: '총 조회수',
            value: stats.views.toLocaleString(),
            icon: <Eye size={24} />,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10'
        },
        {
            title: '미확인 문의',
            value: stats.messages,
            icon: <Mail size={24} />,
            color: stats.messages > 0 ? 'text-red-400' : 'text-gray-400',
            bg: stats.messages > 0 ? 'bg-red-400/10' : 'bg-gray-400/10',
            link: '/admin/messages'
        }
    ];

    return (
        <AdminLayout>
            <SEO title="관리자 대시보드" description="SENSE MAKER 활동 현황." />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">대시보드 개요</h1>
                <p className="text-gray-400 mt-2">환영합니다, 관리자님.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 size={40} className="animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {statCards.map((stat, index) => (
                            <div
                                key={index}
                                className={`bg-dark-surface p-5 rounded-xl border border-white/5 ${stat.link ? 'cursor-pointer hover:border-primary/30 transition-colors' : ''}`}
                                onClick={() => stat.link && navigate(stat.link)}
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div className={`p-2.5 rounded-lg ${stat.bg} ${stat.color}`}>
                                        {stat.icon}
                                    </div>
                                    {stat.link && stat.value > 0 && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-red-500/20 text-red-400">
                                            확인 필요
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                                <p className="text-gray-400 text-sm">{stat.title}</p>
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Activity */}
                        <div className="bg-dark-surface rounded-xl border border-white/5 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Activity size={20} className="text-primary" />
                                    최근 활동
                                </h2>
                            </div>
                            <ActivityTimeline limit={5} />
                        </div>

                        {/* Quick Links */}
                        <div className="bg-dark-surface rounded-xl border border-white/5 p-6">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <TrendingUp size={20} className="text-accent" />
                                빠른 메뉴
                            </h2>
                            <div className="space-y-3">
                                <Link
                                    to="/admin/messages"
                                    className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-white/5 hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Mail size={20} className="text-primary" />
                                        <span className="text-white">문의 메시지 관리</span>
                                    </div>
                                    {stats.messages > 0 && (
                                        <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">
                                            {stats.messages}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    to="/members"
                                    className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-white/5 hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <Users size={20} className="text-purple-400" />
                                        <span className="text-white">멤버 목록 보기</span>
                                    </div>
                                </Link>

                                <Link
                                    to="/projects"
                                    className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-white/5 hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <FolderKanban size={20} className="text-accent" />
                                        <span className="text-white">프로젝트 보기</span>
                                    </div>
                                </Link>

                                <Link
                                    to="/blog"
                                    className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-white/5 hover:border-primary/30 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText size={20} className="text-green-400" />
                                        <span className="text-white">블로그 보기</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </AdminLayout>
    );
};

export default Dashboard;
