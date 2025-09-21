import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import Particles from 'react-particles';
import { loadSlim } from 'tsparticles-slim';
import { useTheme } from '../contexts/EnhancedThemeContext';

const OptimizedParticleSystem = ({ className = '' }) => {
  const { isDark, reduceMotion } = useTheme();
  const [particlesLoaded, setParticlesLoaded] = useState(false);
  const [particleCount, setParticleCount] = useState(50);
  const containerRef = useRef(null);

  // Adjust particle count based on device performance
  useEffect(() => {
    const checkPerformance = () => {
      // Check if device is mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      
      // Check device memory (if available)
      const deviceMemory = navigator.deviceMemory || 4;
      
      // Check CPU cores (if available)
      const hardwareConcurrency = navigator.hardwareConcurrency || 2;
      
      // Calculate optimal particle count
      let optimal = 100;
      
      if (isMobile) {
        optimal = 30;
      } else if (deviceMemory < 4) {
        optimal = 40;
      } else if (hardwareConcurrency < 4) {
        optimal = 60;
      } else {
        optimal = 100;
      }
      
      // Reduce particles if user prefers reduced motion
      if (reduceMotion) {
        optimal = Math.min(optimal, 20);
      }
      
      setParticleCount(optimal);
    };
    
    checkPerformance();
    
    // Re-check on visibility change (e.g., tab switching)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setParticleCount(10); // Minimal particles when tab is hidden
      } else {
        checkPerformance();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reduceMotion]);

  // Initialize particles
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
    setParticlesLoaded(true);
  }, []);

  // Particles loaded callback
  const particlesLoadedCallback = useCallback((container) => {
    containerRef.current = container;
  }, []);

  // Optimized particle options with memoization
  const particleOptions = useMemo(() => ({
    particles: {
      number: {
        value: particleCount,
        density: {
          enable: true,
          value_area: 1000,
        },
      },
      color: {
        value: isDark ? ['#38BDF8', '#A78BFA', '#FB923C'] : ['#0EA5E9', '#8B5CF6', '#F97316'],
      },
      shape: {
        type: 'circle',
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: {
          enable: !reduceMotion,
          speed: 0.5,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: !reduceMotion,
          speed: 2,
          size_min: 0.5,
          sync: false,
        },
      },
      links: {
        enable: true,
        distance: 150,
        color: isDark ? '#38BDF8' : '#0EA5E9',
        opacity: 0.3,
        width: 1,
        triangles: {
          enable: false,
        },
      },
      move: {
        enable: true,
        speed: reduceMotion ? 0.5 : 1.5,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: {
          enable: false,
        },
      },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: {
          enable: !reduceMotion,
          mode: 'grab',
        },
        onclick: {
          enable: !reduceMotion,
          mode: 'push',
        },
        resize: true,
      },
      modes: {
        grab: {
          distance: 140,
          line_linked: {
            opacity: 0.5,
          },
        },
        push: {
          particles_nb: 2,
        },
        remove: {
          particles_nb: 2,
        },
      },
    },
    retina_detect: true,
    fps_limit: 60,
    pauseOnBlur: true,
    pauseOnOutsideViewport: true,
    responsive: [
      {
        maxWidth: 640,
        options: {
          particles: {
            number: {
              value: Math.min(30, particleCount),
            },
            move: {
              speed: 0.8,
            },
          },
        },
      },
      {
        maxWidth: 1024,
        options: {
          particles: {
            number: {
              value: Math.min(60, particleCount),
            },
          },
        },
      },
    ],
  }), [isDark, particleCount, reduceMotion]);

  // Performance monitoring
  useEffect(() => {
    if (!containerRef.current) return;
    
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;
    
    const checkFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        frameCount = 0;
        lastTime = currentTime;
        
        // Reduce particles if FPS drops below 30
        if (fps < 30 && particleCount > 20) {
          setParticleCount(prev => Math.max(20, prev - 10));
        }
      }
      
      requestAnimationFrame(checkFPS);
    };
    
    const animationId = requestAnimationFrame(checkFPS);
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [particleCount, particlesLoaded]);

  // Don't render if reduce motion is extreme
  if (reduceMotion && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }

  return (
    <div className={`fixed inset-0 pointer-events-none ${className}`}>
      <Particles
        id="optimized-particles"
        init={particlesInit}
        loaded={particlesLoadedCallback}
        options={particleOptions}
        className="absolute inset-0"
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      />
      {/* Performance Indicator (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 text-xs text-gray-500 bg-white/80 dark:bg-gray-900/80 px-2 py-1 rounded">
          Particles: {particleCount}
        </div>
      )}
    </div>
  );
};

export default OptimizedParticleSystem;