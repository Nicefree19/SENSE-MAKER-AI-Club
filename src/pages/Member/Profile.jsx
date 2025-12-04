import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';
import { supabase } from '../../lib/supabase';
import { profilesApi } from '../../lib/database';
import {
    User,
    Save,
    Loader2,
    AlertCircle,
    CheckCircle,
    Github,
    Linkedin,
    Globe,
    Camera
} from 'lucide-react';

const MemberProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        full_name: '',
        username: '',
        bio: '',
        website: '',
        github: '',
        linkedin: '',
        avatar_url: ''
    });

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                navigate('/member/login');
                return;
            }

            setUser(user);

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profile) {
                setFormData({
                    full_name: profile.full_name || '',
                    username: profile.username || '',
                    bio: profile.bio || '',
                    website: profile.website || '',
                    github: profile.github || '',
                    linkedin: profile.linkedin || '',
                    avatar_url: profile.avatar_url || ''
                });
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
            setError('프로필을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: formData.full_name,
                    username: formData.username,
                    bio: formData.bio,
                    website: formData.website,
                    github: formData.github,
                    linkedin: formData.linkedin,
                    avatar_url: formData.avatar_url,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            console.error('Failed to update profile:', err);
            setError('프로필 업데이트에 실패했습니다: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return (
            <MemberLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 size={40} className="animate-spin text-primary" />
                </div>
            </MemberLayout>
        );
    }

    return (
        <MemberLayout>
            <SEO
                title="프로필 관리"
                description="프로필 정보를 수정합니다."
            />

            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <User size={28} className="text-primary" />
                    <h1 className="text-2xl font-bold text-white">프로필 관리</h1>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-400">
                        <CheckCircle size={20} />
                        <span>프로필이 성공적으로 업데이트되었습니다!</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-dark-surface rounded-xl border border-white/5 p-8">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            {formData.avatar_url ? (
                                <img
                                    src={formData.avatar_url}
                                    alt="Profile"
                                    className="w-32 h-32 rounded-full object-cover border-4 border-white/10"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold">
                                    {(formData.full_name || formData.username || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors">
                                <Camera size={18} className="text-white" />
                            </div>
                        </div>
                        <p className="text-gray-500 text-sm mt-3">
                            프로필 이미지 URL을 아래에 입력하세요
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    이름
                                </label>
                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="홍길동"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    사용자명
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                    placeholder="username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                프로필 이미지 URL
                            </label>
                            <input
                                type="url"
                                name="avatar_url"
                                value={formData.avatar_url}
                                onChange={handleChange}
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                placeholder="https://example.com/avatar.jpg"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                자기소개
                            </label>
                            <textarea
                                name="bio"
                                value={formData.bio}
                                onChange={handleChange}
                                rows="4"
                                className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors resize-none"
                                placeholder="간단한 자기소개를 작성해주세요..."
                            />
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-lg font-medium text-white mb-4">소셜 링크</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <Globe size={16} />
                                        웹사이트
                                    </label>
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                        placeholder="https://yourwebsite.com"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <Github size={16} />
                                        GitHub
                                    </label>
                                    <input
                                        type="url"
                                        name="github"
                                        value={formData.github}
                                        onChange={handleChange}
                                        className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                        placeholder="https://github.com/username"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                                        <Linkedin size={16} />
                                        LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={formData.linkedin}
                                        onChange={handleChange}
                                        className="w-full bg-dark-bg border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        저장 중...
                                    </>
                                ) : (
                                    <>
                                        <Save size={20} />
                                        프로필 저장
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </MemberLayout>
    );
};

export default MemberProfile;
