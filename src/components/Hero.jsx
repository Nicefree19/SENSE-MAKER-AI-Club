import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import ParticleBackground from './ParticleBackground';
import { Link } from 'react-router-dom';

const Hero = () => {
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-dark-bg to-dark-surface">
            <ParticleBackground />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            SENSE MAKER
                        </span>
                    </h1>
                    <h2 className="text-2xl md:text-4xl font-light text-primary-light mb-8">
                        구조 엔지니어링의 미래, AI로 설계하다
                    </h2>
                    <p className="max-w-2xl mx-auto text-xl text-gray-400 mb-10">
                        인공지능, 자동화, 그리고 실용적인 어플리케이션을 통해<br className="hidden md:block" />
                        구조 공학의 새로운 패러다임을 제시합니다.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/projects"
                            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors duration-300 shadow-lg shadow-primary/25"
                        >
                            프로젝트 보기
                            <ArrowRight className="ml-2 -mr-1" size={20} />
                        </Link>
                        <Link
                            to="/about"
                            className="inline-flex items-center justify-center px-8 py-3 border border-gray-600 text-base font-medium rounded-md text-gray-300 hover:text-white hover:border-white transition-colors duration-300 backdrop-blur-sm bg-white/5"
                        >
                            비전 확인하기
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Decorative gradient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        </section>
    );
};

export default Hero;
