import { Injectable } from '@angular/core';

interface ConfettiOptions {
  particleCount?: number;
  spread?: number;
  origin?: { x: number; y: number };
  colors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class ConfettiService {
  private confetti: any;

  constructor() {
    // Dynamically import canvas-confetti library
    import('canvas-confetti').then(module => {
      this.confetti = module.default;
    });
  }

  /**
   * Trigger confetti effect
   * @param options Customization options for the confetti
   */
  triggerConfetti(options: ConfettiOptions = {}): void {
    if (!this.confetti) {
      console.warn('Confetti library not loaded');
      return;
    }

    const defaultOptions: ConfettiOptions = {
      particleCount: 100,
      spread: 70,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#26ccff', '#a25afd', '#ff5e7e', '#88ff5a', '#fcff42']
    };

    const mergedOptions = { ...defaultOptions, ...options };

    this.confetti(mergedOptions);
    
    // Optional: Add a second burst for more excitement
    setTimeout(() => {
      this.confetti({
        ...mergedOptions,
        particleCount: 50,
        spread: 100
      });
    }, 400);
  }
}