import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Link2, Check, Linkedin, Mail } from 'lucide-react';

const ShareButtons = ({
    url,
    title,
    description = '',
    showLabel = false,
    size = 'default'
}) => {
    const [copied, setCopied] = useState(false);

    const shareUrl = url || window.location.href;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(title || document.title);
    const encodedDescription = encodeURIComponent(description);

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleShare = (platform) => {
        window.open(shareLinks[platform], '_blank', 'width=600,height=400');
    };

    const sizeClasses = {
        small: 'p-1.5',
        default: 'p-2',
        large: 'p-3'
    };

    const iconSizes = {
        small: 14,
        default: 18,
        large: 24
    };

    const buttons = [
        {
            name: 'Twitter',
            icon: <Twitter size={iconSizes[size]} />,
            action: () => handleShare('twitter'),
            color: 'hover:text-blue-400'
        },
        {
            name: 'Facebook',
            icon: <Facebook size={iconSizes[size]} />,
            action: () => handleShare('facebook'),
            color: 'hover:text-blue-600'
        },
        {
            name: 'LinkedIn',
            icon: <Linkedin size={iconSizes[size]} />,
            action: () => handleShare('linkedin'),
            color: 'hover:text-blue-500'
        },
        {
            name: 'Email',
            icon: <Mail size={iconSizes[size]} />,
            action: () => handleShare('email'),
            color: 'hover:text-green-400'
        },
        {
            name: copied ? '복사됨!' : '링크 복사',
            icon: copied ? <Check size={iconSizes[size]} /> : <Link2 size={iconSizes[size]} />,
            action: handleCopyLink,
            color: copied ? 'text-green-400' : 'hover:text-primary'
        }
    ];

    return (
        <div className="flex items-center gap-1">
            {showLabel && (
                <span className="text-sm text-gray-500 mr-2 flex items-center gap-1">
                    <Share2 size={14} />
                    공유
                </span>
            )}
            {buttons.map((button) => (
                <button
                    key={button.name}
                    onClick={button.action}
                    className={`${sizeClasses[size]} rounded-lg text-gray-500 transition-colors ${button.color}`}
                    title={button.name}
                >
                    {button.icon}
                </button>
            ))}
        </div>
    );
};

export default ShareButtons;
