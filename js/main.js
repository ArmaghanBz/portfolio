// Main JavaScript file
document.addEventListener('DOMContentLoaded', () => {
    // Greensock Animations
    gsap.registerPlugin(ScrollTrigger);

    initAnimations();
    initNavigation();
    initParticles();
});

function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Configuration
    const particleCount = window.innerWidth < 768 ? 60 : 120;
    const connectionDistance = 150;
    const mouseDistance = 200;

    // Mouse state
    let mouse = { x: null, y: null };

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Click Burst Interaction
    window.addEventListener('mousedown', (e) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        particles.forEach(p => {
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 300) {
                const angle = Math.atan2(dy, dx);
                const force = (300 - distance) / 10; // Stronger force closer to center
                p.vx += Math.cos(angle) * force;
                p.vy += Math.sin(angle) * force;
            }
        });
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    resize();
    window.addEventListener('resize', () => {
        resize();
        init();
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            // Parallax: velocity linked to size. Larger particles (closer) move faster.
            // Base speed range: 0.2 to 1.5
            this.size = Math.random() * 2 + 1; // Size 1 to 3
            const speedFactor = this.size * 0.15;
            this.vx = (Math.random() - 0.5) * speedFactor;
            this.vy = (Math.random() - 0.5) * speedFactor;

            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            // Friction for bust effect
            this.friction = 0.96;
        }

        update() {
            // Apply friction to velocity (stabilize burst)
            // But we want to maintain a minimum ambient movement
            if (Math.abs(this.vx) > 2 || Math.abs(this.vy) > 2) {
                this.vx *= this.friction;
                this.vy *= this.friction;
            }

            // Mouse Repel interaction
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseDistance - distance) / mouseDistance;
                    const directionX = forceDirectionX * force * this.density;
                    const directionY = forceDirectionY * force * this.density;

                    this.x -= directionX;
                    this.y -= directionY;
                }
            }

            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges with damping
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;
        }

        draw() {
            // Opacity based on size for depth perception
            // Larger (closer) particles are slightly more opaque
            const opacity = this.size * 0.1 + 0.1;
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    function init() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Breathing effect variable
    let breath = 0;

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Pulse logic for breathing connections
        breath += 0.03;
        const breathFactor = (Math.sin(breath) + 1) / 2 * 0.5 + 0.5; // Oscillates between 0.5 and 1

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            // Draw connections
            for (let j = i; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    ctx.beginPath();
                    // Basic opacity based on distance
                    let opacity = 1 - (distance / connectionDistance);
                    // Multiply by breathing factor
                    opacity = opacity * 0.15 * breathFactor;

                    ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`; // Accent color
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    init();
    animate();
}

function initAnimations() {
    // Hero Animation
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.from('.eyebrow', { y: 20, opacity: 0, duration: 0.6 })
        .from('.hero h1', { y: 30, opacity: 0, duration: 0.8 }, "-=0.4")
        .from('.subtitle', { y: 20, opacity: 0, duration: 0.6 }, "-=0.6")
        .from('.description', { y: 20, opacity: 0, duration: 0.6 }, "-=0.5")
        .from('.cta-group', { y: 20, opacity: 0, duration: 0.6 }, "-=0.4")
        .from('.hero-visual', { scale: 0.8, opacity: 0, duration: 1.5, ease: "slow(0.7, 0.7, false)" }, "-=1");

    // Fade Up Elements on Scroll
    const fadeUpElements = gsap.utils.toArray('.project-card, .skill-group, .contact-wrapper');

    fadeUpElements.forEach(element => {
        gsap.from(element, {
            scrollTrigger: {
                trigger: element,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        });
    });
}

function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => {
            const isOpened = navLinks.style.display === 'flex';
            if (isOpened) {
                navLinks.style.display = 'none';
                // Add mobile menu animation out logic here if needed
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.background = 'var(--surface-color)';
                navLinks.style.padding = '2rem';
                navLinks.style.borderBottom = '1px solid var(--glass-border)';
            }
        });
    }

    // Smooth Scroll for Anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Close mobile menu if open
                if (window.innerWidth <= 768 && navLinks) {
                    navLinks.style.display = 'none';
                }

                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}