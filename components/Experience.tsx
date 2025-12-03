import React from 'react';
import Section from './Section';
import { RESUME_DATA } from '../constants';
import { Briefcase, Calendar, MapPin } from 'lucide-react';

const Experience = () => {
  return (
    <Section id="experience" title="Professional Experience" className="bg-slate-50/50 dark:bg-dark-bg">
      <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 md:ml-6 space-y-12">
        {RESUME_DATA.experience.map((exp, index) => (
          <div key={index} className="relative pl-8 md:pl-12 group">
            {/* Timeline Dot */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary-500 border-4 border-white dark:border-dark-bg group-hover:scale-125 transition-transform duration-300"></div>
            
            <div className="flex flex-col md:flex-row md:items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{exp.role}</h3>
                <h4 className="text-lg text-primary-600 dark:text-primary-400 font-medium">{exp.company}</h4>
              </div>
              <div className="flex flex-col md:items-end mt-2 md:mt-0 text-sm text-slate-500 dark:text-slate-400 space-y-1">
                <span className="flex items-center gap-1"><Calendar size={14} /> {exp.period}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {exp.location}</span>
              </div>
            </div>
            
            <ul className="mt-4 space-y-2 text-slate-600 dark:text-slate-300">
              {exp.achievements.map((achievement, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0"></span>
                  <span className="leading-relaxed">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Experience;