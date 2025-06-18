let highestZ = 1;

class Paper {
  holdingPaper = false;
  mouseTouchX = 0;
  mouseTouchY = 0;
  mouseX = 0;
  mouseY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  velX = 0;
  velY = 0;
  rotation = Math.random() * 30 - 15;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    // Get initial rotation from CSS instead of random
    const computedStyle = window.getComputedStyle(paper);
    const matrix = computedStyle.transform;
    if (matrix !== 'none') {
      const values = matrix.split('(')[1].split(')')[0].split(',');
      const a = values[0];
      const b = values[1];
      this.rotation = Math.round(Math.atan2(b, a) * (180/Math.PI));
    } else {
      this.rotation = Math.random() * 20 - 10;
    }

    // Start with centered position (CSS handles initial placement)
    this.currentPaperX = 0;
    this.currentPaperY = 0;

    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
      // Prevent text selection during drag
      if(this.holdingPaper) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      if(!this.rotating) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        // Smoother velocity calculation with interpolation
        this.velX = (this.mouseX - this.prevMouseX) * 0.8;
        this.velY = (this.mouseY - this.prevMouseY) * 0.8;
      }
        
      const dirX = e.clientX - this.mouseTouchX;
      const dirY = e.clientY - this.mouseTouchY;
      const dirLength = Math.sqrt(dirX*dirX+dirY*dirY);
      const dirNormalizedX = dirX / dirLength;
      const dirNormalizedY = dirY / dirLength;

      const angle = Math.atan2(dirNormalizedY, dirNormalizedX);
      let degrees = 180 * angle / Math.PI;
      degrees = (360 + Math.round(degrees)) % 360;
      if(this.rotating) {
        this.rotation = degrees;
      }

      if(this.holdingPaper) {
        if(!this.rotating) {
          this.currentPaperX += this.velX;
          this.currentPaperY += this.velY;
          
          // Add subtle rotation during drag for natural feel
          const moveRotation = (this.velX * 0.05);
          const finalRotation = this.rotation + moveRotation;
          
          // Use requestAnimationFrame for smoother rendering
          requestAnimationFrame(() => {
            paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${finalRotation}deg) scale(1.05)`;
          });
        }
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
      }
    })

    // Mouse down handler
    paper.addEventListener('mousedown', (e) => {
      if(this.holdingPaper) return; 
      this.holdingPaper = true;
      
      // Prevent text selection
      e.preventDefault();
      document.body.classList.add('dragging');
      paper.classList.add('dragging');
      
      paper.style.zIndex = highestZ;
      highestZ += 1;
      
      // Add grab effect with better initial values
      if(e.button === 0) {
        this.mouseTouchX = e.clientX;
        this.mouseTouchY = e.clientY;
        this.prevMouseX = e.clientX;
        this.prevMouseY = e.clientY;
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
      }
      if(e.button === 2) {
        this.rotating = true;
      }
    });

    // Mouse up handler
    window.addEventListener('mouseup', () => {
      if(this.holdingPaper) {
        // Smooth settle animation
        paper.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg) scale(1)`;
        
        document.body.classList.remove('dragging');
        paper.classList.remove('dragging');
        
        // Reset transition after animation
        setTimeout(() => {
          paper.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }, 300);
      }
      this.holdingPaper = false;
      this.rotating = false;
    });

    // Touch events for mobile
    paper.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if(this.holdingPaper) return;
      this.holdingPaper = true;
      
      paper.style.zIndex = highestZ;
      highestZ += 1;
      
      const touch = e.touches[0];
      this.mouseTouchX = touch.clientX;
      this.mouseTouchY = touch.clientY;
      this.prevMouseX = touch.clientX;
      this.prevMouseY = touch.clientY;
      this.mouseX = touch.clientX;
      this.mouseY = touch.clientY;
    });

    document.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if(!this.holdingPaper) return;
      
      const touch = e.touches[0];
      this.mouseX = touch.clientX;
      this.mouseY = touch.clientY;
      
      // Smoother touch velocity
      this.velX = (this.mouseX - this.prevMouseX) * 0.8;
      this.velY = (this.mouseY - this.prevMouseY) * 0.8;
      
      this.currentPaperX += this.velX;
      this.currentPaperY += this.velY;
      
      this.prevMouseX = this.mouseX;
      this.prevMouseY = this.mouseY;
      
      // Add rotation during touch drag
      const moveRotation = (this.velX * 0.05);
      const finalRotation = this.rotation + moveRotation;
      
      requestAnimationFrame(() => {
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${finalRotation}deg) scale(1.05)`;
      });
    });

    document.addEventListener('touchend', () => {
      if(this.holdingPaper) {
        // Smooth settle for touch
        paper.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg) scale(1)`;
        
        document.body.classList.remove('dragging');
        paper.classList.remove('dragging');
        
        setTimeout(() => {
          paper.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }, 300);
      }
      this.holdingPaper = false;
      this.rotating = false;
    });

    // Prevent context menu on right click
    paper.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Keyboard support for accessibility
    paper.addEventListener('keydown', (e) => {
      const step = 20;
      let moved = false;
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          this.currentPaperY -= step;
          moved = true;
          break;
        case 'ArrowDown':
          e.preventDefault();
          this.currentPaperY += step;
          moved = true;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.currentPaperX -= step;
          moved = true;
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.currentPaperX += step;
          moved = true;
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          // Simulate double click for reset
          paper.dispatchEvent(new Event('dblclick'));
          break;
      }
      
      if (moved) {
        paper.style.transition = 'transform 0.2s ease-out';
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
        setTimeout(() => {
          paper.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }, 200);
      }
    });

    // Double click to reset position
    paper.addEventListener('dblclick', () => {
      // Reset to original CSS position
      this.currentPaperX = 0;
      this.currentPaperY = 0;
      
      // Get original rotation from CSS class
      const computedStyle = window.getComputedStyle(paper);
      const matrix = computedStyle.transform;
      if (matrix !== 'none') {
        const values = matrix.split('(')[1].split(')')[0].split(',');
        const a = values[0];
        const b = values[1];
        this.rotation = Math.round(Math.atan2(b, a) * (180/Math.PI));
      }
      
      paper.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      
      setTimeout(() => {
        paper.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      }, 600);
    });
  }
}

