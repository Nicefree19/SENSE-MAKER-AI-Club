import React from 'react';
import SEO from '../components/SEO';

const Blog = () => {
    return (
        <div className="pt-20 min-h-screen bg-dark-bg text-white">
            <SEO
                title="기술 블로그"
                description="구조 엔지니어링과 AI에 관한 최신 기술 노트와 기사를 읽어보세요."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold mb-8">기술 노트 & 블로그</h1>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {/* Placeholder for blog posts */}
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="bg-dark-surface rounded-xl overflow-hidden border border-white/5 hover:border-accent/30 transition-all">
                            <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20" />
                            <div className="p-6">
                                <span className="text-accent text-sm font-medium">Tech Stack</span>
                                <h3 className="text-xl font-bold mt-2 mb-3">구조 해석에 AI 적용하기</h3>
                                <p className="text-gray-400 text-sm mb-4">
                                    구조적 거동을 예측하는 머신러닝 모델의 가능성을 탐구합니다...
                                </p>
                                <button className="text-primary-light hover:text-white text-sm font-medium">더 읽기 →</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
