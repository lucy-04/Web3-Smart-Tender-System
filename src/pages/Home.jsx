import React, { useEffect, useRef } from "react";

const Home = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight * 0.7;


        ctx.fillStyle = "white";
        ctx.font = "700 150px system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillText(
            "Smart Tender System",
            canvas.width / 2,
            canvas.height / 2
        );

        const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const targets = [];

        for (let y = 0; y < imageData.height; y += 3) {
            for (let x = 0; x < imageData.width; x += 3) {
                const index = (y * imageData.width + x) * 4;
                if (imageData.data[index + 3] > 128) {
                    targets.push({ x, y });
                }
            }
        }


        const formationParticles = targets.map((target) => ({
            x: target.x,
            y: -Math.random() * canvas.height,
            targetX: target.x,
            targetY: target.y,
            size: 1.5,
            speed: Math.random() * 4 + 3,
            locked: false,
        }));


        const bgSnow = Array.from({ length: 120 }).map(() => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 5 + 3,
        }));

        let formationComplete = false;

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);


            ctx.fillStyle = "rgba(255,255,255,0.5)";
            bgSnow.forEach((p) => {
                p.y += p.speed;
                if (p.y > canvas.height) {
                    p.y = -10;
                    p.x = Math.random() * canvas.width;
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });


            ctx.fillStyle = "#ffffff";
            ctx.shadowColor = "#3b82f6";
            ctx.shadowBlur = 4;

            let lockedCount = 0;

            formationParticles.forEach((p) => {
                if (!p.locked) {
                    p.y += p.speed;

                    if (p.y >= p.targetY - 10) {
                        const dy = p.targetY - p.y;
                        p.y += dy * 0.3;

                        if (Math.abs(dy) < 0.5) {
                            p.locked = true;
                        }
                    }
                }

                if (p.locked) lockedCount++;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });

            if (lockedCount === formationParticles.length) {
                formationComplete = true;
            }

            requestAnimationFrame(animate);
        }

        animate();
    }, []);


    return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <canvas ref={canvasRef} />
        </div>
    );
};

export default Home;


