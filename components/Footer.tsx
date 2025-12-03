import React from 'react';
import { RESUME_DATA, SOCIAL_LINKS } from '../constants';

const Footer = () => {
  return (
    <footer id="contact" className="bg-white dark:bg-dark-card border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Let's Connect</h2>
            <p className="text-slate-600 dark:text-slate-400 max-w-md">
              Currently open to new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
            </p>
          </div>

          <div className="flex gap-4">
            {SOCIAL_LINKS.map((link, idx) => (
              <a 
                key={idx} 
                href={link.href}
                className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-primary-500 hover:text-white dark:hover:bg-primary-600 transition-all duration-300 shadow-sm"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} {RESUME_DATA.name}. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built with React & Tailwind CSS</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;