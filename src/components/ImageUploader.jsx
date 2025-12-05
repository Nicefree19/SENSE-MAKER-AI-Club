import React, { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Upload, Loader2, X, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ onUploadComplete }) => {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState(null);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const uploadImage = async (file) => {
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드 가능합니다.');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('파일 크기는 5MB 이하여야 합니다.');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            onUploadComplete(publicUrl);
        } catch (err) {
            console.error('Upload failed:', err);
            setError('이미지 업로드에 실패했습니다. (Storage 설정 확인 필요)');
        } finally {
            setUploading(false);
            setDragActive(false);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadImage(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            uploadImage(e.target.files[0]);
        }
    };

    return (
        <div className="w-full">
            <div
                className={`relative border border-dashed rounded-xl p-8 transition-all duration-300 text-center group ${dragActive
                    ? 'border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]'
                    : 'border-white/10 hover:border-primary/50 hover:bg-white/5 bg-dark-surface'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleChange}
                    accept="image/*"
                    disabled={uploading}
                />

                <div className="flex flex-col items-center justify-center space-y-3">
                    {uploading ? (
                        <>
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            <p className="text-sm font-medium text-primary">이미지 업로드 중...</p>
                        </>
                    ) : (
                        <>
                            <div className="p-4 bg-white/5 rounded-full group-hover:bg-primary/10 group-hover:scale-110 transition-all duration-300">
                                <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                    이미지를 드래그하거나 클릭하세요
                                </p>
                                <p className="text-xs text-gray-500">
                                    PNG, JPG, GIF (최대 5MB)
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-2 text-sm text-red-400 flex items-center gap-1">
                    <X size={14} />
                    {error}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
