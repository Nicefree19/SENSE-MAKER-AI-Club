import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ProjectMatrix = () => {
    const [activeCell, setActiveCell] = useState(null);

    const columns = ['기본설계', '실시설계', 'VE제안', '시공', '유지관리'];
    const rows = [
        { name: 'AI (지능화)', color: 'text-primary-light' },
        { name: 'Automation (자동화)', color: 'text-accent-glow' },
        { name: 'Application (실용화)', color: 'text-green-400' }
    ];

    // Mock data for matrix cells
    const getCellContent = (row, col) => {
        // Simplify key matching by using partial strings or indices if needed, 
        // but here we map the exact Korean strings.
        const key = `${row}-${col}`;
        const contentMap = {
            'AI (지능화)-기본설계': '최적 구조 시스템 선정',
            'AI (지능화)-VE제안': '대안 공법 자동 제안',
            'Automation (자동화)-실시설계': '도면/모델링 자동화',
            'Automation (자동화)-시공': '물량 산출 자동화',
            'Application (실용화)-시공': '현장 이슈 실시간 대응',
            'Application (실용화)-유지관리': '안전 진단 지원 도구'
        };
        return contentMap[key] || '연구 개발 중...';
    };

    return (
        <section className="py-20 bg-dark-surface">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">프로젝트 적용 매트릭스</h2>
                    <p className="text-gray-400">프로젝트 생애주기 전반에 걸친 기술 적용 분야입니다.</p>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[800px]">
                        {/* Header Row */}
                        <div className="grid grid-cols-6 gap-4 mb-4">
                            <div className="p-4 font-bold text-white">분야 / 단계</div>
                            {columns.map((col, i) => (
                                <div key={i} className="p-4 font-bold text-gray-300 bg-white/5 rounded-lg text-center">
                                    {col}
                                </div>
                            ))}
                        </div>

                        {/* Data Rows */}
                        {rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="grid grid-cols-6 gap-4 mb-4">
                                <div className={`p-4 font-bold ${row.color} flex items-center`}>
                                    {row.name}
                                </div>
                                {columns.map((col, colIndex) => {
                                    const content = getCellContent(row.name, col);
                                    const isHovered = activeCell === `${rowIndex}-${colIndex}`;

                                    return (
                                        <motion.div
                                            key={colIndex}
                                            onHoverStart={() => setActiveCell(`${rowIndex}-${colIndex}`)}
                                            onHoverEnd={() => setActiveCell(null)}
                                            className={`p-4 rounded-lg border border-white/5 cursor-pointer transition-all duration-300 relative overflow-hidden ${isHovered ? 'bg-white/10 border-primary/50' : 'bg-dark-bg'
                                                }`}
                                        >
                                            <p className="text-sm text-gray-400">{content}</p>
                                            {isHovered && (
                                                <motion.div
                                                    layoutId="highlight"
                                                    className="absolute inset-0 bg-primary/10 z-0"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
                <p className="text-right text-xs text-gray-600 mt-4">[Source: 38]</p>
            </div>
        </section>
    );
};

export default ProjectMatrix;
