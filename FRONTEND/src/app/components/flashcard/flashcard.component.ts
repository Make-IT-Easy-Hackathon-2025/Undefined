import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-flashcard',
  imports: [CommonModule, ButtonModule, TooltipModule],
  templateUrl: './flashcard.component.html',
  styleUrl: './flashcard.component.scss'
})
export class FlashcardComponent {
  @Input() flashcard: any;
  @Input() currentIndex: number = 0;
  @Input() totalCards: number = 0;

  isFlipped = false;

  flipCard() {
    this.isFlipped = !this.isFlipped;
  }

  rateCard(rating: 'bad' | 'ok' | 'good') {
    // Handle the rating logic here
    console.log(`Card rated as: ${rating}`);
  }

  navigate(direction: 'prev' | 'next') {
    if (direction === 'prev' && this.currentIndex > 0) {
      this.currentIndex--;
    } else if (direction === 'next' && this.currentIndex < this.totalCards - 1) {
      this.currentIndex++;
    }
    this.isFlipped = false; // Reset flip state when navigating
  }
}
