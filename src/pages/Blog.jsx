import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import { postsApi } from '../lib/database';
import { Loader2, FileText, Calendar, User, Tag } from 'lucide-react';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await postsApi.getPublished();
            setPosts(data || []);
        } catch (err) {
            console.error('Error loading posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Simple markdown preview (first 200 chars without markdown syntax)
    const getPreview = (content) => {
        if (!content) return '내용이 없습니다.';
        const plainText = content
            .replace(/#{1,6}\s?/g, '')
            .replace(/\*\*|__/g, '')
            .replace(/\*|_/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/`{1,3}[^`]*`{1,3}/g, '')
            .replace(/\n/g, ' ')
            .trim();
        return plainText.length > 150 ? plainText.slice(0, 150) + '...' : plainText;
    };

    return (
        <div className="pt-20 min-h-screen bg-dark-bg text-white">
            <SEO
                title="기술 블로그"
                description="구조 엔지니어링과 AI에 관한 최신 기술 노트와 기사를 읽어보세요."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold mb-4">기술 노트 & 블로그</h1>
                <p className="text-gray-400 mb-12 max-w-3xl">
                    SENSE MAKER 멤버들이 공유하는 기술 인사이트, 프로젝트 경험, 그리고 AI/자동화 관련 지식을 만나보세요.
                </p>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400">블로그 글을 불러오는 중 오류가 발생했습니다.</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText size={60} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg">아직 발행된 글이 없습니다.</p>
                        <p className="text-gray-500 text-sm mt-2">멤버로 로그인하여 첫 글을 작성해보세요!</p>
                    </div>
                ) : (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {posts.map((post, index) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-dark-surface rounded-xl overflow-hidden border border-white/5 hover:border-accent/30 transition-all cursor-pointer"
                                onClick={() => setSelectedPost(post)}
                            >
                                {/* Post Header Image */}
                                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                    <FileText size={40} className="text-primary/50" />
                                </div>

                                <div className="p-6">
                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {post.tags.slice(0, 2).map((tag, i) => (
                                                <span key={i} className="text-accent text-xs font-medium flex items-center gap-1">
                                                    <Tag size={10} />
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <h3 className="text-xl font-bold mb-3 text-white hover:text-accent transition-colors">
                                        {post.title}
                                    </h3>

                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                        {getPreview(post.content)}
                                    </p>

                                    {/* Meta Info */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        {post.profiles && (
                                            <div className="flex items-center gap-2">
                                                <User size={14} className="text-gray-500" />
                                                <span className="text-sm text-gray-500">
                                                    {post.profiles.full_name || '익명'}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                                            <Calendar size={12} />
                                            {formatDate(post.created_at)}
                                        </div>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                )}
            </div>

            {/* Post Modal */}
            {selectedPost && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPost(null)}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-dark-surface rounded-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    {selectedPost.tags && selectedPost.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {selectedPost.tags.map((tag, i) => (
                                                <span key={i} className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <h2 className="text-3xl font-bold text-white">{selectedPost.title}</h2>
                                    <div className="flex items-center gap-4 mt-3 text-gray-500 text-sm">
                                        {selectedPost.profiles && (
                                            <span>{selectedPost.profiles.full_name || '익명'}</span>
                                        )}
                                        <span>{formatDate(selectedPost.created_at)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="text-gray-400 hover:text-white text-2xl"
                                >
                                    &times;
                                </button>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {selectedPost.content}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Blog;
