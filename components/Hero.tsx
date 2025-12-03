import React, { useState, useEffect } from 'react';
import { RESUME_DATA } from '../constants';
import { ArrowRight, Terminal, Globe } from 'lucide-react';

const Cursor = ({ active }: { active: boolean }) => (
  <span 
    className={`inline-block w-1 h-[1em] bg-primary-500 ml-1 align-bottom ${active ? 'animate-pulse' : 'opacity-0'}`}
  />
);

const Hero = () => {
  const [textState, setTextState] = useState({
    line1: '',
    line2: '',
    line3: '',
    activeLine: 1 // 1 = Hi I'm, 2 = Name, 3 = Description, 4 = Done
  });

  useEffect(() => {
    const content = {
      line1: "Hi, I'm",
      line2: RESUME_DATA.name,
      line3: "With 3+ years of experience and 10+ completed projects, I create user-friendly digital products that solve hard-hitting problems. Let’s transform your ideas into impactful solutions."
    };

    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Typing parameters
    const speeds = {
      line1: 50,
      line2: 80,
      line3: 30
    };

    const typeLine1 = (index: number) => {
      if (index <= content.line1.length) {
        setTextState(prev => ({ ...prev, line1: content.line1.slice(0, index), activeLine: 1 }));
        timeoutId = setTimeout(() => typeLine1(index + 1), speeds.line1);
      } else {
        timeoutId = setTimeout(() => typeLine2(0), 400); // Pause before next line
      }
    };

    const typeLine2 = (index: number) => {
      if (index <= content.line2.length) {
        setTextState(prev => ({ ...prev, line2: content.line2.slice(0, index), activeLine: 2 }));
        timeoutId = setTimeout(() => typeLine2(index + 1), speeds.line2);
      } else {
        timeoutId = setTimeout(() => typeLine3(0), 400);
      }
    };

    const typeLine3 = (index: number) => {
      if (index <= content.line3.length) {
        setTextState(prev => ({ ...prev, line3: content.line3.slice(0, index), activeLine: 3 }));
        timeoutId = setTimeout(() => typeLine3(index + 1), speeds.line3);
      } else {
        setTextState(prev => ({ ...prev, activeLine: 4 })); // Finished
      }
    };

    // Start typing after initial delay
    timeoutId = setTimeout(() => typeLine1(0), 500);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <section id="about" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
      
      {/* Background Decor */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl -z-10 animate-pulse-slow" style={{ animationDelay: '1s'}}></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
        
        {/* Text Content */}
        <div className="order-2 md:order-1 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-semibold animate-fade-in-up">
            <Terminal size={14} />
            <span>Frontend Developer</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 dark:text-white leading-tight min-h-[160px] md:min-h-[auto]">
            {textState.line1}
            {textState.activeLine === 1 && <Cursor active={true} />}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-blue-400">
              {textState.line2}
            </span>
            {textState.activeLine === 2 && <Cursor active={true} />}
          </h1>
          
          <div className="min-h-[100px] md:min-h-[80px]">
             <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
              {textState.line3}
              {textState.activeLine === 3 && <Cursor active={true} />}
            </p>
          </div>

          <div className={`flex flex-col sm:flex-row gap-4 pt-4 transition-opacity duration-1000 ${textState.activeLine >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            <a 
              href="#projects" 
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30"
            >
              View My Work
              <ArrowRight size={18} className="ml-2" />
            </a>
            <a 
              href="mailto:izuchukwuobi997@gmail.com"
              className="inline-flex items-center justify-center px-6 py-3 border border-slate-300 dark:border-slate-700 text-base font-medium rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Contact Me
            </a>
          </div>
        </div>

        {/* Visual / Image */}
        <div className="order-1 md:order-2 flex justify-center animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="relative w-64 h-64 md:w-96 md:h-96">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-cyan-400 rounded-2xl rotate-6 opacity-20 blur-lg"></div>
            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl overflow-hidden flex items-center justify-center group">
               <img 
                 src="https://github.com/izustic.png" 
                 alt="Izuchukwu Obi" 
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-90 hover:opacity-100 grayscale hover:grayscale-0"
               />
            </div>
            {/* Floating Badges */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-dark-card p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3">
               <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg text-green-600 dark:text-green-400">
                  <Globe size={20} />
               </div>
               <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Located in</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Lagos, Nigeria</p>
               </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;