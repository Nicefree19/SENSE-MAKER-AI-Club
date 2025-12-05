import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import {
    Users,
    Search,
    Shield,
    MoreVertical,
    Loader2,
    ArrowLeft,
    CheckCircle,
    XCircle
} from 'lucide-react';

const AdminMembers = () => {
    const navigate = useNavigate();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'admin', 'member'
    const [updating, setUpdating] = useState(null);

    useEffect(() => {
        checkAdminAndLoad();
    }, []);

    const checkAdminAndLoad = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            navigate('/admin');
            return;
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            navigate('/admin');
            return;
        }

        loadMembers();
    };

    const loadMembers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMembers(data || []);
        } catch (err) {
            console.error('Failed to load members:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        if (!window.confirm(`해당 회원의 권한을 '${newRole}'(으)로 변경하시겠습니까?`)) return;

        try {
            setUpdating(userId);
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            setMembers(members.map(m =>
                m.id === userId ? { ...m, role: newRole } : m
            ));
            alert('권한이 변경되었습니다.');
        } catch (err) {
            console.error('Failed to update role:', err);
            alert('권한 변경에 실패했습니다.');
        } finally {
            setUpdating(null);
        }
    };

    const filteredMembers = members.filter(member => {
        const matchesSearch = (member.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (member.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || member.role === filter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-dark-bg">
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/admin/dashboard')}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={24} />
                        </button>
                        <h1 className="text-2xl font-bold text-white">멤버 관리</h1>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Users size={20} />
                        <span>총 {members.length}명</span>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="이름 또는 이메일 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-dark-surface border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="bg-dark-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary"
                    >
                        <option value="all">모든 권한</option>
                        <option value="admin">관리자</option>
                        <option value="member">일반 멤버</option>
                    </select>
                </div>

                {/* Member List */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="bg-dark-surface rounded-xl border border-white/5 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-gray-400 text-sm">
                                    <tr>
                                        <th className="p-4">프로필</th>
                                        <th className="p-4">이름</th>
                                        <th className="p-4">권한</th>
                                        <th className="p-4">가입일</th>
                                        <th className="p-4 text-right">관리</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredMembers.map((member) => (
                                        <tr key={member.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden">
                                                    {member.avatar_url ? (
                                                        <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                            <Users size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-white">{member.full_name}</div>
                                                <div className="text-sm text-gray-500">{member.email}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${member.role === 'admin'
                                                        ? 'bg-purple-500/10 text-purple-400'
                                                        : 'bg-gray-500/10 text-gray-400'
                                                    }`}>
                                                    {member.role === 'admin' && <Shield size={12} />}
                                                    {member.role === 'admin' ? '관리자' : '멤버'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-400 text-sm">
                                                {new Date(member.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="relative inline-block group">
                                                    <button
                                                        disabled={updating === member.id}
                                                        className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                                    >
                                                        {updating === member.id ? (
                                                            <Loader2 size={20} className="animate-spin" />
                                                        ) : (
                                                            <MoreVertical size={20} />
                                                        )}
                                                    </button>

                                                    {/* Dropdown Menu */}
                                                    <div className="absolute right-0 mt-2 w-48 bg-dark-bg border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => handleRoleUpdate(member.id, 'admin')}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                                            >
                                                                <Shield size={16} />
                                                                관리자로 지정
                                                            </button>
                                                            <button
                                                                onClick={() => handleRoleUpdate(member.id, 'member')}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                                                            >
                                                                <Users size={16} />
                                                                멤버로 지정
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredMembers.length === 0 && (
                            <div className="p-8 text-center text-gray-500">
                                검색 결과가 없습니다.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMembers;
