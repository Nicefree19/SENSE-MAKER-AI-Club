import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, ChevronRight, Bot } from 'lucide-react';

const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { type: 'bot', text: '안녕하세요! SENSE MAKER AI 어시스턴트입니다. 무엇을 도와드릴까요?', options: ['동아리 소개', '주요 프로젝트', '가입 문의', '기술 블로그'] }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleOptionClick = (option) => {
        addMessage('user', option);
        processResponse(option);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;
        addMessage('user', inputText);
        processResponse(inputText);
        setInputText('');
    };

    const addMessage = (type, text, options = null) => {
        setMessages(prev => [...prev, { type, text, options }]);
    };

    const processResponse = (input) => {
        setIsTyping(true);

        // Simulate AI thinking delay
        setTimeout(() => {
            let responseText = '';
            let responseOptions = null;

            if (input.includes('소개') || input.includes('동아리')) {
                responseText = 'SENSE MAKER는 구조 엔지니어링에 AI와 자동화 기술을 접목하여 혁신을 만들어가는 동아리입니다. 우리는 "AI, Automation, Application"이라는 3가지 핵심 가치를 추구합니다.';
                responseOptions = ['핵심 가치 더보기', '멤버 보기', '처음으로'];
            } else if (input.includes('프로젝트')) {
                responseText = '현재 진행 중인 흥미로운 프로젝트들이 많습니다! 특히 "ADS (벽체 강성 자동화)"와 "현장 대응 챗봇" 프로젝트가 주목받고 있습니다.';
                responseOptions = ['전체 프로젝트 보기', '3D 모델 예시', '처음으로'];
            } else if (input.includes('가입') || input.includes('문의')) {
                responseText = '저희와 함께하고 싶으신가요? 언제든 환영합니다! 아래 버튼을 통해 가입 신청을 하거나 문의 메시지를 남겨주세요.';
                responseOptions = ['가입 신청하기', '문의하기', '처음으로'];
            } else if (input.includes('블로그') || input.includes('기술')) {
                responseText = '동아리 멤버들이 공유한 최신 기술 인사이트를 확인해 보세요. 구조 공학부터 AI 개발까지 다양한 주제를 다룹니다.';
                responseOptions = ['최신 글 보기', '처음으로'];
            } else {
                responseText = '죄송합니다, 아직 배우고 있는 단계라 정확히 이해하지 못했어요. 아래 메뉴 중에서 선택해 주시겠어요?';
                responseOptions = ['동아리 소개', '주요 프로젝트', '가입 문의'];
            }

            setIsTyping(false);
            addMessage('bot', responseText, responseOptions);
        }, 1000);
    };

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-all duration-300 ${isOpen ? 'hidden' : 'flex'} bg-gradient-to-r from-primary to-accent text-white items-center justify-center`}
            >
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                <Bot size={28} />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-6 right-6 z-50 w-[350px] h-[500px] bg-dark-surface border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-primary/20 to-accent/20 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-white/10 rounded-full">
                                    <Sparkles size={18} className="text-accent-glow" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">SENSE MAKER AI</h3>
                                    <p className="text-xs text-green-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.type === 'user'
                                                ? 'bg-primary text-white rounded-tr-none'
                                                : 'bg-white/10 text-gray-200 rounded-tl-none'
                                            }`}
                                    >
                                        {msg.text}
                                    </div>

                                    {/* Options Chips */}
                                    {msg.options && (
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {msg.options.map((opt, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleOptionClick(opt)}
                                                    className="px-3 py-1.5 bg-white/5 hover:bg-accent/20 border border-white/10 hover:border-accent/50 rounded-full text-xs text-accent-glow transition-all flex items-center gap-1"
                                                >
                                                    {opt}
                                                    <ChevronRight size={10} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}

                            {isTyping && (
                                <div className="flex items-center gap-1 p-3 bg-white/10 rounded-2xl rounded-tl-none w-fit">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-3 border-t border-white/10 bg-black/20">
                            <div className="relative flex items-center">
                                <input
                                    type="text"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    placeholder="메시지를 입력하세요..."
                                    className="w-full bg-white/5 border border-white/10 rounded-full pl-4 pr-12 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 focus:bg-white/10 transition-all"
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="absolute right-1.5 p-1.5 bg-primary hover:bg-primary-dark rounded-full text-white disabled:opacity-50 disabled:hover:bg-primary transition-colors"
                                >
                                    <Send size={16} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistant;
