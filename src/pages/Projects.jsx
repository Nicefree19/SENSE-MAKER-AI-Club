import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import { projectsApi } from '../lib/database';
import { Loader2, Layers, Code, Users, Box, X } from 'lucide-react';
import ModelViewer from '../components/ModelViewer';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedModel, setSelectedModel] = useState(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const result = await projectsApi.getAll();
            // API returns { data, count, page, limit, totalPages }
            setProjects(result?.data || []);
        } catch (err) {
            console.error('Error loading projects:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'Planning': '기획 단계',
            'In Progress': '진행 중',
            'Completed': '완료됨'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            'Planning': 'text-yellow-400 bg-yellow-400/10',
            'In Progress': 'text-accent bg-accent/10',
            'Completed': 'text-green-400 bg-green-400/10'
        };
        return colors[status] || 'text-gray-400 bg-gray-400/10';
    };

    return (
        <div className="pt-20 min-h-screen bg-dark-bg text-white">
            <SEO
                title="프로젝트"
                description="AI, 자동화, 구조 엔지니어링 분야의 최신 프로젝트를 확인하세요."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold mb-4">프로젝트</h1>
                <p className="text-gray-400 mb-12 max-w-3xl">
                    우리는 실제 구조 엔지니어링 문제를 해결하는 도구를 적극적으로 개발하고 있습니다.
                    자동화된 설계 시스템부터 현장 품질 검증 도구까지, 우리의 프로젝트는 효율성과 안전성을 높이는 것을 목표로 합니다.
                </p>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-20">
                        <p className="text-red-400">프로젝트를 불러오는 중 오류가 발생했습니다.</p>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="text-center py-20">
                        <Layers size={60} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400 text-lg">아직 등록된 프로젝트가 없습니다.</p>
                        <p className="text-gray-500 text-sm mt-2">멤버로 로그인하여 첫 프로젝트를 등록해보세요!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project, index) => (
                            <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-dark-surface rounded-xl border border-white/5 hover:border-accent/30 transition-all overflow-hidden flex flex-col"
                            >
                                {/* Project Header */}
                                <div className="h-32 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative group">
                                    <Layers size={40} className="text-accent/50 group-hover:scale-110 transition-transform duration-300" />
                                    {project.model_url && (
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                <Box size={12} /> 3D Model
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Project Content */}
                                <div className="p-6 flex-1 flex flex-col cursor-pointer" onClick={() => window.location.hash = `#/projects/${project.id}`}>
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl font-bold text-white hover:text-primary transition-colors">{project.title}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(project.status)}`}>
                                            {getStatusLabel(project.status)}
                                        </span>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 flex-1">
                                        {project.description ? project.description.replace(/[#*`]/g, '') : '프로젝트 설명이 없습니다.'}
                                    </p>

                                    {/* Tech Stack */}
                                    {project.tech_stack && project.tech_stack.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {project.tech_stack.map((tech, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 flex items-center gap-1"
                                                >
                                                    <Code size={12} />
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                        {project.profiles && (
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                    <Users size={12} className="text-primary" />
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {project.profiles.full_name || '익명'}
                                                </span>
                                            </div>
                                        )}

                                        {project.model_url && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedModel(project);
                                                }}
                                                className="flex items-center gap-1 text-sm text-accent hover:text-white transition-colors"
                                            >
                                                <Box size={16} />
                                                3D 보기
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* 3D Model Modal */}
            <AnimatePresence>
                {selectedModel && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
                        onClick={() => setSelectedModel(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-dark-surface w-full max-w-4xl rounded-xl overflow-hidden border border-white/10 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Box size={20} className="text-accent" />
                                    {selectedModel.title} - 3D View
                                </h3>
                                <button
                                    onClick={() => setSelectedModel(null)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="h-[60vh] bg-gray-900">
                                <ModelViewer modelUrl={selectedModel.model_url} />
                            </div>
                            <div className="p-4 bg-dark-bg text-sm text-gray-400 text-center">
                                마우스로 모델을 회전하고 확대/축소할 수 있습니다.
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Projects;
