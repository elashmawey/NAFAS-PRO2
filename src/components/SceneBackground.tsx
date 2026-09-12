import React, { useEffect, useRef } from 'react';
import { SceneType } from '../types';

import auroraImg from '../assets/images/aurora_night_sky_1789253960058.jpg';
import moonlakeImg from '../assets/images/moonlit_calm_lake_1789253973431.jpg';
import forestImg from '../assets/images/misty_pine_forest_1789253984169.jpg';
import oceanImg from '../assets/images/midnight_ocean_waves_1789253996219.jpg';
import mountainsImg from '../assets/images/dusk_mountain_peaks_1789254006724.jpg';

interface SceneBackgroundProps {
  scene: SceneType;
  accentHue: number;
}

const SCENE_IMAGE_MAP: Record<SceneType, string | null> = {
  default: auroraImg,
  moonlake: moonlakeImg,
  forest: forestImg,
  ocean: oceanImg,
  mountains: mountainsImg,
  desert: null
};

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ scene, accentHue }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles
    const particles = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 0.8 + Math.random() * 1.5,
      alpha: 0.2 + Math.random() * 0.6,
      speed: 0.001 + Math.random() * 0.002,
      phase: Math.random() * Math.PI * 2
    }));

    // Meteors
    interface Meteor {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      length: number;
    }
    let meteors: Meteor[] = [];
    let nextMeteor = Date.now() + 4000;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const now = Date.now();
      // Spawn meteors
      if (now > nextMeteor) {
        meteors.push({
          x: Math.random() * width * 0.8,
          y: -20,
          vx: 5 + Math.random() * 3,
          vy: 2.5 + Math.random() * 2,
          life: 1,
          length: 80 + Math.random() * 60
        });
        nextMeteor = now + 6000 + Math.random() * 7000;
      }

      // Draw meteors
      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.012;

        if (m.life <= 0 || m.y > height) {
          meteors.splice(i, 1);
          continue;
        }

        const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * (m.length / 8), m.y - m.vy * (m.length / 8));
        grad.addColorStop(0, `rgba(255, 255, 255, ${0.8 * m.life})`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * (m.length / 8), m.y - m.vy * (m.length / 8));
        ctx.stroke();
      }

      // Draw stars
      particles.forEach((p) => {
        const twinkle = 0.5 + 0.5 * Math.sin(now * p.speed + p.phase);
        ctx.fillStyle = `rgba(215, 235, 255, ${p.alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const activeImage = SCENE_IMAGE_MAP[scene];

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#060a13]">
      {/* Cinematic Photorealistic Background Image */}
      {activeImage && (
        <div className="absolute inset-0 transition-opacity duration-1000">
          <img
            src={activeImage}
            alt={scene}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-35 scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Deep dark gradient overlay for optimal text contrast and breath focus */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#060a13]/70 via-[#060a13]/40 to-[#060a13]/85" />
        </div>
      )}

      {/* Dynamic Aurora Glows */}
      <div
        className="absolute w-[50vmax] h-[50vmax] -top-[15vmax] -left-[10vmax] rounded-full blur-[100px] opacity-20 transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, #133f68, transparent 70%)',
          filter: `hue-rotate(${accentHue}deg)`
        }}
      />
      <div
        className="absolute w-[45vmax] h-[45vmax] -bottom-[12vmax] -right-[10vmax] rounded-full blur-[90px] opacity-20 transition-all duration-1000"
        style={{
          background: 'radial-gradient(circle, #0c504a, transparent 70%)',
          filter: `hue-rotate(${accentHue}deg)`
        }}
      />

      {/* Desert Night Moon and Silhouettes (Fallback when desert selected) */}
      {scene === 'desert' && (
        <div className="absolute inset-0">
          <div
            className="absolute top-20 left-20 w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #fff9ec, #e8d2a8)',
              boxShadow: '0 0 50px 15px rgba(255,240,200,0.3)'
            }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#26150c] via-[#1a0f0a]/80 to-transparent" />
        </div>
      )}

      {/* Canvas for stars and meteors */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-80" />

      {/* Center focus spotlight vignette to frame breathing orb */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_90%_at_50%_45%,transparent_40%,rgba(6,10,19,0.75)_100%)] pointer-events-none" />
    </div>
  );
};
