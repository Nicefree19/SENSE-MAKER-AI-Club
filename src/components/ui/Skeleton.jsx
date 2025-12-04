import React from 'react';
import { twMerge } from 'tailwind-merge';

/**
 * Skeleton UI Components
 * 로딩 상태를 위한 플레이스홀더 컴포넌트들
 */

// 기본 스켈레톤 베이스
export const Skeleton = ({ className, ...props }) => {
    return (
        <div
            className={twMerge(
                'animate-pulse bg-slate-700/50 rounded',
                className
            )}
            {...props}
        />
    );
};

// 텍스트 스켈레톤
export const SkeletonText = ({ lines = 3, className }) => {
    return (
        <div className={twMerge('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={twMerge(
                        'h-4',
                        i === lines - 1 ? 'w-3/4' : 'w-full'
                    )}
                />
            ))}
        </div>
    );
};

// 아바타 스켈레톤
export const SkeletonAvatar = ({ size = 'md', className }) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16'
    };

    return (
        <Skeleton
            className={twMerge('rounded-full', sizes[size], className)}
        />
    );
};

// 카드 스켈레톤
export const SkeletonCard = ({ className }) => {
    return (
        <div className={twMerge(
            'bg-slate-800/50 border border-slate-700/50 rounded-xl p-4',
            className
        )}>
            {/* 이미지 영역 */}
            <Skeleton className="w-full h-40 rounded-lg mb-4" />

            {/* 제목 */}
            <Skeleton className="h-6 w-3/4 mb-2" />

            {/* 설명 */}
            <SkeletonText lines={2} className="mb-4" />

            {/* 태그들 */}
            <div className="flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
            </div>
        </div>
    );
};

// 프로젝트 카드 스켈레톤
export const SkeletonProjectCard = ({ className }) => {
    return (
        <div className={twMerge(
            'bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden',
            className
        )}>
            {/* 썸네일 */}
            <Skeleton className="w-full h-48" />

            <div className="p-5">
                {/* 상태 배지 */}
                <Skeleton className="h-5 w-20 rounded-full mb-3" />

                {/* 제목 */}
                <Skeleton className="h-6 w-4/5 mb-2" />

                {/* 설명 */}
                <SkeletonText lines={2} className="mb-4" />

                {/* 기술 스택 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    <Skeleton className="h-6 w-16 rounded" />
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="h-6 w-14 rounded" />
                </div>

                {/* 작성자 */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-700/50">
                    <SkeletonAvatar size="sm" />
                    <Skeleton className="h-4 w-24" />
                </div>
            </div>
        </div>
    );
};

// 블로그 포스트 스켈레톤
export const SkeletonPostCard = ({ className }) => {
    return (
        <div className={twMerge(
            'bg-slate-800/50 border border-slate-700/50 rounded-xl p-5',
            className
        )}>
            {/* 카테고리 */}
            <Skeleton className="h-5 w-16 rounded-full mb-3" />

            {/* 제목 */}
            <Skeleton className="h-7 w-full mb-2" />
            <Skeleton className="h-7 w-3/4 mb-3" />

            {/* 요약 */}
            <SkeletonText lines={2} className="mb-4" />

            {/* 메타 정보 */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                    <SkeletonAvatar size="sm" />
                    <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
                <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
        </div>
    );
};

// 테이블 스켈레톤
export const SkeletonTable = ({ rows = 5, cols = 4, className }) => {
    return (
        <div className={twMerge('overflow-hidden rounded-lg border border-slate-700/50', className)}>
            {/* 헤더 */}
            <div className="bg-slate-800/80 px-4 py-3 flex gap-4">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>

            {/* 행들 */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div
                    key={rowIndex}
                    className="px-4 py-3 flex gap-4 border-t border-slate-700/30"
                >
                    {Array.from({ length: cols }).map((_, colIndex) => (
                        <Skeleton key={colIndex} className="h-4 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
};

// 프로필 스켈레톤
export const SkeletonProfile = ({ className }) => {
    return (
        <div className={twMerge('flex items-center gap-4', className)}>
            <SkeletonAvatar size="xl" />
            <div className="flex-1">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-48 mb-1" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
};

// 통계 카드 스켈레톤
export const SkeletonStatCard = ({ className }) => {
    return (
        <div className={twMerge(
            'bg-slate-800/50 border border-slate-700/50 rounded-xl p-5',
            className
        )}>
            <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
        </div>
    );
};

// 댓글 스켈레톤
export const SkeletonComment = ({ className }) => {
    return (
        <div className={twMerge('flex gap-3', className)}>
            <SkeletonAvatar size="md" />
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <SkeletonText lines={2} />
            </div>
        </div>
    );
};

// 리스트 아이템 스켈레톤
export const SkeletonListItem = ({ className }) => {
    return (
        <div className={twMerge(
            'flex items-center gap-4 p-4 bg-slate-800/30 rounded-lg',
            className
        )}>
            <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg flex-shrink-0" />
        </div>
    );
};

// 그리드 스켈레톤 (여러 카드)
export const SkeletonGrid = ({ count = 6, CardComponent = SkeletonCard, className }) => {
    return (
        <div className={twMerge(
            'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
            className
        )}>
            {Array.from({ length: count }).map((_, i) => (
                <CardComponent key={i} />
            ))}
        </div>
    );
};

export default Skeleton;
