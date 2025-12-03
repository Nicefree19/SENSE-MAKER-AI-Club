import React from 'react';
import { Github, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-dark-surface border-t border-white/10 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <p className="text-gray-400 text-sm">
                        &copy; 2025 SENSE MAKER. All rights reserved.
                    </p>
                    <p className="text-gray-600 text-xs mt-1">
                        Based on SEN Structure Internal Presentation [Cite: 5]
                    </p>
                </div>
                <div className="flex space-x-6">
                    <a href="https://thoracic-text-b95.notion.site/2bdf1eb800bb8029a547d2f22533e9d7?v=2bdf1eb800bb805fb474000c20e1f43a&p=2bdf1eb800bb806395e2d1c2718d13b5&pm=s" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28.047-.326L19.61.968c-.047-.233-.28-.326-.56-.28L6.234 2.274c-.653.046-.886.373-1.775-.98L2.266.735c-.233-.186-.56 0-.466.466l1.866 2.612c.187.28.374.327.793.396zM7.635 6.54l-2.8 14.18c-.094.467.14.933.7.886l14.18-1.213c.56-.046.746-.466.84-.933l2.24-12.266c.093-.466-.14-.793-.653-.746L7.915 7.66c-.373.047-.373.047-.28-1.12z" />
                        </svg>
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        <Github size={20} />
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                        <Linkedin size={20} />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
