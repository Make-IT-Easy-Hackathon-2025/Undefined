import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-quiz',
  imports: [CommonModule, TranslateModule, ButtonModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.scss'
})
export class QuizComponent {
  @Input() quizData: any;
  @Input() questionIndex!: number;
  @Output() correctAnswer = new EventEmitter<void>();

  selectedWrong = false;
  selectedCorrect = false;

  onSelectOption(option: any) {
    if (this.selectedCorrect) return;

    if (option.isCorrect) {
      option.correct = true;
      this.selectedCorrect = true;
      this.selectedWrong = false;

      this.quizData.options.forEach((opt: any) => {
        opt.wrong = false;
        opt.disabled = true;
      });

      this.correctAnswer.emit();
    } else {
      option.wrong = true;
      this.selectedWrong = true;

      setTimeout(() => {
        option.wrong = false;
      }, 5000);
    }
  }
}
