/**
 * Gestionnaire d'animations avancé pour une expérience premium
 * Inspiré des animations de MonCourtierEnergie.com avec optimisations de performance
 */

// Fonction d'initialisation des animations au défilement
export const initScrollAnimations = () => {
  // Observateur d'intersection pour les animations au défilement
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          
          // Animation séquentielle pour les éléments enfants
          if (entry.target.classList.contains('sequential-children')) {
            const children = entry.target.querySelectorAll('.sequential-item');
            children.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('animated');
              }, index * 150); // 150ms de délai entre chaque élément
            });
          }
          
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15,
      rootMargin: '0px 0px -10% 0px'
    });
    
    animatedElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    // Fallback pour les navigateurs ne supportant pas IntersectionObserver
    animatedElements.forEach(element => {
      element.classList.add('animated');
    });
  }
};

// Animation de décompte pour les statistiques
export const initCounterAnimations = () => {
  const counterElements = document.querySelectorAll('[data-counter]');
  
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = entry.target;
          const countTo = parseInt(target.getAttribute('data-counter'), 10);
          const duration = 2000; // 2 secondes
          const startTime = performance.now();
          
          const updateCounter = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeOutCubic(progress);
            const currentValue = Math.floor(easeProgress * countTo);
            
            target.textContent = formatNumber(currentValue);
            
            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            }
          };
          
          requestAnimationFrame(updateCounter);
          observer.unobserve(target);
        }
      });
    }, {
      threshold: 0.5
    });
    
    counterElements.forEach(element => {
      observer.observe(element);
    });
  } else {
    // Fallback pour les navigateurs ne supportant pas IntersectionObserver
    counterElements.forEach(element => {
      const countTo = parseInt(element.getAttribute('data-counter'), 10);
      element.textContent = formatNumber(countTo);
    });
  }
};

// Animation de particules pour le fond héros
export const initParticleBackground = (canvasId, color = '#32BE5B', particleCount = 50) => {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  // Redimensionner le canvas pour qu'il occupe tout l'espace
  const resizeCanvas = () => {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  };
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  // Créer les particules
  const particles = [];
  
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 3 + 1,
      color: color,
      speedX: Math.random() * 0.5 - 0.25,
      speedY: Math.random() * 0.5 - 0.25,
      alpha: Math.random() * 0.5 + 0.1
    });
  }
  
  // Animer les particules
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    particles.forEach(particle => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = color.replace(')', `, ${particle.alpha})`).replace('rgb', 'rgba');
      ctx.fill();
      
      // Mettre à jour la position
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Rebond sur les bords
      if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
      if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
    });
    
    requestAnimationFrame(animate);
  };
  
  animate();
};

// Animation de défilement fluide pour les ancres
export const initSmoothScroll = () => {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      if (!targetId) return;
      
      const targetElement = document.getElementById(targetId);
      if (!targetElement) return;
      
      const startPosition = window.pageYOffset;
      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000;
      const startTime = performance.now();
      
      const scroll = (timestamp) => {
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeInOutCubic(progress);
        
        window.scrollTo(0, startPosition + distance * easeProgress);
        
        if (progress < 1) {
          requestAnimationFrame(scroll);
        }
      };
      
      requestAnimationFrame(scroll);
    });
  });
};

// Fonctions d'easing
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const easeInOutCubic = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

// Formatage des nombres pour les compteurs
const formatNumber = (num) => {
  return new Intl.NumberFormat().format(num);
};

// Initialiser toutes les animations
export const initAllAnimations = () => {
  initScrollAnimations();
  initCounterAnimations();
  initSmoothScroll();
  
  // Initialiser le fond de particules s'il existe
  if (document.getElementById('particles-canvas')) {
    initParticleBackground('particles-canvas');
  }
};

// Exporter les animations individuelles
export default {
  initScrollAnimations,
  initCounterAnimations,
  initParticleBackground,
  initSmoothScroll,
  initAllAnimations
};
