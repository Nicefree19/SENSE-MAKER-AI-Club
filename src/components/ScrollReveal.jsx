import React from 'react';
import { motion } from 'framer-motion';

const ScrollReveal = ({ children, width = "100%", delay = 0 }) => {
    return (
        <div style={{ width, overflow: "hidden" }}>
            <motion.div
                variants={{
                    hidden: { opacity: 0, y: 75 },
                    visible: { opacity: 1, y: 0 },
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: delay }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollReveal;
