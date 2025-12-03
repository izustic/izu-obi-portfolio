import React from 'react';
import Section from './Section';
import { RESUME_DATA } from '../constants';
import { Code2, Database, Smartphone, Layout, Link, Wrench } from 'lucide-react';

const getIcon = (category: string) => {
  if (category.includes('Mobile')) return <Smartphone size={20} />;
  if (category.includes('Frontend')) return <Layout size={20} />;
  if (category.includes('Cloud')) return <Database size={20} />;
  if (category.includes('Blockchain')) return <Link size={20} />;
  return <Wrench size={20} />;
};

const Skills = () => {
  return (
    <Section id="skills" title="Technical Skills">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {RESUME_DATA.skills.map((cat, index) => (
          <div 
            key={index} 
            className="p-6 rounded-2xl bg-white dark:bg-dark-card border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-primary-500/30 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4 text-primary-600 dark:text-primary-400">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                {getIcon(cat.category)}
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">{cat.category}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Skills;