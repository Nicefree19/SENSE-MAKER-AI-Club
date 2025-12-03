import React from 'react';
import FeaturedProjects from '../components/FeaturedProjects';
import SEO from '../components/SEO';

const Projects = () => {
    return (
        <div className="pt-20 min-h-screen bg-dark-bg text-white">
            <SEO
                title="프로젝트"
                description="AI, 자동화, 구조 엔지니어링 분야의 최신 프로젝트를 확인하세요."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold mb-8">프로젝트</h1>
                <p className="text-gray-400 mb-12 max-w-3xl">
                    우리는 실제 구조 엔지니어링 문제를 해결하는 도구를 적극적으로 개발하고 있습니다.
                    자동화된 설계 시스템부터 현장 품질 검증 도구까지, 우리의 프로젝트는 효율성과 안전성을 높이는 것을 목표로 합니다.
                </p>
                <FeaturedProjects />
            </div>
        </div>
    );
};

export default Projects;
