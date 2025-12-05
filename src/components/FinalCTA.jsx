import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const FinalCTA = () => {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-dark-bg to-primary/10 pointer-events-none" />

            {/* Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-full bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-accent-glow text-sm font-medium mb-8">
                        <Sparkles size={16} />
                        <span>Join the Innovation</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        구조 엔지니어링의 미래,<br />
                        <span className="text-primary-light">함께 만들어가시겠습니까?</span>
                    </h2>

                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        SENSE MAKER는 열정 있는 엔지니어와 개발자의 참여를 기다립니다.
                        당신의 아이디어가 현실이 되는 곳, 지금 시작하세요.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            to="/contact"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-lg transition-all shadow-lg shadow-primary/25 hover:scale-105"
                        >
                            동아리 가입 신청
                            <ArrowRight className="ml-2" size={20} />
                        </Link>
                        <a
                            href="mailto:contact@sensemaker.com"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl bg-dark-surface border border-white/10 hover:bg-white/5 text-white font-medium text-lg transition-all hover:border-white/30"
                        >
                            <Mail className="mr-2" size={20} />
                            문의하기
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default FinalCTA;
