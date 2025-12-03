import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Settings, Smartphone } from 'lucide-react';

const Pillars = () => {
    const pillars = [
        {
            title: 'AI (인공지능)',
            icon: <Brain size={40} className="text-accent-glow" />,
            description: '확률적 추론 & 최적화',
            detail: '머신러닝을 활용한 최적의 구조 설계 및 의사결정 지원 시스템을 구축합니다.',
            cite: '[Source: 10]'
        },
        {
            title: 'Automation (자동화)',
            icon: <Settings size={40} className="text-accent-glow" />,
            description: '반복 업무 제거 & 생산성 향상',
            detail: '단순 반복적인 업무를 자동화하여 엔지니어가 창의적인 설계에 집중할 수 있도록 돕습니다.',
            cite: '[Source: 25]'
        },
        {
            title: 'Application (실용화)',
            icon: <Smartphone size={40} className="text-accent-glow" />,
            description: '현장 대응 & 품질 검증',
            detail: '현장에서 즉시 활용 가능한 도구와 도면 검증 시스템을 개발하여 실무 효율을 높입니다.',
            cite: '[Source: 31]'
        }
    ];

    return (
        <section className="py-20 bg-dark-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">핵심 가치 (Core Pillars)</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        SENSE MAKER는 세 가지 핵심 가치를 바탕으로 혁신을 주도합니다.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {pillars.map((pillar, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.05 }}
                            className="bg-dark-surface p-8 rounded-xl border border-white/5 hover:border-accent/50 transition-colors duration-300 shadow-lg hover:shadow-accent/10 group"
                        >
                            <div className="mb-6 p-4 bg-white/5 rounded-full w-fit group-hover:bg-accent/10 transition-colors duration-300">
                                {pillar.icon}
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">{pillar.title}</h3>
                            <p className="text-primary-light font-medium mb-2">{pillar.description}</p>
                            <p className="text-gray-400 text-sm mb-4">{pillar.detail}</p>
                            <span className="text-xs text-gray-600">{pillar.cite}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pillars;
