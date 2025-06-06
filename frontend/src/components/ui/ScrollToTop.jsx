import React, { useState, useEffect } from 'react';
import './ScrollToTop.css';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Toggle visibility based on scroll position
    const toggleVisibility = () => {
        const scrolled = document.documentElement.scrollTop;
        const maxHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const progress = (scrolled / maxHeight) * 100;
        
        setScrollProgress(progress);
        setIsVisible(scrolled > 300);
    };

    // Smooth scroll to top
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    return (
        <div className={`scroll-to-top ${isVisible ? 'visible' : ''}`}>
            {/* Progress Ring */}
            <div className="scroll-progress-ring">
                <svg className="progress-ring" width="60" height="60">
                    <circle
                        className="progress-ring-background"
                        stroke="#e5e5e5"
                        strokeWidth="3"
                        fill="transparent"
                        r="26"
                        cx="30"
                        cy="30"
                    />
                    <circle
                        className="progress-ring-progress"
                        stroke="#0A4B3E"
                        strokeWidth="3"
                        fill="transparent"
                        r="26"
                        cx="30"
                        cy="30"
                        style={{
                            strokeDasharray: `${163.36}`,
                            strokeDashoffset: `${163.36 - (scrollProgress / 100) * 163.36}`
                        }}
                    />
                </svg>
                
                {/* Button */}
                <button
                    className="scroll-btn modern-button"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                    title="Cuộn lên đầu trang"
                >
                    <svg 
                        className="scroll-icon" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M7 14l5-5 5 5"/>
                        <path d="M7 20l5-5 5 5"/>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default ScrollToTop; 