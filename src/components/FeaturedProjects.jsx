import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, MessageSquare, FileCheck, Calculator, ArrowRight, Box } from 'lucide-react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../lib/database';

const FeaturedProjects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            // Fetch latest 4 published projects
            const response = await projectsApi.getAll({ limit: 4, status: 'In Progress' });
            // If not enough 'In Progress', fallback to all published
            if (response.data.length < 4) {
                const allResponse = await projectsApi.getAll({ limit: 4 });
                setProjects(allResponse.data || []);
            } else {
                setProjects(response.data || []);
            }
        } catch (err) {
            console.error('Error loading featured projects:', err);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (title) => {
        if (title.includes('챗봇') || title.includes('LLM')) return <MessageSquare size={32} className="text-accent" />;
        if (title.includes('검증') || title.includes('검토')) return <FileCheck size={32} className="text-accent" />;
        if (title.includes('산출') || title.includes('내역')) return <Calculator size={32} className="text-accent" />;
        return <Layers size={32} className="text-accent" />;
    };

    if (loading) return null;

    return (
        <section className="py-20 bg-dark-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-accent font-medium tracking-wider text-sm"
                        >
                            INNOVATION LAB
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-3xl md:text-4xl font-bold text-white mt-2"
                        >
                            주요 프로젝트
                        </motion.h2>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                    >
                        <Link
                            to="/projects"
                            className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
                        >
                            전체 프로젝트 보기
                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                {projects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10 }}
                                className="bg-dark-surface p-6 rounded-xl border border-white/5 hover:border-accent/50 transition-all duration-300 group h-full flex flex-col"
                            >
                                <Link to={`/projects/${project.id}`} className="flex-1 flex flex-col">
                                    <div className="mb-4 p-3 bg-white/5 rounded-lg w-fit group-hover:bg-accent/10 transition-colors">
                                        {getIcon(project.title)}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                                        {project.title}
                                    </h3>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-2 flex-1">
                                        {project.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${project.status === 'Completed' ? 'bg-green-500/10 text-green-400' :
                                                project.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-gray-500/10 text-gray-400'
                                            }`}>
                                            {project.status === 'Completed' ? '완료됨' :
                                                project.status === 'In Progress' ? '진행 중' : '기획 단계'}
                                        </span>
                                        {project.model_url && (
                                            <Box size={16} className="text-gray-500" title="3D 모델 포함" />
                                        )}
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-dark-surface rounded-xl border border-white/5">
                        <p className="text-gray-400">등록된 프로젝트가 없습니다.</p>
                    </div>
                )}

                <div className="mt-8 text-center md:hidden">
                    <Link
                        to="/projects"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        전체 프로젝트 보기
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default FeaturedProjects;
