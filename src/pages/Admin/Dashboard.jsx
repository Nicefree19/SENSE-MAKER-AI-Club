import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import SEO from '../../components/SEO';
import { Users, Eye, Activity, Database } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const isAuth = localStorage.getItem('isAuthenticated');
        if (!isAuth) {
            navigate('/admin');
        }
    }, [navigate]);

    const stats = [
        { title: '총 방문자 수', value: '1,234', icon: <Eye size={24} />, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { title: '활성 프로젝트', value: '4', icon: <Activity size={24} />, color: 'text-green-400', bg: 'bg-green-400/10' },
        { title: '동아리 회원', value: '12', icon: <Users size={24} />, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { title: '데이터 포인트', value: '8.5k', icon: <Database size={24} />, color: 'text-orange-400', bg: 'bg-orange-400/10' },
    ];

    return (
        <AdminLayout>
            <SEO title="관리자 대시보드" description="SENSE MAKER 활동 현황." />

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">대시보드 개요</h1>
                <p className="text-gray-400 mt-2">환영합니다, 관리자님.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-dark-surface p-6 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                                {stat.icon}
                            </div>
                            <span className="text-green-400 text-sm font-medium">+12%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                        <p className="text-gray-400 text-sm">{stat.title}</p>
                    </div>
                ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-dark-surface rounded-xl border border-white/5 p-6">
                <h2 className="text-xl font-bold text-white mb-6">최근 시스템 활동</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center justify-between p-4 bg-dark-bg rounded-lg border border-white/5">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                <div>
                                    <p className="text-white font-medium">새 프로젝트 "ADS v2.0" 생성됨</p>
                                    <p className="text-gray-400 text-sm">관리자에 의해 업데이트됨</p>
                                </div>
                            </div>
                            <span className="text-gray-500 text-sm">2시간 전</span>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
};

export default Dashboard;
