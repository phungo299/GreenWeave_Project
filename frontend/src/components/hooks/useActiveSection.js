import { useState, useEffect } from 'react';

export const useActiveSection = () => {
    const [activeSection, setActiveSection] = useState('home');

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['home', 'products', 'about', 'contact'];
            const scrollPosition = window.scrollY + 100; // Offset to trigger a little earlier

            for (const sectionId of sections) {
                const section = document.getElementById(sectionId);
                if (section) {
                    const sectionTop = section.offsetTop;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                        setActiveSection(sectionId);
                        break;
                    }
                }
            }
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return activeSection;
};