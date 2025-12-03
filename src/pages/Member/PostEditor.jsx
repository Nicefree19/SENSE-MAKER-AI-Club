import React, { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import MemberLayout from '../../components/MemberLayout';
import SEO from '../../components/SEO';

const PostEditor = () => {
    const [title, setTitle] = useState('');
    const [value, setValue] = useState("**Hello world!!!**");

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('블로그 글이 저장되었습니다! (데모)');
    };

    return (
        <MemberLayout>
            <SEO title="새 글 쓰기" description="기술 블로그에 새로운 글을 작성합니다." />

            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white">새 글 쓰기</h1>
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-green-500/20"
                    >
                        발행하기
                    </button>
                </div>

                <div className="space-y-6">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-4xl font-bold text-white placeholder-gray-600 border-none focus:outline-none focus:ring-0"
                        placeholder="제목을 입력하세요..."
                    />

                    <div data-color-mode="dark">
                        <MDEditor
                            value={value}
                            onChange={setValue}
                            height={500}
                            style={{ backgroundColor: '#1E293B', color: '#fff' }}
                        />
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
};

export default PostEditor;
