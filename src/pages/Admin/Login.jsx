import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import SEO from '../../components/SEO';

const Login = () => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        // Mock authentication - in a real app, this would verify against a backend
        if (password === 'sense2025') {
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/admin/dashboard');
        } else {
            alert('비밀번호가 올바르지 않습니다.');
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
            <SEO title="관리자 로그인" description="SENSE MAKER 관리자 전용 페이지입니다." />
            <div className="max-w-md w-full bg-dark-surface p-8 rounded-xl border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Lock className="text-primary" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">관리자 접속</h1>
                    <p className="text-gray-400 mt-2">계속하려면 비밀번호를 입력하세요</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                            placeholder="관리자 비밀번호 입력"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors"
                    >
                        로그인
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
