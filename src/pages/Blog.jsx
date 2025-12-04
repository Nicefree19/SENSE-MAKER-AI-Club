import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import SEO from '../components/SEO';
import { postsApi } from '../lib/database';
import { Loader2, FileText, Calendar, User, Tag, Search, Filter, ChevronLeft, ChevronRight, X, Eye, Heart, MessageCircle } from 'lucide-react';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);

    // Search & Filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9;

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const response = await postsApi.getPublished();
            setPosts(response?.data || []);
        } catch (err) {
            console.error('Error loading posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get all unique tags for filter
    const allTags = useMemo(() => {
        const tags = new Set();
        posts.forEach(post => {
            post.tags?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [posts]);

    // Filter posts
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            // Search filter
            const searchLower = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                post.title?.toLowerCase().includes(searchLower) ||
                post.content?.toLowerCase().includes(searchLower) ||
                post.tags?.some(tag => tag.toLowerCase().includes(searchLower));

            // Tag filter
            const matchesTag = !selectedTag ||
                post.tags?.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());

            return matchesSearch && matchesTag;
        });
    }, [posts, searchQuery, selectedTag]);

    // Pagination
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
    const paginatedPosts = filteredPosts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedTag]);

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

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedTag('');
    };

    const hasActiveFilters = searchQuery || selectedTag;

    const handleTagClick = (tag, e) => {
        e.stopPropagation();
        setSelectedTag(tag);
        setShowFilters(true);
    };

    return (
        <div className="pt-20 min-h-screen bg-dark-bg text-white">
            <SEO
                title="기술 블로그"
                description="구조 엔지니어링과 AI에 관한 최신 기술 노트와 기사를 읽어보세요."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold mb-4">기술 노트 & 블로그</h1>
                <p className="text-gray-400 mb-8 max-w-3xl">
                    SENSE MAKER 멤버들이 공유하는 기술 인사이트, 프로젝트 경험, 그리고 AI/자동화 관련 지식을 만나보세요.
                </p>

                {/* Search & Filter Section */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="블로그 검색..."
                                className="w-full bg-dark-surface border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        {/* Filter Toggle Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${showFilters || hasActiveFilters
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-dark-surface border-white/10 text-gray-400 hover:text-white'
                                }`}
                        >
                            <Filter size={18} />
                            필터
                            {hasActiveFilters && (
                                <span className="w-2 h-2 rounded-full bg-primary"></span>
                            )}
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-dark-surface rounded-lg border border-white/10 p-4"
                        >
                            <div className="flex flex-wrap items-end gap-4">
                                {/* Tag Filter */}
                                <div className="flex-1 min-w-[200px]">
                                    <label className="block text-sm font-medium text-gray-400 mb-2">태그</label>
                                    <select
                                        value={selectedTag}
                                        onChange={(e) => setSelectedTag(e.target.value)}
                                        className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                                    >
                                        <option value="">전체</option>
                                        {allTags.map(tag => (
                                            <option key={tag} value={tag}>{tag}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Popular Tags */}
                                {allTags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {allTags.slice(0, 5).map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                                                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${selectedTag === tag
                                                        ? 'bg-primary text-white'
                                                        : 'bg-white/5 text-gray-400 hover:text-white'
                                                    }`}
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Clear Filters */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        필터 초기화
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Results Count */}
                    {!loading && (
                        <p className="text-sm text-gray-500">
                            {filteredPosts.length}개의 글
                            {hasActiveFilters && ` (전체 ${posts.length}개 중)`}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400">블로그 글을 불러오는 중 오류가 발생했습니다.</p>
                    </div>
                ) : paginatedPosts.length === 0 ? (
                    <div className="text-center py-20">
                        <FileText size={60} className="mx-auto text-gray-600 mb-4" />
                        {hasActiveFilters ? (
                            <>
                                <p className="text-gray-400 text-lg">검색 결과가 없습니다.</p>
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 text-primary hover:text-primary-light"
                                >
                                    필터 초기화
                                </button>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-400 text-lg">아직 발행된 글이 없습니다.</p>
                                <p className="text-gray-500 text-sm mt-2">멤버로 로그인하여 첫 글을 작성해보세요!</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {paginatedPosts.map((post, index) => (
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
                                                    <button
                                                        key={i}
                                                        onClick={(e) => handleTagClick(tag, e)}
                                                        className="text-accent text-xs font-medium flex items-center gap-1 hover:text-accent-light transition-colors"
                                                    >
                                                        <Tag size={10} />
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <h3 className="text-xl font-bold mb-3 text-white hover:text-accent transition-colors">
                                            {post.title}
                                        </h3>

                                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                            {getPreview(post.content)}
                                        </p>

                                        {/* Stats */}
                                        <div className="flex items-center gap-4 text-gray-500 text-xs mb-4">
                                            {post.view_count > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <Eye size={12} />
                                                    {post.view_count}
                                                </span>
                                            )}
                                        </div>

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

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-12">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg bg-dark-surface border border-white/10 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${currentPage === page
                                                ? 'bg-primary text-white'
                                                : 'bg-dark-surface border border-white/10 text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg bg-dark-surface border border-white/10 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </>
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
                                        {selectedPost.view_count > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Eye size={14} />
                                                {selectedPost.view_count}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedPost(null)}
                                    className="p-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="prose prose-invert max-w-none">
                                <ReactMarkdown className="text-gray-300 leading-relaxed">
                                    {selectedPost.content}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Blog;
