import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { commentsApi } from '../lib/database';
import {
    MessageCircle,
    Send,
    Trash2,
    Edit2,
    CornerDownRight,
    Loader2,
    User,
    X,
    Check
} from 'lucide-react';

const Comments = ({ postId = null, projectId = null }) => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        checkUser();
        loadComments();
    }, [postId, projectId]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const loadComments = async () => {
        try {
            setLoading(true);
            const data = await commentsApi.getByTarget(
                postId ? 'post' : 'project',
                postId || projectId
            );
            setComments(data || []);
        } catch (err) {
            console.error('Failed to load comments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !user) return;

        try {
            setSubmitting(true);
            const commentData = {
                content: newComment.trim(),
                authorId: user.id,
                postId,
                projectId,
                parentId: replyTo?.id || null
            };

            const created = await commentsApi.create(commentData);

            if (replyTo) {
                // Add reply to parent comment's replies
                setComments(comments.map(c => {
                    if (c.id === replyTo.id) {
                        return {
                            ...c,
                            replies: [...(c.replies || []), created]
                        };
                    }
                    return c;
                }));
            } else {
                setComments([created, ...comments]);
            }

            setNewComment('');
            setReplyTo(null);
        } catch (err) {
            console.error('Failed to submit comment:', err);
            alert('댓글 작성에 실패했습니다.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = async (commentId) => {
        if (!editContent.trim()) return;

        try {
            await commentsApi.update(commentId, editContent.trim());

            const updateComments = (items) => items.map(c => {
                if (c.id === commentId) {
                    return { ...c, content: editContent.trim() };
                }
                if (c.replies) {
                    return { ...c, replies: updateComments(c.replies) };
                }
                return c;
            });

            setComments(updateComments(comments));
            setEditingId(null);
            setEditContent('');
        } catch (err) {
            console.error('Failed to update comment:', err);
        }
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('정말 이 댓글을 삭제하시겠습니까?')) return;

        try {
            await commentsApi.delete(commentId);

            const removeComment = (items) => items.filter(c => {
                if (c.id === commentId) return false;
                if (c.replies) {
                    c.replies = removeComment(c.replies);
                }
                return true;
            });

            setComments(removeComment(comments));
        } catch (err) {
            console.error('Failed to delete comment:', err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = (now - date) / 1000;

        if (diff < 60) return '방금 전';
        if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`;

        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const CommentItem = ({ comment, isReply = false }) => {
        const isOwner = user?.id === comment.author_id;
        const isEditing = editingId === comment.id;

        return (
            <div className={`${isReply ? 'ml-8 mt-3' : ''}`}>
                <div className={`p-4 rounded-lg ${isReply ? 'bg-white/3' : 'bg-dark-surface'} border border-white/5`}>
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            {comment.profiles?.avatar_url ? (
                                <img
                                    src={comment.profiles.avatar_url}
                                    alt={comment.profiles.full_name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            ) : (
                                <User size={14} className="text-primary" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white text-sm">
                                    {comment.profiles?.full_name || '익명'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatDate(comment.created_at)}
                                </span>
                            </div>

                            {/* Content */}
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="flex-1 bg-dark-bg border border-white/10 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleEdit(comment.id)}
                                        className="p-1.5 text-green-400 hover:text-green-300"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditContent('');
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-300 text-sm whitespace-pre-wrap">
                                    {comment.content}
                                </p>
                            )}

                            {/* Actions */}
                            {!isEditing && (
                                <div className="flex items-center gap-3 mt-2">
                                    {user && !isReply && (
                                        <button
                                            onClick={() => setReplyTo(comment)}
                                            className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                                        >
                                            <CornerDownRight size={12} />
                                            답글
                                        </button>
                                    )}
                                    {isOwner && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditingId(comment.id);
                                                    setEditContent(comment.content);
                                                }}
                                                className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                                            >
                                                <Edit2 size={12} />
                                                수정
                                            </button>
                                            <button
                                                onClick={() => handleDelete(comment.id)}
                                                className="text-xs text-gray-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                            >
                                                <Trash2 size={12} />
                                                삭제
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="space-y-2">
                        {comment.replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} isReply={true} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <MessageCircle size={20} />
                댓글 {comments.length > 0 && `(${comments.length})`}
            </h3>

            {/* Comment Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    {replyTo && (
                        <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                            <CornerDownRight size={14} />
                            <span>{replyTo.profiles?.full_name || '익명'}님에게 답글</span>
                            <button
                                type="button"
                                onClick={() => setReplyTo(null)}
                                className="text-gray-500 hover:text-white"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    )}
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyTo ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
                            className="flex-1 bg-dark-surface border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!newComment.trim() || submitting}
                            className="bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Send size={20} />
                            )}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-6 p-4 bg-dark-surface rounded-lg text-center">
                    <p className="text-gray-400">댓글을 작성하려면 <a href="/member/login" className="text-primary hover:underline">로그인</a>이 필요합니다.</p>
                </div>
            )}

            {/* Comments List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={32} className="animate-spin text-primary" />
                </div>
            ) : comments.length === 0 ? (
                <div className="text-center py-12">
                    <MessageCircle size={40} className="mx-auto text-gray-600 mb-3" />
                    <p className="text-gray-500">아직 댓글이 없습니다.</p>
                    <p className="text-gray-600 text-sm mt-1">첫 번째 댓글을 남겨보세요!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <CommentItem key={comment.id} comment={comment} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Comments;
