import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

/**
 * Enhanced Global Error Boundary
 * - 사용자 친화적 에러 UI
 * - 에러 복구 옵션 제공
 * - 개발/프로덕션 모드 구분
 * - 에러 리포팅 지원
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        };
    }

    static getDerivedStateFromError(error) {
        // 에러 ID 생성 (디버깅용)
        const errorId = `ERR-${Date.now().toString(36).toUpperCase()}`;
        return { hasError: true, errorId };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({ error, errorInfo });

        // 에러 로깅 (프로덕션에서는 외부 서비스로 전송 가능)
        const errorLog = {
            errorId: this.state.errorId,
            message: error?.message,
            stack: error?.stack,
            componentStack: errorInfo?.componentStack,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        console.error('[ErrorBoundary] Caught error:', errorLog);

        // TODO: Sentry, LogRocket 등 에러 리포팅 서비스 연동
        // reportErrorToService(errorLog);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: null
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            const isDev = import.meta.env.DEV;

            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                    <div className="max-w-lg w-full">
                        {/* 에러 카드 */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
                            {/* 아이콘 */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
                                    <AlertTriangle className="w-10 h-10 text-red-400" />
                                </div>
                            </div>

                            {/* 제목 */}
                            <h1 className="text-2xl font-bold text-white text-center mb-2">
                                문제가 발생했습니다
                            </h1>

                            <p className="text-slate-400 text-center mb-6">
                                예상치 못한 오류가 발생했습니다.
                                <br />
                                잠시 후 다시 시도해 주세요.
                            </p>

                            {/* 에러 ID */}
                            {this.state.errorId && (
                                <div className="bg-slate-900/50 rounded-lg p-3 mb-6">
                                    <p className="text-xs text-slate-500 text-center">
                                        오류 코드: <span className="font-mono text-slate-400">{this.state.errorId}</span>
                                    </p>
                                </div>
                            )}

                            {/* 액션 버튼들 */}
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={this.handleReset}
                                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    다시 시도
                                </button>
                                <button
                                    onClick={this.handleGoHome}
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                                >
                                    <Home className="w-4 h-4" />
                                    홈으로
                                </button>
                            </div>

                            {/* 개발 모드: 상세 에러 정보 */}
                            {isDev && this.state.error && (
                                <details className="mt-6 text-left">
                                    <summary className="flex items-center gap-2 text-sm text-slate-500 cursor-pointer hover:text-slate-400">
                                        <Bug className="w-4 h-4" />
                                        개발자 정보 (Development Only)
                                    </summary>
                                    <div className="mt-3 bg-slate-900/80 rounded-lg p-4 overflow-auto max-h-60">
                                        <p className="text-red-400 font-mono text-sm mb-2">
                                            {this.state.error.toString()}
                                        </p>
                                        {this.state.errorInfo?.componentStack && (
                                            <pre className="text-xs text-slate-500 whitespace-pre-wrap">
                                                {this.state.errorInfo.componentStack}
                                            </pre>
                                        )}
                                    </div>
                                </details>
                            )}
                        </div>

                        {/* 하단 링크 */}
                        <p className="text-center text-slate-600 text-sm mt-6">
                            문제가 계속되면{' '}
                            <a
                                href="mailto:dhlee@senkuzo.com"
                                className="text-indigo-400 hover:text-indigo-300 underline"
                            >
                                관리자에게 문의
                            </a>
                            해 주세요.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
