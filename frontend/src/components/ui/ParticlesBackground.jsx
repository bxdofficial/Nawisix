import { useEffect, useRef, useState, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const ParticlesBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const lastTimeRef = useRef(0);
  const fpsRef = useRef(60);
  const particleSpawnTimerRef = useRef(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { isDarkMode } = useTheme();

  // Performance configuration
  const CONFIG = {
    MAX_PARTICLES: 150,
    PARTICLES_PER_SECOND: 20,
    DECAY_TIME: 5000, // 5 seconds in milliseconds
    MIN_FPS: 45,
    SPAWN_COOLDOWN: 50, // milliseconds between spawns
    CLICK_BURST_COOLDOWN: 300, // milliseconds between click bursts
    CLICK_BURST_PARTICLES: 5,
    BASE_PARTICLE_SIZE: 2,
    MAX_PARTICLE_SIZE: 4,
    BASE_SPEED: 0.5,
    MAX_SPEED: 2,
  };

  const lastClickTimeRef = useRef(0);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mediaQuery.matches);

    const handleChange = (e) => setReduceMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Also check localStorage for user preference
    const savedPreference = localStorage.getItem('reduceMotion');
    if (savedPreference !== null) {
      setReduceMotion(savedPreference === 'true');
    }

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Particle class
  class Particle {
    constructor(x, y, isBurst = false) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * (CONFIG.MAX_PARTICLE_SIZE - CONFIG.BASE_PARTICLE_SIZE) + CONFIG.BASE_PARTICLE_SIZE;
      this.speedX = (Math.random() - 0.5) * (isBurst ? CONFIG.MAX_SPEED * 2 : CONFIG.MAX_SPEED);
      this.speedY = (Math.random() - 0.5) * (isBurst ? CONFIG.MAX_SPEED * 2 : CONFIG.MAX_SPEED);
      this.opacity = isBurst ? 1 : 0.5 + Math.random() * 0.5;
      this.birthTime = Date.now();
      this.lifespan = CONFIG.DECAY_TIME + Math.random() * 1000;
      this.isBurst = isBurst;
      this.color = isDarkMode 
        ? `rgba(159, 227, 255, ${this.opacity})` // Light sky-blue for night
        : `rgba(103, 199, 255, ${this.opacity})`; // Sky-blue for day
    }

    update(deltaTime) {
      const age = Date.now() - this.birthTime;
      const lifePercent = Math.max(0, 1 - (age / this.lifespan));
      
      // Update position
      this.x += this.speedX * (deltaTime / 16);
      this.y += this.speedY * (deltaTime / 16);
      
      // Fade out as particle ages
      this.opacity = (this.isBurst ? 1 : 0.5) * lifePercent;
      
      // Update color with new opacity
      this.color = isDarkMode 
        ? `rgba(159, 227, 255, ${this.opacity})`
        : `rgba(103, 199, 255, ${this.opacity})`;
      
      // Slow down over time
      this.speedX *= 0.99;
      this.speedY *= 0.99;
      
      // Check if particle should be removed
      return age < this.lifespan;
    }

    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = this.isBurst ? 20 : 10;
      ctx.shadowColor = this.color;
      
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    }
  }

  // Spawn particles at regular intervals
  const spawnParticle = useCallback((x, y, isBurst = false) => {
    if (particlesRef.current.length >= CONFIG.MAX_PARTICLES) {
      // Remove oldest particle if at max
      particlesRef.current.shift();
    }
    particlesRef.current.push(new Particle(x, y, isBurst));
  }, [isDarkMode]);

  // Handle click events for burst effect
  const handleClick = useCallback((e) => {
    if (reduceMotion) return;
    
    const now = Date.now();
    if (now - lastClickTimeRef.current < CONFIG.CLICK_BURST_COOLDOWN) {
      return; // Cooldown not finished
    }
    
    lastClickTimeRef.current = now;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create burst of particles
    for (let i = 0; i < CONFIG.CLICK_BURST_PARTICLES; i++) {
      if (particlesRef.current.length < CONFIG.MAX_PARTICLES) {
        setTimeout(() => {
          spawnParticle(x, y, true);
        }, i * 30);
      }
    }
  }, [reduceMotion, spawnParticle]);

  // Animation loop
  const animate = useCallback((timestamp) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const deltaTime = timestamp - lastTimeRef.current;
    
    // Calculate FPS
    fpsRef.current = 1000 / deltaTime;
    
    // Auto-reduce particles if FPS drops
    if (fpsRef.current < CONFIG.MIN_FPS && particlesRef.current.length > 50) {
      particlesRef.current = particlesRef.current.slice(0, Math.floor(particlesRef.current.length * 0.8));
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Spawn new particles at regular intervals
    particleSpawnTimerRef.current += deltaTime;
    if (particleSpawnTimerRef.current > CONFIG.SPAWN_COOLDOWN && particlesRef.current.length < CONFIG.MAX_PARTICLES) {
      particleSpawnTimerRef.current = 0;
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      spawnParticle(x, y, false);
    }
    
    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      const shouldKeep = particle.update(deltaTime);
      if (shouldKeep) {
        particle.draw(ctx);
      }
      return shouldKeep;
    });
    
    lastTimeRef.current = timestamp;
    
    if (!reduceMotion) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [reduceMotion, spawnParticle]);

  // Set up canvas and start animation
  useEffect(() => {
    if (reduceMotion) {
      // Clear particles if motion is reduced
      particlesRef.current = [];
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    canvas.addEventListener('click', handleClick);

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('click', handleClick);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, handleClick, reduceMotion]);

  // Don't render canvas if motion is reduced
  if (reduceMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ 
        background: isDarkMode 
          ? 'linear-gradient(135deg, #0F1724 0%, #1A2332 100%)' 
          : 'linear-gradient(135deg, rgba(103, 199, 255, 0.05) 0%, rgba(159, 227, 255, 0.05) 100%)'
      }}
      aria-hidden="true"
    />
  );
};

// Settings control component for admin panel
export const ParticlesSettings = () => {
  const [settings, setSettings] = useState({
    enabled: true,
    maxParticles: 150,
    particlesPerSecond: 20,
    decayTime: 5,
    reduceMotion: false,
  });

  const handleToggleReduceMotion = (value) => {
    localStorage.setItem('reduceMotion', value.toString());
    setSettings({ ...settings, reduceMotion: value });
    window.location.reload(); // Reload to apply changes
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Enable Particles</label>
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
          className="toggle"
        />
      </div>
      
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Reduce Motion</label>
        <input
          type="checkbox"
          checked={settings.reduceMotion}
          onChange={(e) => handleToggleReduceMotion(e.target.checked)}
          className="toggle"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Max Particles: {settings.maxParticles}</label>
        <input
          type="range"
          min="50"
          max="300"
          value={settings.maxParticles}
          onChange={(e) => setSettings({ ...settings, maxParticles: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Spawn Rate: {settings.particlesPerSecond}/sec</label>
        <input
          type="range"
          min="5"
          max="50"
          value={settings.particlesPerSecond}
          onChange={(e) => setSettings({ ...settings, particlesPerSecond: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Decay Time: {settings.decayTime}s</label>
        <input
          type="range"
          min="3"
          max="10"
          step="0.5"
          value={settings.decayTime}
          onChange={(e) => setSettings({ ...settings, decayTime: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ParticlesBackground;