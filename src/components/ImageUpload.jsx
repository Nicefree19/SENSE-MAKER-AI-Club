import React, { useState, useRef } from 'react';
import { storageApi } from '../lib/database';
import { Upload, X, Loader2, Image as ImageIcon, AlertCircle } from 'lucide-react';

const ImageUpload = ({
    onUpload,
    currentImageUrl,
    folder = 'images',
    accept = 'image/*',
    maxSize = 5 * 1024 * 1024, // 5MB
    className = ''
}) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(currentImageUrl || null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size
        if (file.size > maxSize) {
            setError(`파일 크기는 ${maxSize / (1024 * 1024)}MB를 초과할 수 없습니다.`);
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('이미지 파일만 업로드할 수 있습니다.');
            return;
        }

        try {
            setUploading(true);
            setError(null);

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target.result);
            reader.readAsDataURL(file);

            // Upload to Supabase Storage
            const url = await storageApi.uploadImage(file, folder);

            if (onUpload) {
                onUpload(url);
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setError('이미지 업로드에 실패했습니다: ' + err.message);
            setPreview(currentImageUrl || null);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (preview && preview !== currentImageUrl) {
            try {
                // Extract file path from URL and delete
                const urlParts = preview.split('/storage/v1/object/public/');
                if (urlParts[1]) {
                    await storageApi.deleteImage(urlParts[1]);
                }
            } catch (err) {
                console.error('Delete failed:', err);
            }
        }
        setPreview(null);
        if (onUpload) {
            onUpload(null);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className={`${className}`}>
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
            />

            {error && (
                <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {preview ? (
                <div className="relative group">
                    <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-white/10"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-4">
                        <button
                            type="button"
                            onClick={handleClick}
                            disabled={uploading}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        >
                            <Upload size={20} className="text-white" />
                        </button>
                        <button
                            type="button"
                            onClick={handleRemove}
                            disabled={uploading}
                            className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-full transition-colors"
                        >
                            <X size={20} className="text-white" />
                        </button>
                    </div>
                    {uploading && (
                        <div className="absolute inset-0 bg-black/70 rounded-lg flex items-center justify-center">
                            <Loader2 size={32} className="animate-spin text-primary" />
                        </div>
                    )}
                </div>
            ) : (
                <button
                    type="button"
                    onClick={handleClick}
                    disabled={uploading}
                    className="w-full h-48 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center gap-3 text-gray-400 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <>
                            <Loader2 size={32} className="animate-spin" />
                            <span>업로드 중...</span>
                        </>
                    ) : (
                        <>
                            <ImageIcon size={32} />
                            <span>이미지를 선택하거나 드래그하세요</span>
                            <span className="text-xs text-gray-500">
                                최대 {maxSize / (1024 * 1024)}MB, JPG/PNG/GIF
                            </span>
                        </>
                    )}
                </button>
            )}
        </div>
    );
};

export default ImageUpload;
