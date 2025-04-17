import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToSection = () => {
    const location = useLocation();
  
    useEffect(() => {
        // Handle when URL changes
        if (location.hash) {
            const id = location.hash.substring(1);
            setTimeout(() => {
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }, 0);
        } else if (location.pathname === '/') {
            // Scroll to top of page when returning to home page
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [location]);
    // Function to handle clicking on internal links
    const scrollToSection = (e, sectionId) => {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };
    return { scrollToSection };
};