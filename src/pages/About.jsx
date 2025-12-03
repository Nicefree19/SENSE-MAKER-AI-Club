import React from 'react';
import ProjectMatrix from '../components/ProjectMatrix';
import SEO from '../components/SEO';

const About = () => {
    return (
        <div className="pt-20 min-h-screen bg-dark-bg text-white">
            <SEO
                title="소개"
                description="SENSE MAKER의 미션과 비전을 소개합니다."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold mb-8">SENSE MAKER 소개</h1>
                <div className="prose prose-invert max-w-none mb-16">
                    <p className="text-xl text-gray-300 mb-6">
                        SENSE MAKER는 <strong>SEN S</strong>tructure <strong>E</strong>ngineering <strong>M</strong>akes <strong>A</strong>i <strong>K</strong>nowledge for <strong>E</strong>ngineering <strong>R</strong>esults의 약자입니다.
                    </p>
                    <p className="text-gray-400">
                        우리는 인공지능(AI), 자동화(Automation), 그리고 실용적인 어플리케이션(Application)을 통합하여 구조 공학 분야를 혁신하는 데 전념하고 있습니다. 우리의 목표는 전통적인 엔지니어링 원칙과 현대적인 기술 발전 사이의 격차를 해소하는 것입니다.
                    </p>
                </div>

                <ProjectMatrix />
            </div>
        </div>
    );
};

export default About;
