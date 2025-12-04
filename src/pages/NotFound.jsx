import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => {
    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
            <SEO
                title="페이지를 찾을 수 없습니다"
                description="요청하신 페이지를 찾을 수 없습니다."
            />

            <div className="text-center max-w-lg">
                {/* 404 그래픽 */}
                <div className="relative mb-8">
                    <div className="text-[150px] font-bold text-slate-800/50 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary to-accent-glow rounded-full flex items-center justify-center animate-pulse">
                            <Search className="w-12 h-12 text-white" />
                        </div>
                    </div>
                </div>

                {/* 메시지 */}
                <h1 className="text-3xl font-bold text-white mb-4">
                    페이지를 찾을 수 없습니다
                </h1>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                    요청하신 페이지가 존재하지 않거나, 이동되었거나, 일시적으로 사용할 수 없습니다.
                    URL을 확인하거나 아래 링크를 이용해 주세요.
                </p>

                {/* 액션 버튼 */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-lg transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        홈으로 이동
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        이전 페이지
                    </button>
                </div>

                {/* 추천 링크 */}
                <div className="mt-12 pt-8 border-t border-slate-700/50">
                    <p className="text-slate-500 text-sm mb-4">자주 찾는 페이지</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Link
                            to="/projects"
                            className="text-sm text-slate-400 hover:text-primary transition-colors px-3 py-1 rounded-full bg-slate-800/50 hover:bg-slate-800"
                        >
                            프로젝트
                        </Link>
                        <Link
                            to="/blog"
                            className="text-sm text-slate-400 hover:text-primary transition-colors px-3 py-1 rounded-full bg-slate-800/50 hover:bg-slate-800"
                        >
                            블로그
                        </Link>
                        <Link
                            to="/members"
                            className="text-sm text-slate-400 hover:text-primary transition-colors px-3 py-1 rounded-full bg-slate-800/50 hover:bg-slate-800"
                        >
                            멤버
                        </Link>
                        <Link
                            to="/contact"
                            className="text-sm text-slate-400 hover:text-primary transition-colors px-3 py-1 rounded-full bg-slate-800/50 hover:bg-slate-800"
                        >
                            문의하기
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
