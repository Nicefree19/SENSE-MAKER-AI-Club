import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Projects from './pages/Projects';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import AdminLogin from './pages/Admin/Login';
import AdminDashboard from './pages/Admin/Dashboard';
import MemberLogin from './pages/Member/Login';
import MemberDashboard from './pages/Member/Dashboard';
import ProjectEditor from './pages/Member/ProjectEditor';
import PostEditor from './pages/Member/PostEditor';

// Layout wrapper for public pages to include Navbar and Footer
const PublicLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">
      {children}
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/projects" element={<PublicLayout><Projects /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><Blog /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />

        {/* Admin Routes (Legacy/System Admin) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />

        {/* Member Routes (CMS) */}
        <Route path="/member/login" element={<MemberLogin />} />
        <Route path="/member/dashboard" element={<MemberDashboard />} />
        <Route path="/member/projects/new" element={<ProjectEditor />} />
        <Route path="/member/posts/new" element={<PostEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
