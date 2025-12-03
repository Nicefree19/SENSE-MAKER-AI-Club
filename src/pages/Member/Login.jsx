import React, { useState } from 'react';
import { Lock, Mail, UserPlus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import SEO from '../../components/SEO';

const Login = () => {
    const [loading, setLoading] = useState(false);

    const handleTest = async () => {
        setLoading(true);
        console.log('Supabase client:', supabase);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
            <SEO title="멤버 로그인" description="SENSE MAKER 멤버 전용 페이지입니다." />
            <div className="max-w-md w-full bg-dark-surface p-8 rounded-xl border border-white/10 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                        <Lock className="text-primary" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Member Login Debug + Supabase</h1>
                    <button onClick={handleTest} className="mt-4 bg-primary text-white px-4 py-2 rounded">
                        Test Supabase
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
