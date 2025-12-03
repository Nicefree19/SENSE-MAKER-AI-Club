import React from 'react';
import { motion } from 'framer-motion';
import { Layers, MessageSquare, FileCheck, Calculator } from 'lucide-react';

const FeaturedProjects = () => {
    const projects = [
        {
            title: 'ADS (벽체 강성 자동화)',
            icon: <Layers size={32} className="text-accent" />,
            description: '일반 모델링 및 철근 정보 입력 자동화 시스템.',
            status: '개발 중'
        },
        {
            title: '현장 대응 챗봇',
            icon: <MessageSquare size={32} className="text-accent" />,
            description: 'LLM 기반 실시간 현장 질의응답 처리.',
            status: '프로토타입'
        },
        {
            title: '구조도서 검증 도구',
            icon: <FileCheck size={32} className="text-accent" />,
            description: '구조 도면 및 기준 자동 검토 시스템.',
            status: '기획 단계'
        },
        {
            title: '공사비 산출 자동화',
            icon: <Calculator size={32} className="text-accent" />,
            description: '물량 산출 및 공사비 내역서 자동 생성.',
            status: '컨셉 단계'
        }
    ];

    return (
        <section className="py-20 bg-dark-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">주요 프로젝트</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        현재 개발 중인 최첨단 구조 엔지니어링 도구들을 소개합니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {projects.map((project, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -10 }}
                            className="bg-dark-surface p-6 rounded-xl border border-white/5 hover:border-accent/50 transition-all duration-300"
                        >
                            <div className="mb-4 p-3 bg-white/5 rounded-lg w-fit">
                                {project.icon}
                            </div>
                            <h3 className="text-lg font-bold text-white mb-2">{project.title}</h3>
                            <p className="text-gray-400 text-sm mb-4">{project.description}</p>
                            <span className="inline-block px-3 py-1 text-xs font-medium text-accent-glow bg-accent/10 rounded-full">
                                {project.status}
                            </span>
                        </motion.div>
                    ))}
                </div>
                <p className="text-right text-xs text-gray-600 mt-8">[Source: 50]</p>
            </div>
        </section>
    );
};

export default FeaturedProjects;
