import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';
import { postsApi } from '../../lib/database';
import { Send, Save, Loader2, AlertCircle, CheckCircle, ArrowLeft, Image as ImageIcon, Eye, Edit3 } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';

const PostEditor = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(isEdit);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Form States
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);

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
            setSubtitle(data.subtitle || '');
            setContent(data.content || '');
            setTags(data.tags?.join(', ') || '');
            setImageUrl(data.image_url || '');
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

            const postData = {
                title,
                subtitle,
                content,
                imageUrl,
                tags,
                published: publish
            };

            if (isEdit) {
                await postsApi.update(id, postData);
            } else {
                await postsApi.create(postData);
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

            <div className="max-w-5xl mx-auto">
                {/* Header Actions */}
                <div className="flex justify-between items-center mb-6">
                    <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        대시보드로 돌아가기
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setPreviewMode(!previewMode)}
                            className={`px-4 py-2 rounded-lg border transition-colors flex items-center gap-2 ${previewMode
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-dark-surface border-white/20 text-gray-400 hover:text-white'
                                }`}
                        >
                            {previewMode ? <Edit3 size={18} /> : <Eye size={18} />}
                            {previewMode ? '편집 모드' : '미리보기'}
                        </button>

                        <button
                            onClick={() => handleSave(false)}
                            disabled={loading || success}
                            className="bg-dark-surface border border-white/20 hover:bg-white/5 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            임시저장
                        </button>

                        <button
                            onClick={() => handleSave(true)}
                            disabled={loading || success}
                            className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-primary/25 flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            {isEdit && isPublished ? '수정하기' : '발행하기'}
                        </button>
                    </div>
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
                        <span>글이 성공적으로 {isEdit ? '수정' : '저장'}되었습니다! 대시보드로 이동합니다...</span>
                    </div>
                )}

                {/* Editor Area */}
                <div className="space-y-6">
                    {/* Cover Image */}
                    {!previewMode && (
                        <div className="bg-dark-surface p-6 rounded-xl border border-white/5">
                            <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
                                <ImageIcon size={16} />
                                커버 이미지 (선택)
                            </h3>
                            {imageUrl ? (
                                <div className="relative rounded-lg overflow-hidden group h-64">
                                    <img
                                        src={imageUrl}
                                        alt="Cover"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => setImageUrl('')}
                                            className="bg-red-500/80 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            이미지 삭제
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <ImageUploader onUploadComplete={setImageUrl} />
                            )}
                        </div>
                    )}

                    {/* Title & Subtitle */}
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-transparent text-4xl font-bold text-white placeholder-gray-600 border-none focus:outline-none focus:ring-0 px-0"
                            placeholder="제목을 입력하세요..."
                            disabled={loading || success || previewMode}
                        />
                        <input
                            type="text"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            className="w-full bg-transparent text-xl text-gray-400 placeholder-gray-600 border-none focus:outline-none focus:ring-0 px-0"
                            placeholder="부제목을 입력하세요 (선택사항)..."
                            disabled={loading || success || previewMode}
                        />
                    </div>

                    {/* Tags */}
                    {!previewMode && (
                        <div className="bg-dark-surface px-4 py-3 rounded-lg border border-white/10 flex items-center gap-3">
                            <span className="text-gray-400 text-sm whitespace-nowrap">태그:</span>
                            <input
                                type="text"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full bg-transparent text-white placeholder-gray-600 focus:outline-none text-sm"
                                placeholder="React, AI, Python... (쉼표로 구분)"
                                disabled={loading || success}
                            />
                        </div>
                    )}

                    {/* Main Editor */}
                    <div data-color-mode="dark" className="min-h-[500px]">
                        {previewMode ? (
                            <div className="prose prose-invert max-w-none bg-dark-surface p-8 rounded-xl border border-white/5">
                                {imageUrl && (
                                    <img src={imageUrl} alt="Cover" className="w-full h-64 object-cover rounded-lg mb-8" />
                                )}
                                <MDEditor.Markdown source={content} style={{ backgroundColor: 'transparent', color: '#fff' }} />
                            </div>
                        ) : (
                            <MDEditor
                                value={content}
                                onChange={setContent}
                                height={600}
                                style={{ backgroundColor: '#1E293B', color: '#fff' }}
                                preview="edit"
                                extraCommands={[]}
                            />
                        )}
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
};

export default PostEditor;
