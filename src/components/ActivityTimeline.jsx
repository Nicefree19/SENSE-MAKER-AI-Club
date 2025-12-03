import React, { useState, useEffect } from 'react';
import { activityApi } from '../lib/database';
import {
    FolderPlus,
    FileText,
    MessageCircle,
    Heart,
    Users,
    Edit,
    Trash2,
    Send,
    Loader2,
    Clock
} from 'lucide-react';

const ActivityTimeline = ({ userId = null, limit = 10 }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadActivities();
    }, [userId]);

    const loadActivities = async () => {
        try {
            setLoading(true);
            const data = await activityApi.getRecent(userId, limit);
            setActivities(data || []);
        } catch (err) {
            console.error('Failed to load activities:', err);
        } finally {
            setLoading(false);
        }
    };

    const getActivityIcon = (action) => {
        const icons = {
            'create_project': <FolderPlus size={16} className="text-accent" />,
            'update_project': <Edit size={16} className="text-blue-400" />,
            'delete_project': <Trash2 size={16} className="text-red-400" />,
            'create_post': <FileText size={16} className="text-green-400" />,
            'update_post': <Edit size={16} className="text-blue-400" />,
            'delete_post': <Trash2 size={16} className="text-red-400" />,
            'publish_post': <Send size={16} className="text-primary" />,
            'comment': <MessageCircle size={16} className="text-yellow-400" />,
            'like': <Heart size={16} className="text-red-400" />,
            'join_project': <Users size={16} className="text-purple-400" />
        };
        return icons[action] || <Clock size={16} className="text-gray-400" />;
    };

    const getActivityText = (activity) => {
        const texts = {
            'create_project': '새 프로젝트를 생성했습니다',
            'update_project': '프로젝트를 수정했습니다',
            'delete_project': '프로젝트를 삭제했습니다',
            'create_post': '새 글을 작성했습니다',
            'update_post': '글을 수정했습니다',
            'delete_post': '글을 삭제했습니다',
            'publish_post': '글을 발행했습니다',
            'comment': '댓글을 남겼습니다',
            'like': '좋아요를 눌렀습니다',
            'join_project': '프로젝트에 참여했습니다'
        };
        return texts[activity.action] || '활동을 했습니다';
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = (now - date) / 1000;

        if (diff < 60) return '방금 전';
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

        return date.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 size={24} className="animate-spin text-primary" />
            </div>
        );
    }

    if (activities.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <Clock size={32} className="mx-auto mb-2 opacity-50" />
                <p>아직 활동 기록이 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {activities.map((activity, index) => (
                <div
                    key={activity.id}
                    className="flex items-start gap-3 relative"
                >
                    {/* Timeline Line */}
                    {index < activities.length - 1 && (
                        <div className="absolute left-4 top-8 w-px h-full bg-white/10"></div>
                    )}

                    {/* Icon */}
                    <div className="w-8 h-8 rounded-full bg-dark-surface border border-white/10 flex items-center justify-center flex-shrink-0 z-10">
                        {getActivityIcon(activity.action)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-white text-sm">
                                {activity.profiles?.full_name || '익명'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatTime(activity.created_at)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-400">
                            {getActivityText(activity)}
                        </p>
                        {activity.metadata?.title && (
                            <p className="text-xs text-gray-500 mt-1">
                                "{activity.metadata.title}"
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ActivityTimeline;
