export interface Experience {
  role: string;
  company: string;
  period: string;
  location: string;
  achievements: string[];
}

export interface Project {
  name: string;
  period?: string;
  description: string;
  tech?: string;
  link?: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface Certificate {
  name: string;
  issuer: string;
  link?: string;
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
}

export interface ProfileData {
  name: string;
  role: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    website: string;
    linkedin: string;
    github: string;
  };
  summary: string[];
  experience: Experience[];
  skills: SkillCategory[];
  projects: Project[];
  education: Education[];
  certificates: Certificate[];
}