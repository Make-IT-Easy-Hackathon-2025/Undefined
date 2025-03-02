// exam-review.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CommonModule } from '@angular/common';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-exam-review',
  imports: [BreadcrumbModule, TranslateModule, CommonModule, TranslateModule],
  templateUrl: './exam-review.component.html',
  styleUrl: './exam-review.component.scss'
})
export class ExamReviewComponent implements OnInit {
  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  fileId: string | null = null;
  chapterId: string | null = null;
  examSubmission: any = null; // Holds the submitted exam data
  originalExam: any = null; // Holds the original exam data

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Get fileId and chapterId from route params
    this.route.paramMap.subscribe((params) => {
      this.fileId = params.get('fileId');
      this.chapterId = params.get('examId');

      if (this.fileId && this.chapterId) {
        this.loadExam();
      }
    });
  }

  /**
   * Load the exam submission and the original exam data
   */
  loadExam(): void {
    // Load the submitted exam data
    this.fileService.getExamSubmissionByFileAndChapter(this.fileId!, this.chapterId!).subscribe({
      next: (submissionData: any) => {
        if (submissionData) {
          this.examSubmission = submissionData;

          // Load the original exam data
          this.fileService.getFileContent(this.fileId!).subscribe({
            next: (fileData: any) => {
              const examIndex = fileData.chapters.findIndex((item: any) => item.id == this.chapterId);
              if (examIndex !== -1) {
                this.originalExam = fileData.chapters[examIndex];
                this.breadcrumbItems = [
                  { label: 'Home', routerLink: `/roadmap/${this.fileId}` },
                  { label: 'Exam Review' },
                ];
              } else {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Original exam not found.' });
              }
            },
            error: () => {
              this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load original exam.' });
            },
          });
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No exam submission found.' });
        }
      },
      error: () => {
        console.error('Failed to load exam submission.');
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load exam submission.' });
      },
    });
  }

  /**
   * Get the original question by its number
   */
  getOriginalQuestion(questionNumber: number): any {
    return this.originalExam?.generated_questions?.questions[questionNumber - 1]; // Convert to 0-based index
  }

  /**
   * Get the text of the selected option
   */
  getSelectedOptionText(questionNumber: number): string {
    const question = this.getOriginalQuestion(questionNumber);
    const selectedAnswerIndex = this.examSubmission.results.find((r: any) => r.question_number === questionNumber)?.selected_answer;
    return question?.options[selectedAnswerIndex - 1]?.text || 'Unknown Option'; // Convert to 0-based index
  }

  /**
   * Get the text of the correct option
   */
  getCorrectOptionText(questionNumber: number): string {
    const question = this.getOriginalQuestion(questionNumber);
    const correctAnswerIndex = this.examSubmission.results.find((r: any) => r.question_number === questionNumber)?.correct_answer;
    return question?.options[correctAnswerIndex - 1]?.text || 'Unknown Option'; // Convert to 0-based index
  }
}
