import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';
import { postsApi } from '../../lib/database';
import { Send, Save, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';

const PostEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [isPublished, setIsPublished] = useState(false);

    useEffect(() => {
        if (id) {
            loadPost(id);
        }
    }, [id]);

    const loadPost = async (postId) => {
        try {
            setInitialLoading(true);
            const data = await postsApi.getById(postId);
            setTitle(data.title || '');
            setContent(data.content || '');
            setTags(data.tags?.join(', ') || '');
            setIsPublished(data.published || false);
        } catch (err) {
            setError('글을 불러오는데 실패했습니다: ' + err.message);
        } finally {
            setInitialLoading(false);
        }
    };

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

            if (isEdit) {
                await postsApi.update(id, {
                    title,
                    content,
                    tags,
                    published: publish
                });
            } else {
                await postsApi.create({
                    title,
                    content,
                    tags,
                    published: publish
                });
            }

            setSuccess(true);
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

    if (initialLoading) {
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
                title={isEdit ? "글 수정" : "새 글 쓰기"}
                description={isEdit ? "기술 블로그 글을 수정합니다." : "기술 블로그에 새로운 글을 작성합니다."}
            />

            <div className="max-w-4xl mx-auto">
                <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    대시보드로 돌아가기
                </button>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3 text-red-400">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg flex items-center gap-3 text-green-400">
                        <CheckCircle size={20} />
                        <span>글이 성공적으로 {isEdit ? '수정' : '저장'}되었습니다! 대시보드로 이동합니다...</span>
                    </div>
                )}

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">
                        {isEdit ? '글 수정' : '새 글 쓰기'}
                    </h1>
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
                            {isEdit && isPublished ? '수정하기' : '발행하기'}
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
