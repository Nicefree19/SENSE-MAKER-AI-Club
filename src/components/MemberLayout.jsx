import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, FolderPlus, User, LogOut, Bookmark, Home, Menu, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import NotificationDropdown from './NotificationDropdown';

const MemberLayout = ({ children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
            if (!session) {
                navigate('/member/login');
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (!session) {
                navigate('/member/login');
            }
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/member/login');
    };

    const menuItems = [
        { name: '내 대시보드', icon: <LayoutDashboard size={20} />, path: '/member/dashboard' },
        { name: '새 프로젝트', icon: <FolderPlus size={20} />, path: '/member/projects/new' },
        { name: '새 글 쓰기', icon: <FileText size={20} />, path: '/member/posts/new' },
        { name: '내 북마크', icon: <Bookmark size={20} />, path: '/member/bookmarks' },
        { name: '프로필 설정', icon: <User size={20} />, path: '/member/profile' },
        { name: '홈페이지', icon: <Home size={20} />, path: '/' },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-dark-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg flex">
            {/* Sidebar */}
            <aside className="w-64 bg-dark-surface border-r border-white/10 hidden md:flex flex-col">
                <div className="p-6 border-b border-white/10">
                    <Link to="/" className="text-xl font-bold text-white tracking-wider hover:text-primary transition-colors">
                        SENSE MEMBER
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path
                                    ? 'bg-primary/10 text-primary border border-primary/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {item.icon}
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="mb-4 px-4">
                        <p className="text-xs text-gray-500">로그인 계정:</p>
                        <p className="text-sm text-white truncate">{user?.email}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-medium">로그아웃</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {/* Mobile Header */}
                <div className="md:hidden sticky top-0 z-40 bg-dark-surface border-b border-white/10 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <Link to="/" className="text-lg font-bold text-white tracking-wider">
                            SENSE MEMBER
                        </Link>
                        <div className="flex items-center gap-2">
                            <NotificationDropdown />
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <nav className="mt-4 space-y-2">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                                        location.pathname === item.path
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {item.icon}
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            ))}
                            <button
                                onClick={() => {
                                    handleLogout();
                                    setMobileMenuOpen(false);
                                }}
                                className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            >
                                <LogOut size={20} />
                                <span className="font-medium">로그아웃</span>
                            </button>
                        </nav>
                    )}
                </div>

                {/* Desktop Header with Notifications */}
                <div className="hidden md:flex sticky top-0 z-40 bg-dark-bg/80 backdrop-blur-sm border-b border-white/5 px-8 py-3 justify-end">
                    <NotificationDropdown />
                </div>

                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MemberLayout;
