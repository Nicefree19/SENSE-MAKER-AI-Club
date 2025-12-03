import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';
import { postsApi } from '../../lib/database';
import { Send, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

const PostEditor = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    const handleSave = async (publish = false) => {
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!title.trim()) {
                throw new Error('제목을 입력해주세요.');
            }
            if (!content.trim()) {
                throw new Error('내용을 입력해주세요.');
            }

            await postsApi.create({
                title,
                content,
                tags,
                published: publish
            });

            setSuccess(true);

            // Redirect to dashboard after 1.5 seconds
            setTimeout(() => {
                navigate('/member/dashboard');
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/member/dashboard');
    };

    return (
        <MemberLayout>
            <SEO title="새 글 쓰기" description="기술 블로그에 새로운 글을 작성합니다." />

            <div className="max-w-4xl mx-auto">
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-400">
                        <CheckCircle size={20} />
                        <span>글이 성공적으로 저장되었습니다! 대시보드로 이동합니다...</span>
                    </div>
                )}

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">새 글 쓰기</h1>
                    <div className="flex gap-3">
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                            disabled={loading}
                        >
                            취소
                        </button>
                        <button
                            onClick={() => handleSave(false)}
                            disabled={loading || success}
                            className="bg-dark-surface border border-white/20 hover:bg-white/5 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Save size={18} />
                            )}
                            임시저장
                        </button>
                        <button
                            onClick={() => handleSave(true)}
                            disabled={loading || success}
                            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-green-500/20 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <Send size={18} />
                            )}
                            발행하기
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-4xl font-bold text-white placeholder-gray-600 border-none focus:outline-none focus:ring-0"
                        placeholder="제목을 입력하세요..."
                        disabled={loading || success}
                    />

                    <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full bg-dark-surface border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
                        placeholder="태그 입력 (쉼표로 구분: React, AI, Python...)"
                        disabled={loading || success}
                    />

                    <div data-color-mode="dark">
                        <MDEditor
                            value={content}
                            onChange={setContent}
                            height={500}
                            style={{ backgroundColor: '#1E293B', color: '#fff' }}
                            preview="live"
                        />
                    </div>

                    <p className="text-gray-500 text-sm">
                        * 마크다운 문법을 지원합니다. 이미지는 외부 URL을 사용해주세요.
                    </p>
                </div>
            </div>
        </MemberLayout>
    );
};

export default PostEditor;
