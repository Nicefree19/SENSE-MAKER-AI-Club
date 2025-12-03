import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { likesApi } from '../lib/database';

const LikeButton = ({
    postId = null,
    projectId = null,
    initialCount = 0,
    size = 'default',
    showCount = true
}) => {
    const [liked, setLiked] = useState(false);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (user) {
            checkIfLiked();
        }
    }, [user, postId, projectId]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const checkIfLiked = async () => {
        if (!user) return;

        try {
            const isLiked = await likesApi.isLiked(
                user.id,
                postId ? 'post' : 'project',
                postId || projectId
            );
            setLiked(isLiked);
        } catch (err) {
            console.error('Failed to check like status:', err);
        }
    };

    const handleLike = async (e) => {
        e.stopPropagation();

        if (!user) {
            alert('좋아요를 누르려면 로그인이 필요합니다.');
            return;
        }

        if (loading) return;

        try {
            setLoading(true);

            if (liked) {
                await likesApi.unlike(
                    user.id,
                    postId ? 'post' : 'project',
                    postId || projectId
                );
                setLiked(false);
                setCount(prev => Math.max(0, prev - 1));
            } else {
                await likesApi.like(
                    user.id,
                    postId ? 'post' : 'project',
                    postId || projectId
                );
                setLiked(true);
                setCount(prev => prev + 1);
            }
        } catch (err) {
            console.error('Failed to toggle like:', err);
        } finally {
            setLoading(false);
        }
    };

    const sizeClasses = {
        small: 'p-1.5',
        default: 'p-2',
        large: 'p-3'
    };

    const iconSizes = {
        small: 14,
        default: 18,
        large: 24
    };

    return (
        <button
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-1.5 rounded-lg transition-all ${sizeClasses[size]} ${
                liked
                    ? 'text-red-500 hover:text-red-400'
                    : 'text-gray-500 hover:text-red-400'
            } disabled:opacity-50`}
            title={liked ? '좋아요 취소' : '좋아요'}
        >
            <Heart
                size={iconSizes[size]}
                className={`transition-transform ${loading ? 'animate-pulse' : ''} ${liked ? 'fill-current' : ''}`}
            />
            {showCount && count > 0 && (
                <span className="text-sm font-medium">{count}</span>
            )}
        </button>
    );
};

export default LikeButton;
