import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactApi } from '../../lib/database';
import { supabase } from '../../lib/supabase';
import {
    Mail,
    MailOpen,
    Trash2,
    ArrowLeft,
    Loader2,
    AlertCircle,
    Calendar,
    User,
    RefreshCw
} from 'lucide-react';

const AdminMessages = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        checkAdminAndLoad();
    }, []);

    const checkAdminAndLoad = async () => {
        try {
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

            setIsAdmin(true);
            await loadMessages();
        } catch (err) {
            console.error('Auth check failed:', err);
            navigate('/admin');
        }
    };

    const loadMessages = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await contactApi.getMessages();
            setMessages(data || []);
        } catch (err) {
            console.error('Failed to load messages:', err);
            setError('메시지를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (messageId) => {
        try {
            await contactApi.markAsRead(messageId);
            setMessages(messages.map(msg =>
                msg.id === messageId ? { ...msg, is_read: true } : msg
            ));
            if (selectedMessage?.id === messageId) {
                setSelectedMessage({ ...selectedMessage, is_read: true });
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleDelete = async (messageId) => {
        if (!window.confirm('이 메시지를 삭제하시겠습니까?')) return;

        try {
            await supabase.from('contact_messages').delete().eq('id', messageId);
            setMessages(messages.filter(msg => msg.id !== messageId));
            if (selectedMessage?.id === messageId) {
                setSelectedMessage(null);
            }
        } catch (err) {
            console.error('Failed to delete message:', err);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <Loader2 size={40} className="animate-spin text-primary" />
            </div>
        );
    }

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
                        <h1 className="text-2xl font-bold text-white">문의 메시지</h1>
                    </div>
                    <button
                        onClick={loadMessages}
                        className="flex items-center gap-2 px-4 py-2 bg-dark-surface border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                    >
                        <RefreshCw size={18} />
                        새로고침
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={40} className="animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Message List */}
                        <div className="lg:col-span-1 bg-dark-surface rounded-xl border border-white/5 overflow-hidden">
                            <div className="p-4 border-b border-white/5">
                                <h2 className="text-lg font-semibold text-white">
                                    받은 메시지 ({messages.length})
                                </h2>
                            </div>
                            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
                                {messages.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <Mail size={32} className="mx-auto mb-2 opacity-50" />
                                        <p>받은 메시지가 없습니다.</p>
                                    </div>
                                ) : (
                                    messages.map((message) => (
                                        <div
                                            key={message.id}
                                            onClick={() => {
                                                setSelectedMessage(message);
                                                if (!message.is_read) {
                                                    handleMarkAsRead(message.id);
                                                }
                                            }}
                                            className={`p-4 cursor-pointer transition-colors ${
                                                selectedMessage?.id === message.id
                                                    ? 'bg-primary/10'
                                                    : 'hover:bg-white/5'
                                            } ${!message.is_read ? 'bg-blue-500/5' : ''}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {message.is_read ? (
                                                    <MailOpen size={18} className="text-gray-500 mt-1" />
                                                ) : (
                                                    <Mail size={18} className="text-primary mt-1" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-medium truncate ${
                                                            message.is_read ? 'text-gray-400' : 'text-white'
                                                        }`}>
                                                            {message.name}
                                                        </span>
                                                        {!message.is_read && (
                                                            <span className="w-2 h-2 rounded-full bg-primary"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {message.message}
                                                    </p>
                                                    <p className="text-xs text-gray-600 mt-1">
                                                        {formatDate(message.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Message Detail */}
                        <div className="lg:col-span-2 bg-dark-surface rounded-xl border border-white/5">
                            {selectedMessage ? (
                                <div className="h-full flex flex-col">
                                    <div className="p-6 border-b border-white/5">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h2 className="text-xl font-semibold text-white mb-2">
                                                    {selectedMessage.name}
                                                </h2>
                                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <User size={14} />
                                                        {selectedMessage.email}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={14} />
                                                        {formatDate(selectedMessage.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDelete(selectedMessage.id)}
                                                className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex-1 p-6">
                                        <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                            {selectedMessage.message}
                                        </p>
                                    </div>
                                    <div className="p-6 border-t border-white/5">
                                        <a
                                            href={`mailto:${selectedMessage.email}?subject=Re: SENSE MAKER 문의 답변`}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors"
                                        >
                                            <Mail size={18} />
                                            이메일 답장하기
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center py-20 text-gray-500">
                                    <div className="text-center">
                                        <Mail size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>메시지를 선택해주세요.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminMessages;