// Initialize papers
const papers = Array.from(document.querySelectorAll('.paper'));
papers.forEach(paper => {
  const p = new Paper();
  p.init(paper);
});

// Music toggle functionality
const musicToggle = document.getElementById('musicToggle');
const backgroundMusic = document.getElementById('backgroundMusic');
const musicNotification = document.getElementById('musicNotification');
let isPlaying = false;

// Function to show notification
function showMusicNotification() {
  musicNotification.classList.add('show');
  setTimeout(() => {
    musicNotification.classList.remove('show');
  }, 4000); // Hide after 4 seconds
}

// Function to start music
function startMusic() {
  backgroundMusic.play().then(() => {
    isPlaying = true;
    musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
    musicToggle.style.opacity = '1';
    musicToggle.style.animation = '';
    musicNotification.classList.remove('show');
    console.log('🎵 Background music started');
  }).catch(e => {
    console.log('🔇 Autoplay blocked by browser. Click the music button to start.');
    // Show visual indicators
    musicToggle.style.animation = 'pulse 2s infinite';
    musicToggle.title = 'Click to start romantic music 🎵';
    showMusicNotification();
  });
}

// Try to autoplay when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Small delay to ensure everything is loaded
  setTimeout(() => {
    startMusic();
  }, 1000);
});

// Also try when user first interacts with the page
document.addEventListener('click', function autoplayOnFirstClick() {
  if (!isPlaying) {
    startMusic();
  }
  // Remove this listener after first attempt
  document.removeEventListener('click', autoplayOnFirstClick);
}, { once: true });

