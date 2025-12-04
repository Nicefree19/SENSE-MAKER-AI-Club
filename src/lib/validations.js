import { z } from 'zod';

/**
 * Zod Validation Schemas
 * 모든 입력 데이터 검증을 위한 스키마 정의
 */

// ============================================
// 공통 스키마
// ============================================

// 이메일 스키마
export const emailSchema = z
    .string()
    .min(1, '이메일을 입력해주세요')
    .email('올바른 이메일 형식이 아닙니다');

// 비밀번호 스키마
export const passwordSchema = z
    .string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다')
    .max(72, '비밀번호는 최대 72자까지 가능합니다');

// 강력한 비밀번호 스키마
export const strongPasswordSchema = z
    .string()
    .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
    .max(72, '비밀번호는 최대 72자까지 가능합니다')
    .regex(/[A-Z]/, '대문자를 최소 1개 포함해야 합니다')
    .regex(/[a-z]/, '소문자를 최소 1개 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 최소 1개 포함해야 합니다');

// URL 스키마 (선택적)
export const optionalUrlSchema = z
    .string()
    .url('올바른 URL 형식이 아닙니다')
    .optional()
    .or(z.literal(''));

// ============================================
// 인증 관련 스키마
// ============================================

// 로그인 스키마
export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, '비밀번호를 입력해주세요')
});

