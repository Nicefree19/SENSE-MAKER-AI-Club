import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * Toast Context - 전역 토스트 알림 시스템
 */
const ToastContext = createContext(null);

// 토스트 타입별 스타일 및 아이콘
const TOAST_TYPES = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/30',
        iconColor: 'text-green-400',
        progressColor: 'bg-green-500'
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30',
        iconColor: 'text-red-400',
        progressColor: 'bg-red-500'
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/30',
        iconColor: 'text-yellow-400',
        progressColor: 'bg-yellow-500'
    },
    info: {
        icon: Info,
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        iconColor: 'text-blue-400',
        progressColor: 'bg-blue-500'
    }
};

// 개별 Toast 컴포넌트
const Toast = ({ id, type, title, message, duration, onClose }) => {
    const config = TOAST_TYPES[type] || TOAST_TYPES.info;
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className={`relative w-full max-w-sm ${config.bgColor} ${config.borderColor} border rounded-lg shadow-lg backdrop-blur-sm overflow-hidden`}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    {/* 아이콘 */}
                    <div className={`flex-shrink-0 ${config.iconColor}`}>
                        <Icon className="w-5 h-5" />
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                        {title && (
                            <p className="text-sm font-medium text-white">
                                {title}
                            </p>
                        )}
                        {message && (
                            <p className={`text-sm text-slate-300 ${title ? 'mt-1' : ''}`}>
                                {message}
                            </p>
                        )}
                    </div>

                    {/* 닫기 버튼 */}
                    <button
                        onClick={() => onClose(id)}
                        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 진행 바 */}
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: duration / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-1 ${config.progressColor}`}
            />
        </motion.div>
    );
};

// Toast Container 컴포넌트
const ToastContainer = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast
                            {...toast}
                            onClose={removeToast}
                        />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};

// Toast Provider
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((options) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const duration = options.duration || 5000;

        const toast = {
            id,
            type: options.type || 'info',
            title: options.title,
            message: options.message,
            duration
        };

        setToasts((prev) => [...prev, toast]);

        // 자동 제거
        setTimeout(() => {
            removeToast(id);
        }, duration);

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const removeAllToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // 편의 메서드들
    const toast = {
        success: (message, title) => addToast({ type: 'success', message, title }),
        error: (message, title) => addToast({ type: 'error', message, title }),
        warning: (message, title) => addToast({ type: 'warning', message, title }),
        info: (message, title) => addToast({ type: 'info', message, title }),
        custom: (options) => addToast(options),
        dismiss: removeToast,
        dismissAll: removeAllToasts
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    );
};

// useToast 훅
export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export default ToastContext;
