import React, { useState } from 'react';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';

const ProjectEditor = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'Planning',
        techStack: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('프로젝트가 저장되었습니다! (데모)');
        // Will connect to Supabase later
    };

    return (
        <MemberLayout>
            <SEO title="새 프로젝트" description="새로운 프로젝트를 등록합니다." />

            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold text-white mb-8">새 프로젝트 등록</h1>

                <form onSubmit={handleSubmit} className="bg-dark-surface p-8 rounded-xl border border-white/5 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">프로젝트 명</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="예: 구조 해석 자동화 시스템"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">상태</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
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
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">설명</label>
                        <textarea
                            rows="6"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="프로젝트에 대한 상세 설명을 입력하세요..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" className="px-6 py-3 rounded-lg text-gray-400 hover:text-white transition-colors">
                            취소
                        </button>
                        <button type="submit" className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-primary/25">
                            프로젝트 저장
                        </button>
                    </div>
                </form>
            </div>
        </MemberLayout>
    );
};

export default ProjectEditor;
