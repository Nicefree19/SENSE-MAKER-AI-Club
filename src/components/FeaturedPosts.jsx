import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, User, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { postsApi } from '../lib/database';

const FeaturedPosts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            // Fetch latest 3 published posts
            const response = await postsApi.getPublished({ limit: 3 });
            setPosts(response?.data || []);
        } catch (err) {
            console.error('Error loading featured posts:', err);
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

    if (loading || posts.length === 0) return null;

    return (
        <section className="py-20 bg-dark-bg relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-accent font-medium tracking-wider text-sm"
                        >
                            LATEST INSIGHTS
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-bold text-white mt-2"
                        >
                            기술 블로그 & 인사이트
                        </motion.h2>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link
                            to="/blog"
                            className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                        >
                            전체 보기
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {posts.map((post, index) => (
                        <motion.article
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-dark-surface rounded-xl overflow-hidden border border-white/5 hover:border-primary/30 transition-all hover:-translate-y-2 duration-300"
                        >
                            <Link to={`/blog`} onClick={() => setTimeout(() => document.getElementById(post.id)?.scrollIntoView(), 100)}>
                                <div className="h-48 overflow-hidden relative">
                                    {post.image_url ? (
                                        <img
                                            src={post.image_url}
                                            alt={post.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                            <span className="text-gray-600 text-4xl font-bold opacity-20">BLOG</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-surface to-transparent opacity-60"></div>

                                    {post.tags && post.tags.length > 0 && (
                                        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                                            <span className="px-2 py-1 bg-black/50 backdrop-blur-sm text-xs text-white rounded border border-white/10 flex items-center gap-1">
                                                <Tag size={10} className="text-accent" />
                                                {post.tags[0]}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {formatDate(post.created_at)}
                                        </span>
                                        {post.profiles && (
                                            <span className="flex items-center gap-1">
                                                <User size={12} />
                                                {post.profiles.full_name}
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>

                                    <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                                        {post.subtitle || post.content?.slice(0, 100).replace(/[#*`]/g, '') + '...'}
                                    </p>

                                    <div className="flex items-center text-primary text-sm font-medium">
                                        Read More
                                        <ArrowRight size={16} className="ml-2 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>
                        </motion.article>
                    ))}
                </div>

                <div className="mt-8 text-center md:hidden">
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        전체 보기
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedPosts;
