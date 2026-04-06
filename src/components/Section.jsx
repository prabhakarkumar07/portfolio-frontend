/**
 * components/Section.js - Reusable section wrapper with scroll animation
 */

import React from 'react';
import { motion } from 'framer-motion';

const Section = ({ children, className = '', id, title, subtitle }) => {
  return (
    <section id={id} className={`py-20 px-4 sm:px-6 lg:px-8 ${className}`}>
      <div className="max-w-6xl mx-auto">
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            {title && <h2 className="section-title mb-4">{title}</h2>}
            {subtitle && <p className="section-subtitle max-w-2xl mx-auto">{subtitle}</p>}
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
