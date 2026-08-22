document.addEventListener("DOMContentLoaded", () => {
    // 0. Preloader Logic
    const fill = document.getElementById('pl-fill');
    const preloader = document.getElementById('preloader');
    
    // Simulate loading progress
    setTimeout(() => {
        fill.style.width = '100%';
        setTimeout(() => {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
                initGSAPAnimations(); // Start animations only after preloader finishes
            }, 800);
        }, 400);
    }, 100);

    // 1. Custom Cursor
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const isTouch = matchMedia('(pointer: coarse)').matches;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    if (!isTouch && dot && ring) {
        document.addEventListener('mousemove', e => { 
            mx = e.clientX; 
            my = e.clientY; 
        });
        
        function renderCursor() {
            dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
            rx += (mx - rx) * 0.2; 
            ry += (my - ry) * 0.2;
            ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
            requestAnimationFrame(renderCursor);
        }
        renderCursor();
    }

    // 2. Magnetic Buttons
    const magnets = document.querySelectorAll('.magnetic');
    magnets.forEach(magnet => {
        magnet.addEventListener('mousemove', function(e) {
            const position = magnet.getBoundingClientRect();
            const x = e.clientX - position.left - position.width / 2;
            const y = e.clientY - position.top - position.height / 2;
            
            gsap.to(magnet, {
                x: x * 0.4,
                y: y * 0.4,
                duration: 0.3,
                ease: "power2.out"
            });
        });
        
        magnet.addEventListener('mouseleave', function() {
            gsap.to(magnet, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // 3. Navbar & Mobile Menu
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Utility: Split text into spans for staggered animations (wrapped in words to prevent breaking)
    function splitText(selector) {
        const el = document.querySelector(selector);
        if (!el) return;
        const text = el.innerText;
        const words = text.split(' ');
        el.innerHTML = words.map(word => {
            const chars = word.split('').map(char => `<span class="char">${char}</span>`).join('');
            return `<span style="display:inline-block; white-space:nowrap;">${chars}</span>`;
        }).join(' ');
    }

    // 4. GSAP Animations
    gsap.registerPlugin(ScrollTrigger);

    function initGSAPAnimations() {
        splitText('.title'); // Split the main hero title

        const heroTl = gsap.timeline();
        heroTl.from(".subtitle", { opacity: 0, y: 20, duration: 1.2, ease: "expo.out" })
              .from(".title .char", { 
                  opacity: 0, 
                  y: 40, 
                  rotateX: -90, 
                  stagger: 0.02, 
                  duration: 1.5, 
                  ease: "expo.out" 
              }, "-=1.0")
              .from(".description", { opacity: 0, y: 20, duration: 1.2, ease: "expo.out" }, "-=1.0")
              .from(".cta-group", { opacity: 0, y: 20, duration: 1.2, ease: "expo.out" }, "-=1.0")
              .from(".db-item", { opacity: 0, y: 30, stagger: 0.1, duration: 1.2, ease: "expo.out" }, "-=0.8")
              .from(".scroll-indicator", { opacity: 0, duration: 2 }, "-=0.5");

        // Image Sequence Animation
        const seqCanvas = document.getElementById("sequence-canvas");
        if (seqCanvas) {
            const context = seqCanvas.getContext("2d");
            const dpr = window.devicePixelRatio || 1;
            seqCanvas.width = window.innerWidth * dpr;
            seqCanvas.height = window.innerHeight * dpr;
            
            const frameCount = 300; // Total frames in new higher FPS sequence
            const cacheBust = new Date().getTime(); // Prevent browser from loading old cached images
            const currentFrame = index => (
                `assets/sequence/ezgif-frame-${(index + 1).toString().padStart(3, '0')}.jpg?v=${cacheBust}`
            );

            const images = [];
            const seq = { frame: 0 };

            for (let i = 0; i < frameCount; i++) {
                const img = new Image();
                img.src = currentFrame(i);
                images.push(img);
            }

            function renderSeq() {
                if (images[seq.frame] && images[seq.frame].complete) {
                    const img = images[seq.frame];
                    const hRatio = seqCanvas.width / img.width;
                    const vRatio = seqCanvas.height / img.height;
                    const ratio = Math.max(hRatio, vRatio); // Complete full screen cover
                    const centerShift_x = (seqCanvas.width - img.width * ratio) / 2; // Center horizontally
                    const centerShift_y = (seqCanvas.height - img.height * ratio) / 2; // Center vertically
                    
                    context.imageSmoothingEnabled = true;
                    context.imageSmoothingQuality = 'high';
                    
                    context.clearRect(0, 0, seqCanvas.width, seqCanvas.height);
                    context.drawImage(img, 0, 0, img.width, img.height,
                        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
                }
            }

            images[0].onload = renderSeq;

            gsap.to(seq, {
                frame: frameCount - 1,
                snap: "frame",
                ease: "none",
                scrollTrigger: {
                    trigger: "body", // Scrub through the whole page
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.5
                },
                onUpdate: renderSeq
            });

            let lastWidth = window.innerWidth;
            window.addEventListener('resize', () => {
                // Only resize if width changes (prevents mobile address bar scroll jitter)
                if (window.innerWidth !== lastWidth) {
                    lastWidth = window.innerWidth;
                    seqCanvas.width = window.innerWidth * dpr;
                    seqCanvas.height = window.innerHeight * dpr;
                    renderSeq();
                }
            });
        }

        // Services Scroll Animation
        gsap.from(".services .section-header", {
            scrollTrigger: { trigger: ".services", start: "top 80%" },
            opacity: 0, y: 30, duration: 0.8, ease: "power3.out"
        });

        gsap.from(".service-card", {
            scrollTrigger: { trigger: ".services-grid", start: "top 80%" },
            opacity: 0, y: 50, duration: 0.8, stagger: 0.2, ease: "power3.out"
        });

        // Projects Scroll Animation
        gsap.from(".work .section-header", {
            scrollTrigger: { trigger: ".work", start: "top 80%" },
            opacity: 0, y: 30, duration: 0.8, ease: "power3.out"
        });

        gsap.from(".project-card", {
            scrollTrigger: { trigger: ".projects-grid", start: "top 80%" },
            opacity: 0, scale: 0.95, y: 50, duration: 0.8, stagger: 0.2, ease: "power3.out"
        });

        // AI Video Scroll Animation
        gsap.from(".video-card", {
            scrollTrigger: { trigger: ".video-grid", start: "top 80%" },
            opacity: 0, y: 50, stagger: 0.2, duration: 1, ease: "expo.out"
        });

        // Contact Scroll Animation
        gsap.from(".contact-container", {
            scrollTrigger: { trigger: ".contact", start: "top 80%" },
            opacity: 0, y: 50, duration: 1, ease: "expo.out"
        });
    }

    // 5. Contact Form AJAX Submission
    const contactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");

    if (contactForm) {
        contactForm.addEventListener("submit", async function(event) {
            event.preventDefault(); // Prevent standard redirect
            const data = new FormData(contactForm);
            
            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "Sending...";
            
            try {
                const response = await fetch(contactForm.action, {
                    method: contactForm.method,
                    body: data,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    formStatus.innerText = "Thanks! Your message has been sent successfully.";
                    formStatus.style.color = "var(--text-primary)";
                    formStatus.style.display = "block";
                    contactForm.reset();
                } else {
                    formStatus.innerText = "Oops! There was a problem submitting your form.";
                    formStatus.style.color = "var(--accent-glow)";
                    formStatus.style.display = "block";
                }
            } catch (error) {
                formStatus.innerText = "Oops! There was a problem submitting your form.";
                formStatus.style.color = "var(--accent-glow)";
                formStatus.style.display = "block";
            } finally {
                submitBtn.innerText = originalBtnText;
            }
        });
    }
});
