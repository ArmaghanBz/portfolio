// Main JavaScript file
document.addEventListener('DOMContentLoaded', () => {
    // Greensock Animations
    gsap.registerPlugin(ScrollTrigger);

    initAnimations();
    initNavigation();
    init3DScene();
});

function init3DScene() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0B0A1D, 0.015);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const group = new THREE.Group();
    scene.add(group);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 1000;
    const posArray = new Float32Array(particlesCount * 3);

    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 150; 
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xffcc00,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Abstract game dev elements (floating geometry primitives)
    const geometries = [
        new THREE.TorusGeometry(3, 0.5, 16, 50),
        new THREE.OctahedronGeometry(3, 0),
        new THREE.IcosahedronGeometry(4, 0),
        new THREE.BoxGeometry(4, 4, 4)
    ];

    const objectsMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xff3366, 
        wireframe: true, 
        transparent: true, 
        opacity: 0.25 
    });

    const floatingObjects = [];
    for(let i = 0; i < 6; i++) {
        const mesh = new THREE.Mesh(geometries[Math.floor(Math.random() * geometries.length)], objectsMaterial);
        mesh.position.x = (Math.random() - 0.5) * 60;
        mesh.position.y = (Math.random() - 0.5) * 40;
        mesh.position.z = (Math.random() - 0.5) * 40 - 10;
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        const scale = Math.random() * 0.5 + 0.5;
        mesh.scale.set(scale, scale, scale);
        
        group.add(mesh);
        
        floatingObjects.push({
            mesh: mesh,
            speedX: (Math.random() - 0.5) * 0.01,
            speedY: (Math.random() - 0.5) * 0.01,
            floatSpeed: Math.random() * 0.02 + 0.01,
            floatOffset: Math.random() * Math.PI * 2
        });
    }

    // Grid Helper for that game engine / 3D space feel
    const gridHelper = new THREE.GridHelper(200, 50, 0x00f0ff, 0x00f0ff);
    gridHelper.position.y = -20;
    gridHelper.material.opacity = 0.1;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // Interactive mouse
    let mouseX = 0;
    let mouseY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - window.innerWidth / 2);
        mouseY = (event.clientY - window.innerHeight / 2);
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Mouse interaction
        const targetX = mouseX * 0.001;
        const targetY = mouseY * 0.001;
        
        group.rotation.y += 0.02 * (targetX - group.rotation.y);
        group.rotation.x += 0.02 * (targetY - group.rotation.x);
        
        particlesMesh.rotation.y = elapsedTime * 0.05;

        // Animate objects
        floatingObjects.forEach(obj => {
            obj.mesh.rotation.x += obj.speedX;
            obj.mesh.rotation.y += obj.speedY;
            obj.mesh.position.y += Math.sin(elapsedTime * 2 + obj.floatOffset) * obj.floatSpeed;
        });

        // Scroll interaction
        const scrollY = window.scrollY;
        camera.position.y = -scrollY * 0.02;
        camera.position.z = 30 + scrollY * 0.01;

        renderer.render(scene, camera);
    }
    
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