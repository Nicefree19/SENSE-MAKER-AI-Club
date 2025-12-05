import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { profilesApi } from '../lib/database';
import { User } from 'lucide-react';

const ActiveMembers = () => {
    const [members, setMembers] = useState([]);

    useEffect(() => {
        const loadMembers = async () => {
            try {
                const data = await profilesApi.getAll();
                // Show up to 8 members
                setMembers(data?.slice(0, 8) || []);
            } catch (err) {
                console.error('Failed to load members', err);
            }
        };
        loadMembers();
    }, []);

    if (members.length === 0) return null;

    return (
        <section className="py-20 border-t border-white/5 bg-dark-bg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    <h2 className="text-2xl font-bold text-white mb-8">Meet our Builders</h2>

                    <div className="flex flex-wrap justify-center gap-6">
                        {members.map((member, index) => (
                            <motion.div
                                key={member.id}
                                initial={{ opacity: 0, scale: 0.5 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative"
                            >
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-primary transition-colors">
                                    {member.avatar_url ? (
                                        <img
                                            src={member.avatar_url}
                                            alt={member.full_name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-dark-surface flex items-center justify-center text-gray-400">
                                            <User size={24} />
                                        </div>
                                    )}
                                </div>
                                {/* Tooltip */}
                                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-xs text-white bg-black/80 px-2 py-1 rounded pointer-events-none">
                                    {member.full_name}
                                </div>
                            </motion.div>
                        ))}
                        {members.length >= 8 && (
                            <div className="w-16 h-16 rounded-full bg-dark-surface border border-white/10 flex items-center justify-center text-gray-400 text-sm font-medium">
                                +More
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default ActiveMembers;
