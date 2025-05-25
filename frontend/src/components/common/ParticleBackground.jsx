import React, { useEffect, useRef } from 'react';
import './ParticleBackground.css';

const ParticleBackground = ({ 
    particleCount = 50, 
    color = '#4CAF50', 
    opacity = 0.6,
    speed = 1,
    size = 2 
}) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];

        // Resize canvas to full screen
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // Initialize particles
        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * speed,
                    vy: (Math.random() - 0.5) * speed,
                    size: Math.random() * size + 1,
                    opacity: Math.random() * opacity + 0.1,
                    hue: Math.random() * 60 + 120, // Green spectrum
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: 0.02 + Math.random() * 0.02
                });
            }
            particlesRef.current = particles;
        };

        // Draw particle
        const drawParticle = (particle) => {
            const gradient = ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size * 3
            );
            
            const alpha = particle.opacity * (0.8 + 0.2 * Math.sin(particle.pulse));
            gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 60%, ${alpha})`);
            gradient.addColorStop(0.5, `hsla(${particle.hue}, 70%, 50%, ${alpha * 0.5})`);
            gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 40%, 0)`);

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();

            // Add sparkle effect
            if (Math.random() < 0.01) {
                ctx.fillStyle = `hsla(${particle.hue}, 100%, 80%, ${alpha})`;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        // Draw connections between nearby particles
        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 150) {
                        const alpha = (150 - distance) / 150 * 0.1;
                        ctx.strokeStyle = `rgba(76, 175, 80, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Update particle position
        const updateParticle = (particle) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.pulse += particle.pulseSpeed;

            // Bounce off edges
            if (particle.x < 0 || particle.x > canvas.width) {
                particle.vx *= -1;
                particle.x = Math.max(0, Math.min(canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > canvas.height) {
                particle.vy *= -1;
                particle.y = Math.max(0, Math.min(canvas.height, particle.y));
            }

            // Add slight gravitational effect towards center
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const dx = centerX - particle.x;
            const dy = centerY - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                particle.vx += (dx / distance) * 0.0001;
                particle.vy += (dy / distance) * 0.0001;
            }

            // Limit velocity
            const maxVel = speed * 2;
            particle.vx = Math.max(-maxVel, Math.min(maxVel, particle.vx));
            particle.vy = Math.max(-maxVel, Math.min(maxVel, particle.vy));
        };

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections first (behind particles)
            drawConnections();

            // Update and draw particles
            particles.forEach(particle => {
                updateParticle(particle);
                drawParticle(particle);
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        // Mouse interaction
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;

            particles.forEach(particle => {
                const dx = mouseX - particle.x;
                const dy = mouseY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.vx += (dx / distance) * force * 0.01;
                    particle.vy += (dy / distance) * force * 0.01;
                }
            });
        };

        // Initialize
        resizeCanvas();
        initParticles();
        animate();

        // Event listeners
        window.addEventListener('resize', () => {
            resizeCanvas();
            initParticles();
        });
        canvas.addEventListener('mousemove', handleMouseMove);

        // Cleanup
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', resizeCanvas);
            canvas.removeEventListener('mousemove', handleMouseMove);
        };
    }, [particleCount, color, opacity, speed, size]);

    return (
        <canvas
            ref={canvasRef}
            className="particle-background"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                pointerEvents: 'auto'
            }}
        />
    );
};

export default ParticleBackground; 