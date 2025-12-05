import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';

const TagInput = ({ value, onChange, placeholder = "Add a tag..." }) => {
    const [tags, setTags] = useState([]);
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (value) {
            // Convert string "a, b, c" to array ["a", "b", "c"]
            const tagArray = typeof value === 'string'
                ? value.split(',').map(t => t.trim()).filter(Boolean)
                : value;
            setTags(tagArray);
        } else {
            setTags([]);
        }
    }, [value]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag();
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            removeTag(tags.length - 1);
        }
    };

    const addTag = () => {
        const trimmed = inputValue.trim();
        if (trimmed && !tags.includes(trimmed)) {
            const newTags = [...tags, trimmed];
            setTags(newTags);
            setInputValue('');
            // Return as comma-separated string to parent
            onChange(newTags.join(', '));
        }
    };

    const removeTag = (index) => {
        const newTags = tags.filter((_, i) => i !== index);
        setTags(newTags);
        onChange(newTags.join(', '));
    };

    return (
        <div className="flex flex-wrap items-center gap-2 p-2 bg-dark-bg border border-white/10 rounded-lg focus-within:border-primary transition-colors">
            {tags.map((tag, index) => (
                <span key={index} className="flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary-light text-sm rounded-md animate-fadeIn">
                    <span># {tag}</span>
                    <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="hover:text-white focus:outline-none"
                    >
                        <X size={14} />
                    </button>
                </span>
            ))}
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={addTag}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 min-w-[120px]"
                placeholder={tags.length === 0 ? placeholder : ""}
            />
            <button
                type="button"
                onClick={addTag}
                className={`p-1 rounded-full hover:bg-white/10 text-gray-400 transition-colors ${!inputValue && 'opacity-0 pointer-events-none'}`}
            >
                <Plus size={16} />
            </button>
        </div>
    );
};

export default TagInput;
