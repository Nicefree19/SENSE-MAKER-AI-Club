import React, { useState, useEffect } from 'react';
import { projectMembersApi, profilesApi } from '../lib/database';
import { supabase } from '../lib/supabase';
import {
    Users,
    UserPlus,
    UserMinus,
    Crown,
    Shield,
    User,
    Loader2,
    X,
    Check,
    Search
} from 'lucide-react';

const ProjectTeamManager = ({ projectId, authorId, onMembersChange }) => {
    const [members, setMembers] = useState([]);
    const [allProfiles, setAllProfiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUserId, setCurrentUserId] = useState(null);
    const [isAuthor, setIsAuthor] = useState(false);

    useEffect(() => {
        checkCurrentUser();
        loadMembers();
    }, [projectId]);

    const checkCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setCurrentUserId(user.id);
            setIsAuthor(user.id === authorId);
        }
    };

    const loadMembers = async () => {
        try {
            setLoading(true);
            const data = await projectMembersApi.getByProjectId(projectId);
            setMembers(data || []);
        } catch (err) {
            console.error('Failed to load members:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadAllProfiles = async () => {
        try {
            const data = await profilesApi.getAll();
            setAllProfiles(data || []);
        } catch (err) {
            console.error('Failed to load profiles:', err);
        }
    };

    const handleOpenAddModal = () => {
        loadAllProfiles();
        setShowAddModal(true);
        setSearchQuery('');
    };

    const handleAddMember = async (userId) => {
        try {
            setAdding(true);
            await projectMembersApi.addMember(projectId, userId, 'member');
            await loadMembers();
            onMembersChange?.();
        } catch (err) {
            console.error('Failed to add member:', err);
            alert('멤버 추가에 실패했습니다: ' + err.message);
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm('정말로 이 멤버를 제거하시겠습니까?')) return;

        try {
            await projectMembersApi.removeMember(projectId, userId);
            await loadMembers();
            onMembersChange?.();
        } catch (err) {
            console.error('Failed to remove member:', err);
            alert('멤버 제거에 실패했습니다: ' + err.message);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await projectMembersApi.updateRole(projectId, userId, newRole);
            await loadMembers();
            onMembersChange?.();
        } catch (err) {
            console.error('Failed to update role:', err);
            alert('역할 변경에 실패했습니다: ' + err.message);
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'owner':
                return <Crown size={14} className="text-yellow-400" />;
            case 'admin':
                return <Shield size={14} className="text-blue-400" />;
            default:
                return <User size={14} className="text-gray-400" />;
        }
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case 'owner':
                return '소유자';
            case 'admin':
                return '관리자';
            default:
                return '멤버';
        }
    };

    const filteredProfiles = allProfiles.filter(profile => {
        // Exclude already added members and the author
        const isMember = members.some(m => m.user_id === profile.id);
        const isProjectAuthor = profile.id === authorId;
        if (isMember || isProjectAuthor) return false;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                profile.full_name?.toLowerCase().includes(query) ||
                profile.email?.toLowerCase().includes(query) ||
                profile.username?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <Loader2 size={20} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Users size={20} className="text-purple-400" />
                    팀원 ({members.length + 1})
                </h3>
                {isAuthor && (
                    <button
                        onClick={handleOpenAddModal}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors text-sm"
                    >
                        <UserPlus size={16} />
                        멤버 추가
                    </button>
                )}
            </div>

            {/* Author (always shown first) */}
            <div className="bg-dark-bg rounded-lg p-3 border border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
                            <Crown size={20} />
                        </div>
                        <div>
                            <p className="text-white font-medium">프로젝트 소유자</p>
                            <p className="text-xs text-gray-500">모든 권한 보유</p>
                        </div>
                    </div>
                    <span className="px-2 py-1 bg-yellow-400/10 text-yellow-400 text-xs rounded">
                        소유자
                    </span>
                </div>
            </div>

            {/* Team Members */}
            <div className="space-y-2">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="bg-dark-bg rounded-lg p-3 border border-white/5 hover:border-white/10 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {member.profiles?.avatar_url ? (
                                    <img
                                        src={member.profiles.avatar_url}
                                        alt={member.profiles.full_name}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {member.profiles?.full_name?.[0]?.toUpperCase() || '?'}
                                    </div>
                                )}
                                <div>
                                    <p className="text-white font-medium">
                                        {member.profiles?.full_name || '알 수 없음'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {member.profiles?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {isAuthor && (
                                    <select
                                        value={member.role}
                                        onChange={(e) => handleUpdateRole(member.user_id, e.target.value)}
                                        className="bg-dark-surface border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-primary"
                                    >
                                        <option value="member">멤버</option>
                                        <option value="admin">관리자</option>
                                    </select>
                                )}

                                {!isAuthor && (
                                    <span className="flex items-center gap-1 px-2 py-1 bg-white/5 text-gray-300 text-xs rounded">
                                        {getRoleIcon(member.role)}
                                        {getRoleLabel(member.role)}
                                    </span>
                                )}

                                {isAuthor && (
                                    <button
                                        onClick={() => handleRemoveMember(member.user_id)}
                                        className="p-1.5 text-gray-500 hover:text-red-400 transition-colors"
                                        title="멤버 제거"
                                    >
                                        <UserMinus size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {members.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                        <Users size={32} className="mx-auto mb-2 opacity-50" />
                        <p>아직 팀원이 없습니다.</p>
                        {isAuthor && (
                            <p className="text-sm mt-1">위의 "멤버 추가" 버튼을 눌러 팀원을 추가하세요.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Add Member Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-dark-surface w-full max-w-md rounded-xl border border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <UserPlus size={20} className="text-primary" />
                                팀원 추가
                            </h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="p-4 border-b border-white/10">
                            <div className="relative">
                                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="이름 또는 이메일로 검색..."
                                    className="w-full bg-dark-bg border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>

                        {/* Available Members List */}
                        <div className="max-h-80 overflow-y-auto p-4 space-y-2">
                            {filteredProfiles.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                                    <p>추가할 수 있는 멤버가 없습니다.</p>
                                </div>
                            ) : (
                                filteredProfiles.map((profile) => (
                                    <div
                                        key={profile.id}
                                        className="flex items-center justify-between p-3 bg-dark-bg rounded-lg hover:border-primary/30 border border-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {profile.avatar_url ? (
                                                <img
                                                    src={profile.avatar_url}
                                                    alt={profile.full_name}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                    {profile.full_name?.[0]?.toUpperCase() || '?'}
                                                </div>
                                            )}
                                            <div>
                                                <p className="text-white font-medium">
                                                    {profile.full_name || '이름 없음'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {profile.email}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleAddMember(profile.id)}
                                            disabled={adding}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm disabled:opacity-50"
                                        >
                                            {adding ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <>
                                                    <Check size={14} />
                                                    추가
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectTeamManager;
