import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';
import { projectsApi } from '../../lib/database';
import { Save, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const ProjectEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Planning',
        techStack: '',
        githubUrl: '',
        demoUrl: '',
        modelUrl: ''
    });

    useEffect(() => {
        if (id) {
            loadProject(id);
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
                modelUrl: data.model_url || ''
            });
        } catch (err) {
            setError('프로젝트를 불러오는데 실패했습니다: ' + err.message);
        } finally {
            setInitialLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!formData.title.trim()) {
                throw new Error('프로젝트 명을 입력해주세요.');
            }

            if (isEdit) {
                await projectsApi.update(id, formData);
            } else {
                await projectsApi.create(formData);
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

    const handleCancel = () => {
        navigate('/member/dashboard');
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
            <SEO
                title={isEdit ? "프로젝트 수정" : "새 프로젝트"}
                description={isEdit ? "프로젝트를 수정합니다." : "새로운 프로젝트를 등록합니다."}
            />

            <div className="max-w-3xl mx-auto">
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    대시보드로 돌아가기
                </button>

                <h1 className="text-3xl font-bold text-white mb-8">
                    {isEdit ? '프로젝트 수정' : '새 프로젝트 등록'}
                </h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-400">
                        <CheckCircle size={20} />
                        <span>프로젝트가 성공적으로 {isEdit ? '수정' : '저장'}되었습니다! 대시보드로 이동합니다...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-dark-surface p-8 rounded-xl border border-white/5 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            프로젝트 명 <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="예: 구조 해석 자동화 시스템"
                            disabled={loading || success}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">상태</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            disabled={loading || success}
                        >
                            <option value="Planning">기획 단계</option>
                            <option value="In Progress">진행 중</option>
                            <option value="Completed">완료됨</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">기술 스택 (쉼표로 구분)</label>
                        <input
                            type="text"
                            value={formData.techStack}
                            onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="React, Python, TensorFlow..."
                            disabled={loading || success}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">3D 모델 URL (.gltf, .glb)</label>
                        <input
                            type="url"
                            value={formData.modelUrl}
                            onChange={(e) => setFormData({ ...formData, modelUrl: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="https://example.com/model.glb"
                            disabled={loading || success}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">GitHub URL</label>
                            <input
                                type="url"
                                value={formData.githubUrl}
                                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="https://github.com/..."
                                disabled={loading || success}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Demo URL</label>
                            <input
                                type="url"
                                value={formData.demoUrl}
                                onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="https://demo.example.com"
                                disabled={loading || success}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">설명</label>
                        <textarea
                            rows="6"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="프로젝트에 대한 상세 설명을 입력하세요..."
                            disabled={loading || success}
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 rounded-lg text-gray-400 hover:text-white transition-colors"
                            disabled={loading}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    {isEdit ? '수정 중...' : '저장 중...'}
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    {isEdit ? '프로젝트 수정' : '프로젝트 저장'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </MemberLayout>
    );
};

export default ProjectEditor;
