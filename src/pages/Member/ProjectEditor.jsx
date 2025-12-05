import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';
import { projectsApi } from '../../lib/database';
import { supabase } from '../../lib/supabase';
import { Save, Loader2, AlertCircle, CheckCircle, ArrowLeft, Users, Image as ImageIcon, Box, Layout, Palette, Github, ExternalLink, Code } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import ImageUploader from '../../components/ImageUploader';
import ProjectTeamManager from '../../components/ProjectTeamManager';
import TagInput from '../../components/TagInput';
import { motion } from 'framer-motion';

const ProjectEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState('basic'); // basic, media, design, content

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Planning',
        techStack: '',
        githubUrl: '',
        demoUrl: '',
        modelUrl: '',
        layoutConfig: {
            theme: 'default',
            layout: 'standard',
            showTeam: true
        }
    });
    const [authorId, setAuthorId] = useState(null);

    useEffect(() => {
        if (id) {
            loadProject(id);
        } else {
            supabase.auth.getUser().then(({ data: { user } }) => {
                if (user) setAuthorId(user.id);
            });
        }
    }, [id]);

    const loadProject = async (projectId) => {
        try {
            setInitialLoading(true);
            const data = await projectsApi.getById(projectId);
            setFormData({
                title: data.title || '',
                description: data.description || '',
                status: data.status || 'Planning',
                techStack: data.tech_stack?.join(', ') || '',
                githubUrl: data.github_url || '',
                demoUrl: data.demo_url || '',
                modelUrl: data.model_url || '',
                layoutConfig: data.layout_config || { theme: 'default', layout: 'standard', showTeam: true }
            });
            setAuthorId(data.author_id);
        } catch (err) {
            setError('프로젝트를 불러오는데 실패했습니다: ' + err.message);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e, published = true) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!formData.title.trim()) throw new Error('프로젝트 명을 입력해주세요.');

            const projectData = { ...formData, published };

            if (isEdit) {
                await projectsApi.update(id, projectData);
            } else {
                await projectsApi.create(projectData);
            }

            setSuccess(true);
            setTimeout(() => {
                navigate('/member/dashboard');
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const getThemeColor = (theme) => {
        switch (theme) {
            case 'blue': return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
            case 'purple': return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
            case 'green': return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
            default: return 'from-primary/20 to-accent/20 border-white/10';
        }
    };

    if (initialLoading) {
        return (
            <MemberLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 size={40} className="animate-spin text-primary" />
                </div>
            </MemberLayout>
        );
    }

    return (
        <MemberLayout>
            <SEO title={isEdit ? "프로젝트 수정" : "새 프로젝트"} description="프로젝트 정보를 관리합니다." />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <button onClick={() => navigate('/member/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-white mb-2 transition-colors">
                            <ArrowLeft size={20} /> 대시보드로 돌아가기
                        </button>
                        <h1 className="text-3xl font-bold text-white">
                            {isEdit ? '프로젝트 수정' : '새 프로젝트 등록'}
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSubmit(null, false)}
                            disabled={loading || success}
                            className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-white transition-colors disabled:opacity-50"
                        >
                            임시저장
                        </button>
                        <button
                            onClick={() => handleSubmit(null, true)}
                            disabled={loading || success}
                            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/25 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {isEdit ? '수정 완료' : '프로젝트 등록'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} /> <span>{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Navigation Tabs */}
                        <div className="flex border-b border-white/10 mb-6 overflow-x-auto">
                            {[
                                { id: 'basic', label: '기본 정보', icon: Box },
                                { id: 'media', label: '미디어 & 링크', icon: ImageIcon },
                                { id: 'design', label: '디자인 설정', icon: Palette },
                                { id: 'content', label: '상세 내용', icon: Layout },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                            ? 'border-primary text-primary'
                                            : 'border-transparent text-gray-400 hover:text-white'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="bg-dark-surface rounded-xl border border-white/5 p-6 min-h-[500px]">
                            {activeTab === 'basic' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">프로젝트 명 <span className="text-red-400">*</span></label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                                            placeholder="프로젝트 이름을 입력하세요"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">진행 상태</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['Planning', 'In Progress', 'Completed'].map(status => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, status })}
                                                    className={`py-3 rounded-lg border transition-all ${formData.status === status
                                                            ? 'bg-primary/20 border-primary text-primary'
                                                            : 'bg-dark-bg border-white/10 text-gray-400 hover:border-white/30'
                                                        }`}
                                                >
                                                    {status === 'Planning' && '기획 단계'}
                                                    {status === 'In Progress' && '진행 중'}
                                                    {status === 'Completed' && '완료됨'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">기술 스택</label>
                                        <TagInput
                                            value={formData.techStack}
                                            onChange={(val) => setFormData({ ...formData, techStack: val })}
                                            placeholder="React, Python, TensorFlow..."
                                        />
                                    </div>
                                    {isEdit && authorId && (
                                        <div className="pt-6 border-t border-white/10">
                                            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                                <Users size={20} className="text-purple-400" /> 팀원 관리
                                            </h3>
                                            <ProjectTeamManager projectId={id} authorId={authorId} />
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === 'media' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Repository</label>
                                        <div className="relative">
                                            <Github size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="url"
                                                value={formData.githubUrl}
                                                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                                className="w-full bg-dark-bg border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                                                placeholder="https://github.com/username/repo"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Live Demo URL</label>
                                        <div className="relative">
                                            <ExternalLink size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="url"
                                                value={formData.demoUrl}
                                                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                                                className="w-full bg-dark-bg border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                                                placeholder="https://my-project.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">3D Model URL (GLB/GLTF)</label>
                                        <div className="relative">
                                            <Box size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <input
                                                type="url"
                                                value={formData.modelUrl}
                                                onChange={(e) => setFormData({ ...formData, modelUrl: e.target.value })}
                                                className="w-full bg-dark-bg border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-primary focus:outline-none transition-colors"
                                                placeholder="https://models.com/my-model.glb"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'design' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-4">테마 색상</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {[
                                                { id: 'default', name: 'Dark Default', color: 'bg-gray-800' },
                                                { id: 'blue', name: 'Ocean Blue', color: 'bg-blue-600' },
                                                { id: 'purple', name: 'Neon Purple', color: 'bg-purple-600' },
                                                { id: 'green', name: 'Forest Green', color: 'bg-green-600' },
                                            ].map(theme => (
                                                <button
                                                    key={theme.id}
                                                    onClick={() => setFormData({ ...formData, layoutConfig: { ...formData.layoutConfig, theme: theme.id } })}
                                                    className={`relative p-4 rounded-xl border-2 transition-all overflow-hidden group ${formData.layoutConfig.theme === theme.id
                                                            ? 'border-primary bg-white/5'
                                                            : 'border-white/5 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className={`w-full h-12 rounded-lg mb-3 ${theme.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                                                    <span className="text-sm font-medium text-gray-300">{theme.name}</span>
                                                    {formData.layoutConfig.theme === theme.id && (
                                                        <div className="absolute top-2 right-2 text-primary">
                                                            <CheckCircle size={16} />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-4">레이아웃 스타일</label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[
                                                { id: 'standard', name: 'Standard', desc: '기본 카드형 레이아웃' },
                                                { id: 'full-width', name: 'Full Width', desc: '전체 너비 확장형' },
                                                { id: 'hero-image', name: 'Hero Image', desc: '이미지 강조형' },
                                            ].map(layout => (
                                                <button
                                                    key={layout.id}
                                                    onClick={() => setFormData({ ...formData, layoutConfig: { ...formData.layoutConfig, layout: layout.id } })}
                                                    className={`text-left p-4 rounded-xl border-2 transition-all ${formData.layoutConfig.layout === layout.id
                                                            ? 'border-primary bg-white/5'
                                                            : 'border-white/5 hover:border-white/20'
                                                        }`}
                                                >
                                                    <div className="mb-2">
                                                        <Layout size={24} className={formData.layoutConfig.layout === layout.id ? 'text-primary' : 'text-gray-500'} />
                                                    </div>
                                                    <div className="font-medium text-white">{layout.name}</div>
                                                    <div className="text-xs text-gray-500">{layout.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'content' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                    <div className="bg-dark-bg p-4 rounded-lg border border-white/10 mb-4">
                                        <p className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                                            <ImageIcon size={16} />
                                            이미지 업로드 (드래그 앤 드롭으로 본문에 자동 삽입)
                                        </p>
                                        <ImageUploader onUploadComplete={(url) => {
                                            const imageMarkdown = `![이미지 설명](${url})`;
                                            setFormData(prev => ({
                                                ...prev,
                                                description: prev.description ? prev.description + '\n' + imageMarkdown : imageMarkdown
                                            }));
                                        }} />
                                    </div>
                                    <div data-color-mode="dark">
                                        <MDEditor
                                            value={formData.description}
                                            onChange={(val) => setFormData({ ...formData, description: val })}
                                            height={500}
                                            style={{ backgroundColor: '#1E293B', color: '#fff' }}
                                            preview="edit"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Live Preview */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <h3 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">Live Preview</h3>

                            {/* Card Preview */}
                            <div className={`bg-dark-surface rounded-xl border overflow-hidden transition-all ${getThemeColor(formData.layoutConfig.theme)}`}>
                                <div className={`h-32 bg-gradient-to-br ${getThemeColor(formData.layoutConfig.theme).split(' ')[0]} flex items-center justify-center relative`}>
                                    <Box size={40} className="text-white/50" />
                                    {formData.modelUrl && (
                                        <div className="absolute top-2 right-2">
                                            <span className="bg-black/50 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                                                <Box size={12} /> 3D Model
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <h3 className="text-xl font-bold text-white line-clamp-1">
                                            {formData.title || '프로젝트 제목'}
                                        </h3>
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-white/10 text-gray-300">
                                            {formData.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3 min-h-[60px]">
                                        {formData.description
                                            ? formData.description.replace(/[#*`]/g, '').slice(0, 100)
                                            : '프로젝트 설명이 여기에 표시됩니다...'}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {formData.techStack ? formData.techStack.split(',').map((tech, i) => (
                                            <span key={i} className="px-2 py-1 bg-white/5 rounded text-xs text-gray-300 flex items-center gap-1">
                                                <Code size={12} /> {tech.trim()}
                                            </span>
                                        )) : (
                                            <span className="text-xs text-gray-600 italic">기술 스택 없음</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                                                <Users size={12} className="text-primary" />
                                            </div>
                                            <span className="text-sm text-gray-500">Author</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {formData.githubUrl && <Github size={16} className="text-gray-500" />}
                                            {formData.demoUrl && <ExternalLink size={16} className="text-gray-500" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-300">
                                <p className="flex items-center gap-2 mb-2 font-bold">
                                    <Layout size={16} />
                                    Tip
                                </p>
                                <p>
                                    선택한 <strong>{formData.layoutConfig.theme}</strong> 테마와
                                    <strong> {formData.layoutConfig.layout}</strong> 레이아웃이 적용된 미리보기입니다.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
};

export default ProjectEditor;
