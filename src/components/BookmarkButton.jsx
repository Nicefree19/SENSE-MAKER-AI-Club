import React, { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { bookmarksApi } from '../lib/database';

const BookmarkButton = ({
    postId = null,
    projectId = null,
    size = 'default'
}) => {
    const [bookmarked, setBookmarked] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (user) {
            checkIfBookmarked();
        }
    }, [user, postId, projectId]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const checkIfBookmarked = async () => {
        if (!user) return;

        try {
            const isBookmarked = await bookmarksApi.isBookmarked(
                user.id,
                postId ? 'post' : 'project',
                postId || projectId
            );
            setBookmarked(isBookmarked);
        } catch (err) {
            console.error('Failed to check bookmark status:', err);
        }
    };

    const handleBookmark = async (e) => {
        e.stopPropagation();

        if (!user) {
            alert('북마크하려면 로그인이 필요합니다.');
            return;
        }

        if (loading) return;

        try {
            setLoading(true);

            await bookmarksApi.toggle(
                user.id,
                postId ? 'post' : 'project',
                postId || projectId
            );

            setBookmarked(!bookmarked);
        } catch (err) {
            console.error('Failed to toggle bookmark:', err);
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
            onClick={handleBookmark}
            disabled={loading}
            className={`rounded-lg transition-all ${sizeClasses[size]} ${
                bookmarked
                    ? 'text-primary hover:text-primary-light'
                    : 'text-gray-500 hover:text-primary'
            } disabled:opacity-50`}
            title={bookmarked ? '북마크 해제' : '북마크'}
        >
            <Bookmark
                size={iconSizes[size]}
                className={`transition-transform ${loading ? 'animate-pulse' : ''} ${bookmarked ? 'fill-current' : ''}`}
            />
        </button>
    );
};

export default BookmarkButton;
