import React, { useState } from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert([
                    {
                        name: formData.name,
                        email: formData.email,
                        message: formData.message
                    }
                ]);

            if (error) throw error;

            setStatus('success');
            setFormData({ name: '', email: '', message: '' });
            alert('메시지가 성공적으로 전송되었습니다!');
        } catch (error) {
            console.error('Error sending message:', error);
            setStatus('error');
            alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
        }
    };

    return (
        <div className="pt-20 min-h-screen bg-dark-bg text-white">
            <SEO
                title="문의하기"
                description="SENSE MAKER와의 협업 및 문의를 환영합니다."
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-4xl font-bold mb-12 text-center">문의하기</h1>

                <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold mb-6">연락처 정보</h2>
                        <div className="flex items-start space-x-4">
                            <Mail className="text-primary mt-1" />
                            <div>
                                <h3 className="font-medium">이메일</h3>
                                <p className="text-gray-400">dhlee@senkuzo.com</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <MapPin className="text-primary mt-1" />
                            <div>
                                <h3 className="font-medium">위치</h3>
                                <p className="text-gray-400">대한민국 서울</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <Phone className="text-primary mt-1" />
                            <div>
                                <h3 className="font-medium">전화번호</h3>
                                <p className="text-gray-400">010-4249-7140</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 bg-dark-surface p-8 rounded-xl border border-white/5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">이름</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">메시지</label>
                            <textarea
                                name="message"
                                rows="4"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                            ></textarea>
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'submitting'}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {status === 'submitting' ? '전송 중...' : '메시지 보내기'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
