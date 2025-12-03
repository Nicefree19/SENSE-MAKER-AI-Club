import React from 'react';
import Hero from '../components/Hero';
import Pillars from '../components/Pillars';
import FeaturedProjects from '../components/FeaturedProjects';
import SEO from '../components/SEO';

const Home = () => {
    return (
        <div className="min-h-screen bg-dark-bg text-white">
            <SEO
                title="홈"
                description="SENSE MAKER - AI, 자동화, 그리고 실용화를 통한 구조 엔지니어링의 혁신."
            />
            <Hero />
            <Pillars />
            <FeaturedProjects />
        </div>
    );
};

export default Home;
