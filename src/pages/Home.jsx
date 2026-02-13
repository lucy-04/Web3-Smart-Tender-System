import React, { useEffect, useRef } from "react";

const Home = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight * 0.7;
        };
        resize();
        window.addEventListener("resize", resize);

        const bgSnow = Array.from({ length: 150 }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2.5 + 0.5,
            speed: Math.random() * 2 + 1,
            drift: Math.random() * 0.5 - 0.25,
            opacity: Math.random() * 0.5 + 0.3,
        }));

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            bgSnow.forEach((p) => {
                p.y += p.speed;
                p.x += p.drift;

                if (p.y > canvas.height) {
                    p.y = -10;
                    p.x = Math.random() * canvas.width;
                }
                if (p.x > canvas.width) p.x = 0;
                if (p.x < 0) p.x = canvas.width;

                ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        animate();

        return () => window.removeEventListener("resize", resize);
    }, []);

    return (
        <div className="relative flex items-center justify-center min-h-[80vh]">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            <div className="relative z-10 text-center animate-fade-in">

                <h1 className="font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]" style={{ fontSize: '9rem' }}>
                    Smart Tender System
                </h1>
                <p className="text-gray-400 text-lg mt-8 max-w-xl mx-auto leading-relaxed">
                    Transparent, auditable & decentralized infrastructure for modern government procurement
                </p>
                <div className="mt-10 flex items-center justify-center">
                    <a href="/signup" className="px-8 py-3 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full font-semibold text-sm hover:scale-105 transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                        Get Started →
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Home;
