import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import SEO from '../components/SEO';

const Contact = () => {
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
                                <p className="text-gray-400">contact@sensemaker.club</p>
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
                                <p className="text-gray-400">+82 10-1234-5678</p>
                            </div>
                        </div>
                    </div>

                    <form className="space-y-6 bg-dark-surface p-8 rounded-xl border border-white/5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">이름</label>
                            <input type="text" className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">이메일</label>
                            <input type="email" className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">메시지</label>
                            <textarea rows="4" className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"></textarea>
                        </div>
                        <button className="w-full bg-primary hover:bg-primary-dark text-white font-medium py-3 rounded-lg transition-colors">
                            메시지 보내기
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
