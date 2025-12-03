import React from 'react';
import Section from './Section';
import { RESUME_DATA } from '../constants';
import { Award, GraduationCap } from 'lucide-react';

const Education = () => {
  return (
    <Section id="education">
      <div className="grid md:grid-cols-2 gap-16">
        {/* Education Column */}
        <div>
          <h3 className="flex items-center gap-3 text-2xl font-bold mb-8 text-slate-900 dark:text-white">
            <GraduationCap className="text-primary-500" /> Education
          </h3>
          <div className="space-y-6">
            {RESUME_DATA.education.map((edu, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-bold text-lg text-slate-900 dark:text-white">{edu.institution}</h4>
                <p className="text-primary-600 dark:text-primary-400 font-medium">{edu.degree}</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{edu.location}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certificates Column */}
        <div>
          <h3 className="flex items-center gap-3 text-2xl font-bold mb-8 text-slate-900 dark:text-white">
            <Award className="text-primary-500" /> Certificates
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {RESUME_DATA.certificates.map((cert, idx) => (
              <div key={idx} className="bg-white dark:bg-dark-card p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:border-primary-500/50 transition-colors h-full">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{cert.name}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">{cert.issuer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default Education;