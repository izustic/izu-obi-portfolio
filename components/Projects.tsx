import React from 'react';
import Section from './Section';
import { RESUME_DATA } from '../constants';
import { ExternalLink, FolderGit2 } from 'lucide-react';

const Projects = () => {
  return (
    <Section id="projects" title="Featured Projects" className="bg-slate-50 dark:bg-slate-900/50">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {RESUME_DATA.projects.map((project, index) => (
          <div 
            key={index} 
            className="group relative bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full"
          >
            <div className="p-6 md:p-8 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl">
                    <FolderGit2 size={24} />
                 </div>
                 {project.link && (
                   <a 
                    href={project.link} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-primary-500 transition-colors"
                   >
                     <ExternalLink size={20} />
                   </a>
                 )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary-500 transition-colors">
                {project.name}
              </h3>
              
              {project.period && (
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4 block">
                  {project.period}
                </span>
              )}
              
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4 flex-1">
                {project.description}
              </p>
            </div>
            
            {/* Bottom decoration line */}
            <div className="h-1 w-0 group-hover:w-full bg-primary-500 transition-all duration-500 ease-out"></div>
          </div>
        ))}
      </div>
    </Section>
  );
};

export default Projects;