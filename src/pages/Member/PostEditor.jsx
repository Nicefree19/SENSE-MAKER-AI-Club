import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import { motion, AnimatePresence } from 'framer-motion';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';
import { postsApi } from '../../lib/database';
import { Send, Save, Loader2, AlertCircle, CheckCircle, ArrowLeft, Image as ImageIcon, Eye, Edit3, X } from 'lucide-react';
import ImageUploader from '../../components/ImageUploader';
import TagInput from '../../components/TagInput';
import ReactMarkdown from 'react-markdown';

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
        if (window.confirm('작성 중인 내용이 저장되지 않을 수 있습니다. 정말 나가시겠습니까?')) {
            navigate('/member/dashboard');
        }
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

            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-40 bg-dark-bg/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleCancel}
                        className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                        title="나가기"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <span className="text-sm font-medium text-gray-400">
                        {isEdit ? '글 수정 중...' : '새 글 작성 중...'}
                    </span>
                    {success && (
                        <span className="flex items-center gap-1 text-green-400 text-sm animate-fadeIn">
                            <CheckCircle size={14} /> 저장됨
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setPreviewMode(!previewMode)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${previewMode
                                ? 'bg-primary/10 text-primary ring-1 ring-primary/50'
                                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {previewMode ? <Edit3 size={16} /> : <Eye size={16} />}
                        {previewMode ? '편집하기' : '미리보기'}
                    </button>

                    <div className="h-6 w-px bg-white/10 mx-1" />

                    <button
                        onClick={() => handleSave(false)}
                        disabled={loading || success}
                        className="text-gray-400 hover:text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        임시저장
                    </button>

                    <button
                        onClick={() => handleSave(true)}
                        disabled={loading || success}
                        className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-full text-sm font-medium transition-all shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        {isEdit && isPublished ? '수정 발행' : '발행하기'}
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12">
                {error && (
                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400 animate-slideIn">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Editor / Preview Switcher */}
                <AnimatePresence mode="wait">
                    {previewMode ? (
                        <motion.div
                            key="preview"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="prose prose-invert max-w-none"
                        >
                            {/* Preview Header */}
                            <div className="mb-12 text-center">
                                {imageUrl && (
                                    <div className="w-full h-80 rounded-2xl overflow-hidden mb-8 shadow-2xl">
                                        <img src={imageUrl} alt="Cover" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="flex items-center justify-center gap-2 mb-6">
                                    {tags.split(',').filter(Boolean).map((tag, i) => (
                                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                                            #{tag.trim()}
                                        </span>
                                    ))}
                                </div>
                                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">{title}</h1>
                                {subtitle && <p className="text-xl text-gray-400 font-light">{subtitle}</p>}
                            </div>

                            {/* Preview Content */}
                            <div className="bg-dark-surface p-8 md:p-12 rounded-2xl border border-white/5 shadow-xl">
                                <ReactMarkdown>{content}</ReactMarkdown>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="editor"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-8"
                        >
                            {/* Cover Image Section */}
                            <div className="group relative rounded-2xl overflow-hidden bg-dark-surface border-2 border-dashed border-white/10 hover:border-primary/50 transition-colors min-h-[200px] flex flex-col items-center justify-center">
                                {imageUrl ? (
                                    <>
                                        <img src={imageUrl} alt="Cover" className="w-full h-80 object-cover" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => setImageUrl('')}
                                                className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 backdrop-blur-sm transition-all"
                                            >
                                                <X size={16} /> 제거
                                            </button>
                                            <div className="w-40">
                                                <ImageUploader onUploadComplete={setImageUrl} />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-8 w-full">
                                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400 group-hover:text-primary group-hover:scale-110 transition-all">
                                            <ImageIcon size={32} />
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-300 mb-2">커버 이미지 추가</h3>
                                        <p className="text-gray-500 text-sm mb-6">
                                            블로그 글의 첫인상을 결정하는 멋진 이미지를 업로드하세요.
                                        </p>
                                        <div className="max-w-xs mx-auto">
                                            <ImageUploader onUploadComplete={setImageUrl} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Title & Subtitle Inputs */}
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-transparent text-4xl md:text-5xl font-bold text-white placeholder-gray-700 border-none focus:outline-none focus:ring-0 px-0 leading-tight"
                                    placeholder="제목을 입력하세요..."
                                />
                                <input
                                    type="text"
                                    value={subtitle}
                                    onChange={(e) => setSubtitle(e.target.value)}
                                    className="w-full bg-transparent text-xl md:text-2xl text-gray-400 placeholder-gray-700 border-none focus:outline-none focus:ring-0 px-0 font-light"
                                    placeholder="부제목을 입력하세요 (선택사항)..."
                                />
                            </div>

                            {/* Tags Input */}
                            <div>
                                <TagInput
                                    value={tags}
                                    onChange={setTags}
                                    placeholder="태그 추가 (예: React, AI)..."
                                />
                            </div>

                            {/* Markdown Editor */}
                            <div className="relative group" data-color-mode="dark">
                                <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl -z-10" />
                                <MDEditor
                                    value={content}
                                    onChange={setContent}
                                    height={600}
                                    preview="edit"
                                    visibleDragbar={false}
                                    className="!bg-transparent !border-none"
                                    textareaProps={{
                                        placeholder: '당신의 이야기를 시작하세요...'
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </MemberLayout>
    );
};

export default PostEditor;
