import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import React from 'react';

/**
 * ULTRA SMOOTH AnimatedSection - Premium Animation Component
 * Optimized for 60fps performance with zero jank
 */

// // PREMIUM SPRING EASING - Natural motion curves
// const springConfig = {
//   type: "spring",
//   stiffness: 100,
//   damping: 12,
//   mass: 0.8,
//   restDelta: 0.001
// };

// const smoothEasing = [0.25, 0.46, 0.45, 0.94]; // Custom bezier for smooth motion

// // ULTRA SMOOTH ANIMATION VARIANTS - GPU Optimized
// const premiumVariants = {
//   fadeIn: {
//     hidden: { 
//       opacity: 0,
//       transform: 'translate3d(0,0,0)',
//       filter: 'blur(1px)'
//     },
//     visible: { 
//       opacity: 1,
//       transform: 'translate3d(0,0,0)',
//       filter: 'blur(0px)',
//       transition: { 
//         duration: 0.8,
//         ease: smoothEasing,
//         opacity: { duration: 0.6 },
//         filter: { duration: 0.4, delay: 0.2 }
//       }
//     }
//   },
//   slideUp: {
//     hidden: { 
//       opacity: 0, 
//       transform: 'translate3d(0,40px,0) scale(0.98)',
//     },
//     visible: { 
//       opacity: 1, 
//       transform: 'translate3d(0,0,0) scale(1)',
//       transition: {
//         ...springConfig,
//         opacity: { duration: 0.6, ease: smoothEasing },
//         transform: { ...springConfig, duration: 0.8 }
//       }
//     }
//   },
//   slideRight: {
//     hidden: { 
//       opacity: 0, 
//       transform: 'translate3d(-50px,0,0) scale(0.97)',
//     },
//     visible: { 
//       opacity: 1, 
//       transform: 'translate3d(0,0,0) scale(1)',
//       transition: {
//         type: 'spring',
//         stiffness: 68,
//         damping: 20,
//         mass: 0.9,
//         duration: 0.95,
//         opacity: { duration: 0.5, ease: smoothEasing }
//       }
//     }
//   },
//   slideLeft: {
//     hidden: { 
//       opacity: 0, 
//       transform: 'translate3d(50px,0,0) scale(0.97)',
//     },
//     visible: { 
//       opacity: 1, 
//       transform: 'translate3d(0,0,0) scale(1)',
//       transition: {
//         type: 'spring',
//         stiffness: 68,
//         damping: 20,
//         mass: 0.9,
//         duration: 0.95,
//         opacity: { duration: 0.5, ease: smoothEasing }
//       }
//     }
//   },
//   zoomIn: {
//     hidden: { 
//       opacity: 0, 
//       transform: 'translate3d(0,0,0) scale(0.8)',
//       filter: 'blur(2px)'
//     },
//     visible: { 
//       opacity: 1, 
//       transform: 'translate3d(0,0,0) scale(1)',
//       filter: 'blur(0px)',
//       transition: {
//         ...springConfig,
//         duration: 1.0,
//         opacity: { duration: 0.6 },
//         filter: { duration: 0.8 }
//       }
//     }
//   },
//   rotateIn: {
//     hidden: { 
//       opacity: 0, 
//       transform: 'translate3d(0,0,0) rotate(-8deg) scale(0.9)',
//     },
//     visible: { 
//       opacity: 1, 
//       transform: 'translate3d(0,0,0) rotate(0deg) scale(1)',
//       transition: {
//         ...springConfig,
//         duration: 1.2,
//         opacity: { duration: 0.6 }
//       }
//     }
//   },
//   bounce: {
//     hidden: { 
//       opacity: 0, 
//       transform: 'translate3d(0,60px,0)',
//     },
//     visible: { 
//       opacity: 1, 
//       transform: 'translate3d(0,0,0)',
//       transition: {
//         type: "spring",
//         stiffness: 200,
//         damping: 18,
//         mass: 1,
//         opacity: { duration: 0.4 }
//       }
//     }
//   },
//   // NEW PREMIUM ANIMATIONS
//   floatIn: {
//     hidden: { 
//       opacity: 0, 
//       transform: 'translate3d(0,30px,0)',
//       filter: 'blur(1px)'
//     },
//     visible: { 
//       opacity: 1, 
//       transform: 'translate3d(0,0,0)',
//       filter: 'blur(0px)',
//       transition: {
//         type: "spring",
//         stiffness: 120,
//         damping: 15,
//         duration: 1.1,
//         opacity: { duration: 0.8, ease: smoothEasing },
//         filter: { duration: 0.6, delay: 0.2 }
//       }
//     }
//   },
//   scaleInFade: {
//     hidden: { 
//       opacity: 0, 
//       transform: 'translate3d(0,0,0) scale(0.85)',
//     },
//     visible: { 
//       opacity: 1, 
//       transform: 'translate3d(0,0,0) scale(1)',
//       transition: {
//         type: "spring",
//         stiffness: 140,
//         damping: 20,
//         duration: 0.9,
//         opacity: { duration: 0.7, ease: smoothEasing }
//       }
//     }
//   }
// };

// // PREMIUM HOVER EFFECTS - Ultra smooth
// const getPremiumHoverEffects = (effect) => {
//   const baseTransition = {
//     type: "spring",
//     stiffness: 400,
//     damping: 25,
//     mass: 0.5
//   };

//   switch (effect) {
//     case 'zoom':
//       return { 
//         transform: 'translate3d(0,0,0) scale(1.04)',
//         transition: baseTransition
//       };
//     case 'glow':
//       return { 
//         boxShadow: "0 8px 32px rgba(10, 75, 62, 0.25), 0 0 0 1px rgba(10, 75, 62, 0.1)",
//         transition: { duration: 0.4, ease: smoothEasing }
//       };
//     case 'float':
//       return { 
//         transform: 'translate3d(0,-8px,0)',
//         transition: baseTransition
//       };
//     case 'pulse':
//       return {
//         scale: [1, 1.02, 1],
//         transition: { 
//           duration: 2,
//           repeat: Infinity,
//           ease: "easeInOut"
//         }
//       };
//     case 'tilt':
//       return { 
//         transform: 'translate3d(0,0,0) rotate(1deg) scale(1.01)',
//         transition: baseTransition
//       };
//     case 'lift':
//       return {
//         transform: 'translate3d(0,-6px,0)',
//         boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
//         transition: baseTransition
//       };
//     default:
//       return {};
//   }
// };

const AnimatedSection = ({
  children,
  className = '',
  variants,
  once = true,
  threshold = 0.15,
  ...props
}) => {
  const [ref, inView] = useInView({
    triggerOnce: once,
    threshold,
  });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      variants={variants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection; 