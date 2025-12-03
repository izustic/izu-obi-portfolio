import { ProfileData } from './types';
import { Github, Linkedin, Mail, Globe, MapPin, Phone } from 'lucide-react';
import React from 'react';

export const RESUME_DATA: ProfileData = {
  name: "Izuchukwu Obi",
  role: "Frontend Developer",
  contact: {
    email: "izuchukwuobi997@gmail.com",
    phone: "+2349034042761",
    location: "Lekki, Lagos, Nigeria",
    website: "https://izuportfolio.netlify.app",
    linkedin: "https://www.linkedin.com/in/izustic",
    github: "https://www.github.com/izustic"
  },
  summary: [
    "Frontend, mobile, and Blockchain developer skilled in React, Angular, React Native, Kotlin, Flutter, and Solidity.",
    "Specialized in building high-performance applications with responsive UI/UX design.",
    "Experienced in creating mission-critical solutions for banking and healthcare.",
    "Proficient in delivering scalable, user-centric products.",
    "Collaborative team player focused on exceptional mobile and web solutions."
  ],
  experience: [
    {
      role: "Software Engineer",
      company: "Ecobank Transnational Incorporated",
      period: "12/2023 – present",
      location: "Lagos, Nigeria",
      achievements: [
        "Collaborated with product teams to architect and build responsive enterprise banking solutions with Angular and React Native, delivering mobile-first experiences for small businesses.",
        "Drove customer success by shipping key features for the Ecobank Business App, contributing to 10,000+ active users in the first month.",
        "Developed a staff onboarding portal with Angular, streamlining Ecobank’s hiring process and HR integration.",
        "Spearheaded the customization of API Management Gateway on Azure, enhancing user interfaces with WordPress themes and React Widgets, boosting client satisfaction by 25%."
      ]
    },
    {
      role: "Frontend Developer",
      company: "Centbit",
      period: "07/2023 – 11/2023",
      location: "San Francisco, USA",
      achievements: [
        "Designed and built user-friendly, mobile-responsive web applications using Material UI and React, focusing on creating scalable, maintainable frontend codebases.",
        "Utilized AWS services to deploy and manage frontend projects, ensuring high availability and performance across devices.",
        "Created reusable frontend components in React and improved code maintainability while working in an agile environment with rapid development cycles."
      ]
    },
    {
      role: "Full Stack Software Engineer",
      company: "Decagon Institute",
      period: "01/2023 – 07/2023",
      location: "Lagos, Nigeria",
      achievements: [
        "Led a team of seven engineers to develop a full-stack facility management application, focusing on mobile-first design using ReactJS and Node.js.",
        "Developed mobile-first web applications that achieved over 80% customer satisfaction through intuitive UI and seamless user experiences.",
        "Refactored frontend components to improve performance and responsiveness, optimizing mobile load times by 35%."
      ]
    }
  ],
  skills: [
    {
      category: "Mobile Development",
      skills: ["React Native", "Flutter", "Kotlin (XML, Jetpack Compose, KMP)"]
    },
    {
      category: "Frontend Technologies",
      skills: ["JavaScript (ES6+)", "Angular", "React", "TypeScript", "Material UI", "Tailwind"]
    },
    {
      category: "Cloud & DevOps",
      skills: ["AWS", "Docker", "API Integration (REST, GraphQL)", "CI/CD (Jenkins, GitHub Actions)"]
    },
    {
      category: "Blockchain",
      skills: ["Solidity", "Smart Contracts", "dApps Integration"]
    },
    {
      category: "Testing & Tools",
      skills: ["Jest", "Git", "GitHub", "GitLab", "Figma", "Generative AI"]
    }
  ],
  projects: [
    {
      name: "Ecobank Business App",
      period: "06/2024 – present",
      description: "Built with Kotlin and Jetpack Compose, the app connects vendors with customers, offering a seamless marketplace experience. Leveraged Kotlin Multiplatform (KMP) to ensure code reusability across Android and iOS.",
      link: "https://play.google.com/store/search?q=ecobank+business+app&c=apps&hl=en" // Placeholder as link in PDF is generic icon
    },
    {
      name: "Ecobank Web Portal",
      period: "10/2024 – present",
      description: "Developed a document upload portal to streamline the web-based onboarding process for Ecobank Business App customers.",
      link: "https://business.ecobank.com/ecobankbusinessdocumentportal/auth"
    },
    {
      name: "API Management Portal",
      period: "12/2023 – present",
      description: "Customized the APIM portal on the Azure platform.",
      link: "https://apimuat-developer.ecobank.com/"
    },
    {
      name: "E-shoppe",
      period: "12/2022 – 01/2023",
      description: "An intuitive, mobile-responsive e-commerce store offering a wide range of products. Includes item pagination for enhanced user experience.",
      link: "https://izueshoppe.netlify.app/"
    }
  ],
  education: [
    {
      degree: "B-tech",
      institution: "Ladoke Akintola University of Technology",
      location: "Ogbomoso, Nigeria"
    }
  ],
  certificates: [
    { name: "AWS Cloud Essentials", issuer: "AWS" },
    { name: "Foundation of User Experience", issuer: "Google" },
    { name: "Responsive Web Design", issuer: "FreeCodeCamp" },
    { name: "EF SET English Certificate 75/100 (C2 Proficient)", issuer: "EF SET" },
    { name: "Introduction to Mobile Development", issuer: "Meta" },
    { name: "JavaScript Algorithm and Data Structures", issuer: "FreeCodeCamp" },
    { name: "React Basics", issuer: "Meta" },
    { name: "Kotlin for Java Developers", issuer: "Udemy" },
    { name: "Flutter Masterclass", issuer: "Udemy" },
    { name: "Scrum fundamental certified", issuer: "SCRUMstudy" }
  ]
};

export const SOCIAL_LINKS = [
  { icon: <Mail size={20} />, href: `mailto:${RESUME_DATA.contact.email}`, label: "Email" },
  { icon: <Linkedin size={20} />, href: RESUME_DATA.contact.linkedin, label: "LinkedIn" },
  { icon: <Github size={20} />, href: RESUME_DATA.contact.github, label: "GitHub" },
  { icon: <Globe size={20} />, href: RESUME_DATA.contact.website, label: "Portfolio" },
];