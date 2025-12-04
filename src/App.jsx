import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// 로딩 스피너 컴포넌트
const PageLoader = () => (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">로딩 중...</p>
        </div>
    </div>
);

// ============================================
// Lazy-loaded Pages (코드 스플리팅)
// ============================================

// Public Pages
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Projects = lazy(() => import('./pages/Projects'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Blog = lazy(() => import('./pages/Blog'));
const Contact = lazy(() => import('./pages/Contact'));
const Members = lazy(() => import('./pages/Members'));

// Admin Pages
const AdminLogin = lazy(() => import('./pages/Admin/Login'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const AdminMessages = lazy(() => import('./pages/Admin/Messages'));

// Member Pages
const MemberLogin = lazy(() => import('./pages/Member/Login'));
const MemberDashboard = lazy(() => import('./pages/Member/Dashboard'));
const MemberProfile = lazy(() => import('./pages/Member/Profile'));
const MemberBookmarks = lazy(() => import('./pages/Member/Bookmarks'));
const ProjectEditor = lazy(() => import('./pages/Member/ProjectEditor'));
const PostEditor = lazy(() => import('./pages/Member/PostEditor'));

// 404 페이지
const NotFound = lazy(() => import('./pages/NotFound'));

// ============================================
// Layout Components
// ============================================

// Layout wrapper for public pages to include Navbar and Footer
const PublicLayout = ({ children }) => (
    <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
                {children}
            </Suspense>
        </main>
        <Footer />
    </div>
);

// Layout wrapper for auth pages (no navbar/footer)
const AuthLayout = ({ children }) => (
    <Suspense fallback={<PageLoader />}>
        {children}
    </Suspense>
);

// ============================================
// App Component
// ============================================

function App() {
    return (
        <ThemeProvider>
            <ToastProvider>
                <Router>
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                            <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
                            <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
                            <Route path="/projects/:id" element={<PublicLayout><ProjectDetail /></PublicLayout>} />
                            <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
                            <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
                            <Route path="/members" element={<PublicLayout><Members /></PublicLayout>} />

                            {/* Admin Routes (Legacy/System Admin) */}
                            <Route path="/admin" element={<AuthLayout><AdminLogin /></AuthLayout>} />
                            <Route path="/admin/dashboard" element={<AuthLayout><AdminDashboard /></AuthLayout>} />
                            <Route path="/admin/messages" element={<AuthLayout><AdminMessages /></AuthLayout>} />

                            {/* Member Routes (CMS) */}
                            <Route path="/member/login" element={<AuthLayout><MemberLogin /></AuthLayout>} />
                            <Route path="/member/dashboard" element={<AuthLayout><MemberDashboard /></AuthLayout>} />
                            <Route path="/member/profile" element={<AuthLayout><MemberProfile /></AuthLayout>} />
                            <Route path="/member/bookmarks" element={<AuthLayout><MemberBookmarks /></AuthLayout>} />
                            <Route path="/member/projects/new" element={<AuthLayout><ProjectEditor /></AuthLayout>} />
                            <Route path="/member/projects/:id/edit" element={<AuthLayout><ProjectEditor /></AuthLayout>} />
                            <Route path="/member/posts/new" element={<AuthLayout><PostEditor /></AuthLayout>} />
                            <Route path="/member/posts/:id/edit" element={<AuthLayout><PostEditor /></AuthLayout>} />

                            {/* 404 Not Found */}
                            <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
                        </Routes>
                    </Suspense>
                </Router>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;
