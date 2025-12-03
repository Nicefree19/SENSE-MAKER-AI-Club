import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    Eye,
    Heart,
    MessageCircle,
    FileText,
    FolderKanban,
    TrendingUp,
    TrendingDown,
    Loader2,
    BarChart3,
    Calendar
} from 'lucide-react';

const StatsPanel = ({ userId }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('all'); // 'week', 'month', 'all'

    useEffect(() => {
        if (userId) {
            loadStats();
        }
    }, [userId, period]);

    const loadStats = async () => {
        try {
            setLoading(true);

            // Calculate date range
            let dateFilter = null;
            const now = new Date();
            if (period === 'week') {
                dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
            } else if (period === 'month') {
                dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
            }

            // Fetch user's posts
            let postsQuery = supabase
                .from('posts')
                .select('id, view_count, created_at')
                .eq('author_id', userId)
                .eq('published', true);

            if (dateFilter) {
                postsQuery = postsQuery.gte('created_at', dateFilter);
            }

            const { data: posts } = await postsQuery;

            // Fetch user's projects
            let projectsQuery = supabase
                .from('projects')
                .select('id, created_at')
                .eq('author_id', userId);

            if (dateFilter) {
                projectsQuery = projectsQuery.gte('created_at', dateFilter);
            }

            const { data: projects } = await projectsQuery;

            // Calculate total views
            const totalViews = posts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;

            // Fetch likes on user's posts
            const postIds = posts?.map(p => p.id) || [];
            let likesCount = 0;
            if (postIds.length > 0) {
                const { count } = await supabase
                    .from('likes')
                    .select('*', { count: 'exact', head: true })
                    .in('post_id', postIds);
                likesCount = count || 0;
            }

            // Fetch comments on user's posts
            let commentsCount = 0;
            if (postIds.length > 0) {
                const { count } = await supabase
                    .from('comments')
                    .select('*', { count: 'exact', head: true })
                    .in('post_id', postIds);
                commentsCount = count || 0;
            }

            // Calculate previous period stats for trend comparison
            let previousViews = 0;
            let previousLikes = 0;
            if (period !== 'all' && dateFilter) {
                const prevDateStart = period === 'week'
                    ? new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()
                    : new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString();

                const { data: prevPosts } = await supabase
                    .from('posts')
                    .select('id, view_count')
                    .eq('author_id', userId)
                    .eq('published', true)
                    .gte('created_at', prevDateStart)
                    .lt('created_at', dateFilter);

                previousViews = prevPosts?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;

                const prevPostIds = prevPosts?.map(p => p.id) || [];
                if (prevPostIds.length > 0) {
                    const { count } = await supabase
                        .from('likes')
                        .select('*', { count: 'exact', head: true })
                        .in('post_id', prevPostIds);
                    previousLikes = count || 0;
                }
            }

            setStats({
                posts: posts?.length || 0,
                projects: projects?.length || 0,
                views: totalViews,
                likes: likesCount,
                comments: commentsCount,
                viewsTrend: previousViews > 0 ? ((totalViews - previousViews) / previousViews * 100).toFixed(1) : null,
                likesTrend: previousLikes > 0 ? ((likesCount - previousLikes) / previousLikes * 100).toFixed(1) : null
            });
        } catch (err) {
            console.error('Failed to load stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ icon: Icon, label, value, trend, color }) => (
        <div className="bg-dark-bg rounded-lg p-4 border border-white/5">
            <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
                    <Icon size={18} className={color.replace('bg-', 'text-')} />
                </div>
                {trend !== null && trend !== undefined && (
                    <div className={`flex items-center gap-1 text-xs ${
                        parseFloat(trend) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                        {parseFloat(trend) >= 0 ? (
                            <TrendingUp size={14} />
                        ) : (
                            <TrendingDown size={14} />
                        )}
                        {Math.abs(parseFloat(trend))}%
                    </div>
                )}
            </div>
            <p className="text-2xl font-bold text-white">{value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
        </div>
    );

    if (loading) {
        return (
            <div className="bg-dark-surface rounded-xl border border-white/5 p-6">
                <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="animate-spin text-primary" />
                </div>
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="bg-dark-surface rounded-xl border border-white/5 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <BarChart3 size={20} className="text-primary" />
                    활동 통계
                </h2>
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="bg-dark-bg border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
                    >
                        <option value="week">최근 7일</option>
                        <option value="month">최근 30일</option>
                        <option value="all">전체 기간</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard
                    icon={FileText}
                    label="발행된 글"
                    value={stats.posts}
                    color="bg-green-400"
                />
                <StatCard
                    icon={FolderKanban}
                    label="프로젝트"
                    value={stats.projects}
                    color="bg-accent"
                />
                <StatCard
                    icon={Eye}
                    label="총 조회수"
                    value={stats.views}
                    trend={stats.viewsTrend}
                    color="bg-blue-400"
                />
                <StatCard
                    icon={Heart}
                    label="받은 좋아요"
                    value={stats.likes}
                    trend={stats.likesTrend}
                    color="bg-red-400"
                />
                <StatCard
                    icon={MessageCircle}
                    label="받은 댓글"
                    value={stats.comments}
                    color="bg-yellow-400"
                />
            </div>

            {/* Quick insights */}
            <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-medium text-gray-400 mb-3">빠른 인사이트</h3>
                <div className="space-y-2">
                    {stats.posts > 0 && stats.views > 0 && (
                        <p className="text-sm text-gray-300">
                            글당 평균 <span className="text-primary font-medium">
                                {Math.round(stats.views / stats.posts).toLocaleString()}
                            </span>회 조회
                        </p>
                    )}
                    {stats.posts > 0 && stats.likes > 0 && (
                        <p className="text-sm text-gray-300">
                            글당 평균 <span className="text-red-400 font-medium">
                                {(stats.likes / stats.posts).toFixed(1)}
                            </span>개 좋아요
                        </p>
                    )}
                    {stats.viewsTrend && parseFloat(stats.viewsTrend) > 0 && (
                        <p className="text-sm text-green-400">
                            조회수가 이전 기간 대비 {stats.viewsTrend}% 증가했습니다!
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StatsPanel;
