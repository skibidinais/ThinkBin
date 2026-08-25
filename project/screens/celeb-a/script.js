// ThinkCeleb - Level Victory Screen Script

// Web Audio API Joyful Sound Generator
class SoundManager {
    constructor() {
        this.ctx = null;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    playTone(freq, duration = 0.15, type = 'sine', startTimeOffset = 0, gainLevel = 0.15) {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + startTimeOffset);

        gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime + startTimeOffset);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + startTimeOffset + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + startTimeOffset);
        osc.stop(this.ctx.currentTime + startTimeOffset + duration);
    }

    playVictoryChime() {
        this.init();
        // Joyful ascending major chord fanfare
        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
        notes.forEach((freq, index) => {
            this.playTone(freq, 0.35, 'triangle', index * 0.1, 0.18);
        });
    }

    playPop() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
    }

    playBoing() {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(650, this.ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(0.22, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }
}

const sounds = new SoundManager();

// Confetti Blast Effect
function triggerConfetti() {
    if (typeof confetti === 'function') {
        // Center Burst
        confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FFE600', '#56C910', '#00D0FF', '#FF5577', '#FFFFFF']
        });

        // Side Cannons
        setTimeout(() => {
            confetti({
                particleCount: 40,
                angle: 60,
                spread: 55,
                origin: { x: 0.2, y: 0.7 },
                colors: ['#FFE600', '#56C910', '#00D0FF', '#FFFFFF']
            });
            confetti({
                particleCount: 40,
                angle: 120,
                spread: 55,
                origin: { x: 0.8, y: 0.7 },
                colors: ['#FFE600', '#56C910', '#00D0FF', '#FFFFFF']
            });
        }, 150);
    }
}

// Interactive Elements
document.addEventListener('DOMContentLoaded', () => {
    const character = document.getElementById('character');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    const levelNumSpan = document.querySelector('.level-num');
    const crowns = document.querySelectorAll('.crown-item');
    const completedText = document.getElementById('completedText');

    // Parse Node ID from URL
    const params = new URLSearchParams(window.location.search);
    let currentNodeId = parseInt(params.get("nodeId") || params.get("node") || params.get("level") || "0", 10);
    if (!currentNodeId) {
        currentNodeId = parseInt(localStorage.getItem('thinkbin_current_node') || '1', 10);
    }

    if (levelNumSpan) {
        levelNumSpan.textContent = currentNodeId;
    }

    // Trigger initial celebration after short delay
    setTimeout(() => {
        triggerConfetti();
        sounds.playVictoryChime();
    }, 400);

    // Clicking Character jumps playfully
    if (character) {
        character.addEventListener('click', () => {
            sounds.playBoing();
            character.style.animation = 'none';
            character.offsetHeight; // trigger reflow
            character.style.animation = 'jumpBob 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
            
            triggerConfetti();

            setTimeout(() => {
                character.style.animation = 'jumpBob 2.8s ease-in-out infinite';
            }, 600);
        });
    }

    // Clicking Crowns plays pop sound and spark
    crowns.forEach((crown, index) => {
        crown.addEventListener('click', () => {
            sounds.playPop();
            crown.style.transform = `scale(1.3) translateY(${index === 1 ? -12 : 8}px)`;
            setTimeout(() => {
                crown.style.transform = '';
            }, 300);
        });
    });

    // Next Level Button -> Navigate back to Learning Map
    if (nextLevelBtn) {
        nextLevelBtn.addEventListener('click', () => {
            sounds.playPop();
            triggerConfetti();
            localStorage.setItem('thinkbin_last_completed_node', String(currentNodeId));

            setTimeout(() => {
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({ type: 'navigate', screen: 'learning-map' }, '*');
                } else {
                    window.location.href = '../learning-map/index.html';
                }
            }, 300);
        });
    }
});