// 회원가입 스키마
export const signUpSchema = z.object({
    fullName: z
        .string()
        .min(2, '이름은 최소 2자 이상이어야 합니다')
        .max(50, '이름은 최대 50자까지 가능합니다'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['confirmPassword']
});

// ============================================
// 프로필 스키마
// ============================================

export const profileSchema = z.object({
    username: z
        .string()
        .min(2, '사용자명은 최소 2자 이상이어야 합니다')
        .max(30, '사용자명은 최대 30자까지 가능합니다')
        .regex(/^[a-zA-Z0-9_-]+$/, '영문, 숫자, -, _ 만 사용 가능합니다')
        .optional()
        .or(z.literal('')),
    fullName: z
        .string()
        .min(2, '이름은 최소 2자 이상이어야 합니다')
        .max(50, '이름은 최대 50자까지 가능합니다'),
    bio: z
        .string()
        .max(500, '자기소개는 최대 500자까지 가능합니다')
        .optional()
        .or(z.literal('')),
    website: optionalUrlSchema,
    github: z
        .string()
        .regex(/^[a-zA-Z0-9-]+$/, '올바른 GitHub 사용자명이 아닙니다')
        .optional()
        .or(z.literal('')),
    linkedin: optionalUrlSchema
});

// ============================================
// 프로젝트 스키마
// ============================================

export const projectStatusEnum = z.enum([
    'Planning',
    'In Progress',
    'Prototype',
    'Completed',
    'On Hold'
]);

export const projectSchema = z.object({
    title: z
        .string()
        .min(2, '프로젝트 제목은 최소 2자 이상이어야 합니다')
        .max(100, '프로젝트 제목은 최대 100자까지 가능합니다'),
    description: z
        .string()
        .min(10, '프로젝트 설명은 최소 10자 이상이어야 합니다')
        .max(10000, '프로젝트 설명은 최대 10000자까지 가능합니다'),
    status: projectStatusEnum.default('Planning'),
    techStack: z
        .string()
        .max(500, '기술 스택은 최대 500자까지 가능합니다')
        .optional()
        .or(z.literal('')),
    githubUrl: optionalUrlSchema,
    demoUrl: optionalUrlSchema,
    modelUrl: optionalUrlSchema
});

// ============================================
// 블로그 포스트 스키마
// ============================================

export const postSchema = z.object({
    title: z
        .string()
        .min(2, '제목은 최소 2자 이상이어야 합니다')
        .max(200, '제목은 최대 200자까지 가능합니다'),
    content: z
        .string()
        .min(10, '내용은 최소 10자 이상이어야 합니다')
        .max(50000, '내용은 최대 50000자까지 가능합니다'),
    tags: z
        .string()
        .max(200, '태그는 최대 200자까지 가능합니다')
        .optional()
        .or(z.literal('')),
    published: z.boolean().default(false)
});

// ============================================
// 댓글 스키마
// ============================================

export const commentSchema = z.object({
    content: z
        .string()
        .min(1, '댓글 내용을 입력해주세요')
        .max(2000, '댓글은 최대 2000자까지 가능합니다')
});

// ============================================
// 문의 스키마
// ============================================

export const contactSchema = z.object({
    name: z
        .string()
        .min(2, '이름은 최소 2자 이상이어야 합니다')
        .max(50, '이름은 최대 50자까지 가능합니다'),
    email: emailSchema,
    message: z
        .string()
        .min(10, '메시지는 최소 10자 이상이어야 합니다')
        .max(2000, '메시지는 최대 2000자까지 가능합니다')
});

// ============================================
// 검색/필터 스키마
// ============================================

export const searchSchema = z.object({
    query: z.string().max(100, '검색어는 최대 100자까지 가능합니다').optional(),
    page: z.coerce.number().positive().default(1),
    limit: z.coerce.number().min(1).max(100).default(12)
});

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 스키마 검증 함수
 * @param {z.ZodSchema} schema - Zod 스키마
 * @param {object} data - 검증할 데이터
 * @returns {{ success: boolean, data?: object, errors?: object }}
 */
export const validate = (schema, data) => {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    // 에러를 필드별로 정리
    const errors = {};
    result.error.errors.forEach((err) => {
        const field = err.path.join('.');
        if (!errors[field]) {
            errors[field] = [];
        }
        errors[field].push(err.message);
    });

    return { success: false, errors };
};

/**
 * 단일 필드 검증 함수
 * @param {z.ZodSchema} schema - Zod 스키마
 * @param {any} value - 검증할 값
 * @returns {{ valid: boolean, error?: string }}
 */
export const validateField = (schema, value) => {
    const result = schema.safeParse(value);

    if (result.success) {
        return { valid: true };
    }

    return {
        valid: false,
        error: result.error.errors[0]?.message || '유효하지 않은 값입니다'
    };
};

/**
 * 폼 에러 메시지 추출 (첫 번째 에러만)
 * @param {object} errors - 에러 객체
 * @returns {string|null}
 */
export const getFirstError = (errors) => {
    if (!errors) return null;
    const firstField = Object.keys(errors)[0];
    if (!firstField) return null;
    return errors[firstField][0] || null;
};

/**
 * 한글 에러 메시지 변환
 * @param {string} message - 원본 에러 메시지
 * @returns {string}
 */
export const translateError = (message) => {
    const translations = {
        'Required': '필수 입력 항목입니다',
        'Invalid email': '올바른 이메일 형식이 아닙니다',
        'String must contain at least': '최소 글자 수를 충족해야 합니다',
        'Invalid url': '올바른 URL 형식이 아닙니다'
    };

    for (const [key, value] of Object.entries(translations)) {
        if (message.includes(key)) {
            return value;
        }
    }

    return message;
};

// ============================================
// React Hook용 유틸리티
// ============================================

/**
 * useForm과 함께 사용하기 위한 검증 리졸버
 * @param {z.ZodSchema} schema
 */
export const createResolver = (schema) => {
    return (data) => {
        const result = validate(schema, data);
        if (result.success) {
            return { values: result.data, errors: {} };
        }
        return { values: {}, errors: result.errors };
    };
};

export default {
    // 스키마
    loginSchema,
    signUpSchema,
    profileSchema,
    projectSchema,
    postSchema,
    commentSchema,
    contactSchema,
    searchSchema,
    // 유틸리티
    validate,
    validateField,
    getFirstError,
    translateError,
    createResolver
};
