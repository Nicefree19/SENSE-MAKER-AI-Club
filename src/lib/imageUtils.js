/**
 * Image Optimization Utilities
 * Supabase Storage 이미지 최적화 및 관리
 */

import { supabase } from './supabase';

// ============================================
// 이미지 URL 변환 유틸리티
// ============================================

/**
 * Supabase 이미지 URL에 변환 파라미터 추가
 * @param {string} url - 원본 이미지 URL
 * @param {object} options - 변환 옵션
 * @returns {string} 변환된 이미지 URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
    if (!url) return '';

    // Supabase Storage URL인지 확인
    const isSupabaseUrl = url.includes('supabase.co/storage');

    if (!isSupabaseUrl) {
        return url;
    }

    const {
        width,
        height,
        quality = 80,
        format = 'webp',
        resize = 'cover'
    } = options;

    // URL 객체로 파싱
    const urlObj = new URL(url);

    // 변환 파라미터 추가
    if (width) urlObj.searchParams.set('width', width);
    if (height) urlObj.searchParams.set('height', height);
    urlObj.searchParams.set('quality', quality);
    urlObj.searchParams.set('format', format);
    urlObj.searchParams.set('resize', resize);

    return urlObj.toString();
};

/**
 * 미리 정의된 이미지 크기 프리셋
 */
export const IMAGE_PRESETS = {
    thumbnail: { width: 150, height: 150, quality: 70 },
    small: { width: 300, height: 300, quality: 75 },
    medium: { width: 600, height: 400, quality: 80 },
    large: { width: 1200, height: 800, quality: 85 },
    avatar: { width: 100, height: 100, quality: 80, resize: 'cover' },
    avatarLarge: { width: 200, height: 200, quality: 85, resize: 'cover' },
    card: { width: 400, height: 300, quality: 80, resize: 'cover' },
    hero: { width: 1920, height: 1080, quality: 90 },
    og: { width: 1200, height: 630, quality: 90 }  // Open Graph
};

/**
 * 프리셋을 사용한 이미지 URL 변환
 * @param {string} url - 원본 이미지 URL
 * @param {string} preset - 프리셋 이름
 * @returns {string} 변환된 이미지 URL
 */
export const getPresetImageUrl = (url, preset) => {
    const options = IMAGE_PRESETS[preset];
    if (!options) {
        console.warn(`Unknown image preset: ${preset}`);
        return url;
    }
    return getOptimizedImageUrl(url, options);
};

// ============================================
// 이미지 업로드 유틸리티
// ============================================

/**
 * 이미지 파일 유효성 검사
 * @param {File} file - 파일 객체
 * @param {object} options - 검사 옵션
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateImageFile = (file, options = {}) => {
    const {
        maxSize = 5 * 1024 * 1024,  // 5MB 기본값
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        minWidth = 0,
        minHeight = 0,
        maxWidth = 4096,
        maxHeight = 4096
    } = options;

    // 파일 타입 검사
    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: `지원하지 않는 파일 형식입니다. (${allowedTypes.map(t => t.split('/')[1]).join(', ')} 가능)`
        };
    }

    // 파일 크기 검사
    if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        return {
            valid: false,
            error: `파일 크기가 ${maxSizeMB}MB를 초과합니다.`
        };
    }

    return { valid: true };
};

/**
 * 클라이언트 측 이미지 리사이즈
 * @param {File} file - 원본 파일
 * @param {object} options - 리사이즈 옵션
 * @returns {Promise<Blob>} 리사이즈된 이미지 Blob
 */
export const resizeImage = (file, options = {}) => {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.85,
        type = 'image/jpeg'
    } = options;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            let { width, height } = img;

            // 비율 유지하면서 리사이즈
            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }
            if (height > maxHeight) {
                width = (width * maxHeight) / height;
                height = maxHeight;
            }

            // Canvas로 리사이즈
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('이미지 변환에 실패했습니다.'));
                    }
                },
                type,
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('이미지를 불러올 수 없습니다.'));
        };

        img.src = url;
    });
};

/**
 * 이미지 업로드 (최적화 포함)
 * @param {File} file - 파일 객체
 * @param {object} options - 업로드 옵션
 * @returns {Promise<{ url: string, path: string }>}
 */
export const uploadOptimizedImage = async (file, options = {}) => {
    const {
        bucket = 'images',
        folder = '',
        resize = true,
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.85
    } = options;

    // 유효성 검사
    const validation = validateImageFile(file);
    if (!validation.valid) {
        throw new Error(validation.error);
    }

    // 리사이즈 (옵션에 따라)
    let uploadFile = file;
    if (resize && (file.type === 'image/jpeg' || file.type === 'image/png')) {
        try {
            const resizedBlob = await resizeImage(file, { maxWidth, maxHeight, quality });
            uploadFile = new File([resizedBlob], file.name, { type: file.type });
        } catch (err) {
            console.warn('이미지 리사이즈 실패, 원본 업로드:', err);
        }
    }

    // 파일명 생성
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('인증이 필요합니다.');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = folder ? `${user.id}/${folder}/${fileName}` : `${user.id}/${fileName}`;

    // 업로드
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, uploadFile, {
            cacheControl: '31536000',  // 1년 캐시
            upsert: false
        });

    if (error) throw error;

    // Public URL 생성
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

    return {
        url: publicUrl,
        path: data.path
    };
};

// ============================================
// 이미지 컴포넌트 헬퍼
// ============================================

/**
 * srcset 생성 (반응형 이미지용)
 * @param {string} url - 원본 이미지 URL
 * @param {number[]} widths - 너비 배열
 * @returns {string} srcset 문자열
 */
export const generateSrcSet = (url, widths = [320, 640, 960, 1280, 1920]) => {
    if (!url) return '';

    return widths
        .map(w => `${getOptimizedImageUrl(url, { width: w })} ${w}w`)
        .join(', ');
};

/**
 * 플레이스홀더 이미지 URL 생성
 * @param {number} width
 * @param {number} height
 * @param {string} text
 * @returns {string}
 */
export const getPlaceholderUrl = (width = 400, height = 300, text = '') => {
    const encodedText = encodeURIComponent(text || `${width}×${height}`);
    return `https://via.placeholder.com/${width}x${height}/1e293b/64748b?text=${encodedText}`;
};

/**
 * 아바타 플레이스홀더 URL 생성
 * @param {string} name - 사용자 이름
 * @param {number} size - 아바타 크기
 * @returns {string}
 */
export const getAvatarPlaceholder = (name = '', size = 100) => {
    const encodedName = encodeURIComponent(name || 'User');
    return `https://ui-avatars.com/api/?name=${encodedName}&size=${size}&background=6366f1&color=ffffff&bold=true`;
};

// ============================================
// 이미지 로딩 유틸리티
// ============================================

/**
 * 이미지 프리로드
 * @param {string[]} urls - 이미지 URL 배열
 * @returns {Promise<void[]>}
 */
export const preloadImages = (urls) => {
    return Promise.all(
        urls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve();
                img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
                img.src = url;
            });
        })
    );
};

/**
 * 이미지 존재 여부 확인
 * @param {string} url - 이미지 URL
 * @returns {Promise<boolean>}
 */
export const checkImageExists = (url) => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
};

export default {
    getOptimizedImageUrl,
    getPresetImageUrl,
    IMAGE_PRESETS,
    validateImageFile,
    resizeImage,
    uploadOptimizedImage,
    generateSrcSet,
    getPlaceholderUrl,
    getAvatarPlaceholder,
    preloadImages,
    checkImageExists
};
