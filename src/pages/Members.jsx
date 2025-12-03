import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { profilesApi } from '../lib/database';
import { Users, Github, Linkedin, Globe, Mail, Loader2 } from 'lucide-react';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const data = await profilesApi.getAll();
            setMembers(data || []);
        } catch (err) {
            console.error('Failed to load members:', err);
            setError('멤버 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'admin':
                return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'member':
                return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'admin':
                return '관리자';
            case 'member':
                return '멤버';
            default:
                return '게스트';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg py-20">
            <SEO
                title="멤버"
                description="SENSE MAKER AI 동아리의 멤버들을 소개합니다."
            />

            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-6">
                        <Users size={16} />
                        <span className="text-sm font-medium">Our Team</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        동아리 멤버
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        AI와 구조공학의 융합을 연구하는 열정적인 멤버들을 소개합니다.
                    </p>
                </div>

                {error ? (
                    <div className="text-center py-12">
                        <p className="text-red-400">{error}</p>
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center py-12">
                        <Users size={48} className="mx-auto text-gray-600 mb-4" />
                        <p className="text-gray-400">등록된 멤버가 없습니다.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="bg-dark-surface border border-white/5 rounded-xl p-6 hover:border-primary/30 transition-all duration-300 group"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {member.avatar_url ? (
                                        <img
                                            src={member.avatar_url}
                                            alt={member.full_name || member.username}
                                            className="w-24 h-24 rounded-full object-cover border-2 border-white/10 group-hover:border-primary/50 transition-colors"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                                            {(member.full_name || member.username || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}

                                    <h3 className="mt-4 text-lg font-semibold text-white">
                                        {member.full_name || member.username || '익명'}
                                    </h3>

                                    <span className={`mt-2 px-3 py-1 text-xs font-medium rounded-full border ${getRoleBadgeColor(member.role)}`}>
                                        {getRoleLabel(member.role)}
                                    </span>

                                    {member.bio && (
                                        <p className="mt-3 text-sm text-gray-400 line-clamp-2">
                                            {member.bio}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-3 mt-4">
                                        {member.github && (
                                            <a
                                                href={member.github}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-500 hover:text-white transition-colors"
                                            >
                                                <Github size={18} />
                                            </a>
                                        )}
                                        {member.linkedin && (
                                            <a
                                                href={member.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-500 hover:text-blue-400 transition-colors"
                                            >
                                                <Linkedin size={18} />
                                            </a>
                                        )}
                                        {member.website && (
                                            <a
                                                href={member.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-500 hover:text-green-400 transition-colors"
                                            >
                                                <Globe size={18} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Members;