musicToggle.addEventListener('click', () => {
  if (isPlaying) {
    backgroundMusic.pause();
    musicToggle.innerHTML = '<i class="fas fa-music"></i>';
    musicToggle.style.opacity = '0.7';
    musicToggle.style.animation = '';
    isPlaying = false;
  } else {
    startMusic();
  }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'r':
    case 'R':
      // Randomize all paper positions
      papers.forEach(paper => {
        const paperInstance = paper.paperInstance;
        if (paperInstance) {
          paperInstance.currentPaperX = (Math.random() - 0.5) * 400;
          paperInstance.currentPaperY = (Math.random() - 0.5) * 400;
          paperInstance.rotation = Math.random() * 60 - 30;
          
          paper.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
          paper.style.transform = `translateX(${paperInstance.currentPaperX}px) translateY(${paperInstance.currentPaperY}px) rotateZ(${paperInstance.rotation}deg)`;
          
          setTimeout(() => {
            paper.style.transition = '';
          }, 800);
        }
      });
      break;
    case 'c':
    case 'C':
      // Center all papers
      papers.forEach((paper, index) => {
        const paperInstance = paper.paperInstance;
        if (paperInstance) {
          paperInstance.currentPaperX = 0;
          paperInstance.currentPaperY = 0;
          paperInstance.rotation = (index - papers.length/2) * 10;
          
          paper.style.transition = 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
          paper.style.transform = `translateX(${paperInstance.currentPaperX}px) translateY(${paperInstance.currentPaperY}px) rotateZ(${paperInstance.rotation}deg)`;
          
          setTimeout(() => {
            paper.style.transition = '';
          }, 800);
        }
      });
      break;
    case ' ':
      e.preventDefault();
      musicToggle.click();
      break;
  }
});

// Store paper instances for keyboard controls
papers.forEach(paper => {
  const p = new Paper();
  paper.paperInstance = p;
  p.init(paper);
});

// Add some interactive effects
document.addEventListener('DOMContentLoaded', () => {
  // Create sparkle effect on hover
  papers.forEach(paper => {
    paper.addEventListener('mouseenter', () => {
      createSparkle(paper);
    });
  });
});

function createSparkle(element) {
  const sparkle = document.createElement('div');
  sparkle.innerHTML = '✨';
  sparkle.style.position = 'absolute';
  sparkle.style.pointerEvents = 'none';
  sparkle.style.fontSize = '20px';
  sparkle.style.top = Math.random() * 100 + '%';
  sparkle.style.left = Math.random() * 100 + '%';
  sparkle.style.animation = 'sparkleEffect 1s ease-out forwards';
  
  element.appendChild(sparkle);
  
  setTimeout(() => {
    sparkle.remove();
  }, 1000);
}

// Add sparkle animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
  @keyframes sparkleEffect {
    0% {
      opacity: 0;
      transform: scale(0) rotate(0deg);
    }
    50% {
      opacity: 1;
      transform: scale(1) rotate(180deg);
    }
    100% {
      opacity: 0;
      transform: scale(0) rotate(360deg);
    }
  }
`;
document.head.appendChild(style);

// Add welcome message
setTimeout(() => {
  console.log('💕 Welcome to the Interactive Love Letters! 💕');
  console.log('🎮 Controls:');
  console.log('• Drag papers to move them around');
  console.log('• Right-click to rotate');
  console.log('• Double-click to reset position'); 
  console.log('• Press "R" to randomize all positions');
  console.log('• Press "C" to center all papers');
  console.log('• Press Space to toggle music');
  console.log('• Use arrow keys to move focused paper');
}, 1000);

// Global prevention of text selection during any drag operation
document.addEventListener('selectstart', (e) => {
  if (document.body.classList.contains('dragging')) {
    e.preventDefault();
    return false;
  }
});

document.addEventListener('dragstart', (e) => {
  if (document.body.classList.contains('dragging')) {
    e.preventDefault();
    return false;
  }
});

// Prevent text selection on mobile during touch
document.addEventListener('touchstart', (e) => {
  if (e.target.closest('.paper')) {
    e.preventDefault();
  }
}, { passive: false });

// Enhanced text selection prevention
document.onselectstart = function() {
  if (document.body.classList.contains('dragging')) {
    return false;
  }
};

document.onmousedown = function() {
  if (document.body.classList.contains('dragging')) {
    return false;
  }
};