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
    // Add initial random position
    this.currentPaperX = (Math.random() - 0.5) * 200;
    this.currentPaperY = (Math.random() - 0.5) * 200;
    paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;

    // Mouse move handler
    document.addEventListener('mousemove', (e) => {
      if(!this.rotating) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        
        this.velX = this.mouseX - this.prevMouseX;
        this.velY = this.mouseY - this.prevMouseY;
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
        }
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;

        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      }
    })

    // Mouse down handler
    paper.addEventListener('mousedown', (e) => {
      if(this.holdingPaper) return; 
      this.holdingPaper = true;
      
      paper.style.zIndex = highestZ;
      highestZ += 1;
      
      // Add grab effect
      paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg) scale(1.02)`;
      
      if(e.button === 0) {
        this.mouseTouchX = this.mouseX;
        this.mouseTouchY = this.mouseY;
        this.prevMouseX = this.mouseX;
        this.prevMouseY = this.mouseY;
      }
      if(e.button === 2) {
        this.rotating = true;
      }
    });

    // Mouse up handler
    window.addEventListener('mouseup', () => {
      if(this.holdingPaper) {
        paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg) scale(1)`;
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
      
      this.velX = this.mouseX - this.prevMouseX;
      this.velY = this.mouseY - this.prevMouseY;
      
      this.currentPaperX += this.velX;
      this.currentPaperY += this.velY;
      
      this.prevMouseX = this.mouseX;
      this.prevMouseY = this.mouseY;
      
      paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
    });

    document.addEventListener('touchend', () => {
      this.holdingPaper = false;
      this.rotating = false;
    });

    // Prevent context menu on right click
    paper.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    // Double click to reset position
    paper.addEventListener('dblclick', () => {
      this.currentPaperX = (Math.random() - 0.5) * 200;
      this.currentPaperY = (Math.random() - 0.5) * 200;
      this.rotation = Math.random() * 30 - 15;
      
      paper.style.transition = 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
      paper.style.transform = `translateX(${this.currentPaperX}px) translateY(${this.currentPaperY}px) rotateZ(${this.rotation}deg)`;
      
      setTimeout(() => {
        paper.style.transition = '';
      }, 500);
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
let isPlaying = false;

musicToggle.addEventListener('click', () => {
  if (isPlaying) {
    backgroundMusic.pause();
    musicToggle.innerHTML = '<i class="fas fa-music"></i>';
    musicToggle.style.opacity = '0.7';
  } else {
    backgroundMusic.play().catch(e => {
      console.log('Audio play failed:', e);
    });
    musicToggle.innerHTML = '<i class="fas fa-pause"></i>';
    musicToggle.style.opacity = '1';
  }
  isPlaying = !isPlaying;
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
}, 1000);