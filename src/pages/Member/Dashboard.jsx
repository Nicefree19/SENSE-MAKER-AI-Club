import React from 'react';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';
import { Folder, FileText, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const MemberDashboard = () => {
    // Mock data - will be replaced by Supabase data later
    const myProjects = [
        { id: 1, title: '구조 해석 자동화 v1', status: '진행 중', date: '2025-12-01' },
        { id: 2, title: '현장 모니터링 앱', status: '기획 단계', date: '2025-11-20' },
    ];

    const myPosts = [
        { id: 1, title: 'React와 Three.js를 활용한 시각화', date: '2025-12-02' },
    ];

    return (
        <MemberLayout>
            <SEO title="멤버 대시보드" description="나의 활동 내역을 관리합니다." />

            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">내 대시보드</h1>
                    <p className="text-gray-400 mt-2">오늘도 멋진 아이디어를 실현해보세요!</p>
                </div>
                <div className="space-x-4">
                    <Link to="/member/projects/new" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        + 새 프로젝트
                    </Link>
                    <Link to="/member/posts/new" className="bg-dark-surface border border-white/20 hover:bg-white/5 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        + 새 글 쓰기
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* My Projects Section */}
                <div className="bg-dark-surface rounded-xl border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Folder size={20} className="text-accent" />
                            내 프로젝트
                        </h2>
                        <Link to="/member/projects" className="text-sm text-gray-400 hover:text-white">전체 보기</Link>
                    </div>

                    <div className="space-y-4">
                        {myProjects.length > 0 ? (
                            myProjects.map((project) => (
                                <div key={project.id} className="p-4 bg-dark-bg rounded-lg border border-white/5 hover:border-accent/30 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-accent transition-colors">{project.title}</h3>
                                            <span className="text-xs text-gray-500 mt-1 inline-block">{project.date}</span>
                                        </div>
                                        <span className="px-2 py-1 rounded text-xs font-medium bg-primary/10 text-primary-light">
                                            {project.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">아직 등록된 프로젝트가 없습니다.</p>
                        )}
                    </div>
                </div>

                {/* My Posts Section */}
                <div className="bg-dark-surface rounded-xl border border-white/5 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText size={20} className="text-green-400" />
                            내 기술 블로그
                        </h2>
                        <Link to="/member/posts" className="text-sm text-gray-400 hover:text-white">전체 보기</Link>
                    </div>

                    <div className="space-y-4">
                        {myPosts.length > 0 ? (
                            myPosts.map((post) => (
                                <div key={post.id} className="p-4 bg-dark-bg rounded-lg border border-white/5 hover:border-green-400/30 transition-colors group">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-white group-hover:text-green-400 transition-colors">{post.title}</h3>
                                        <div className="flex items-center text-gray-500 text-xs">
                                            <Clock size={12} className="mr-1" />
                                            {post.date}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">작성한 글이 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
};

export default MemberDashboard;
