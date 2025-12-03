import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import SEO from '../components/SEO';
import { projectsApi } from '../lib/database';
import { Loader2, ArrowLeft, Calendar, Github, ExternalLink, Code, Users, Box } from 'lucide-react';
import ModelViewer from '../components/ModelViewer';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadProject();
    }, [id]);

    const loadProject = async () => {
        try {
            setLoading(true);
            const data = await projectsApi.getById(id);
            setProject(data);
        } catch (err) {
            console.error('Error loading project:', err);
            setError('프로젝트를 불러올 수 없습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center text-white">
                <p className="text-xl text-red-400 mb-4">{error || '프로젝트를 찾을 수 없습니다.'}</p>
                <button
                    onClick={() => navigate('/projects')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="pt-20 min-h-screen bg-dark-bg text-white">
            <SEO
                title={project.title}
                description={project.description?.slice(0, 160) || '프로젝트 상세 정보'}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <button
                    onClick={() => navigate('/projects')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    목록으로 돌아가기
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                        {project.profiles && (
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Users size={16} className="text-primary" />
                                </div>
                                <span>{project.profiles.full_name || '익명'}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${project.status === 'Completed' ? 'text-green-400 bg-green-400/10' :
                                project.status === 'In Progress' ? 'text-accent bg-accent/10' :
                                    'text-yellow-400 bg-yellow-400/10'
                            }`}>
                            {project.status}
                        </span>
                    </div>
                </div>

                {/* Tech Stack */}
                {project.tech_stack && project.tech_stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {project.tech_stack.map((tech, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-300 flex items-center gap-2 border border-white/10"
                            >
                                <Code size={14} />
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                {/* Links */}
                <div className="flex gap-4 mb-12">
                    {project.github_url && (
                        <a
                            href={project.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[#24292e] hover:bg-[#2f363d] rounded-lg transition-colors"
                        >
                            <Github size={20} />
                            GitHub
                        </a>
                    )}
                    {project.demo_url && (
                        <a
                            href={project.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg transition-colors"
                        >
                            <ExternalLink size={20} />
                            Live Demo
                        </a>
                    )}
                </div>

                {/* 3D Model Viewer */}
                {project.model_url && (
                    <div className="mb-12 bg-dark-surface rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center gap-2">
                            <Box size={20} className="text-accent" />
                            <h3 className="font-bold">3D Structure View</h3>
                        </div>
                        <div className="h-[500px] bg-gray-900">
                            <ModelViewer modelUrl={project.model_url} />
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="bg-dark-surface p-8 rounded-xl border border-white/5" data-color-mode="dark">
                    <MDEditor.Markdown
                        source={project.description}
                        style={{ backgroundColor: 'transparent', color: '#e5e7eb' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
