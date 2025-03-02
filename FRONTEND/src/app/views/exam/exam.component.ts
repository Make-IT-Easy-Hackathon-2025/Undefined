import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { ExamService } from '../../services/data/exam.service';
import { MenuItem, MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProgressWebsocketService } from '../../services/progress-websocket.service';
import { ProgressBarModule } from 'primeng/progressbar';
import { StepsModule } from 'primeng/steps';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TranslateModule } from '@ngx-translate/core';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { CustomLoadingComponent } from '../../components/custom-loading/custom-loading.component';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-exam',
  imports: [CommonModule, RouterModule, ProgressBarModule, StepsModule, ProgressSpinnerModule, TranslateModule, BreadcrumbModule, DialogModule, ButtonModule, CustomLoadingComponent],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.scss'
})
export class ExamComponent implements OnInit, OnDestroy {
  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };

  examId: string | null = null;
  fileId: string | null = null;
  exam: any = null;
  isProcessing = false;
  private userId: string | null = null;
  private websocketConnected: boolean = false;

  currentQuestionIndex = 0;
  totalQuestions = 0;
  isExamSubmitted = false;
  selectedOptionIndex: number | null = null;

  progress = 0;
  stepsModel: MenuItem[] = [];
  selectedAnswers: any[] = [];
  displayStatusDialog = false;
  examStatus = '';

  loadingMessages = [
    "Sharpening pencils...",
    "Clearing distractions...",
    "Charging brain cells...",
    "Reviewing notes...",
    "Finding motivation...",
    "Generating exam...",
    "Brewing coffee...",
    "Preparing for greatness...",
    "Organizing desk...",
    "Almost there..."
  ];

  loadingMessageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private progressWebsocketService: ProgressWebsocketService,
    private messageService: MessageService,
    private router: Router,
    private fileService: FileService
  ) { }

  ngOnInit(): void {
    // Get fileId and examId from route params
    this.route.paramMap.subscribe((params) => {
      this.examId = params.get('examId');
      this.fileId = params.get('fileId');

      console.log('Exam ID:', this.examId);
      console.log('File ID:', this.fileId);

      if (this.fileId && this.examId) {
        this.loadExam();
      }
    });

    // Fetch user info for WebSocket connection
    // this.authService.getUserInfo().subscribe({
    //   next: (user) => {
    //     this.userId = user._id;
    //   },
    //   error: (err) => {
    //     console.error('Error fetching user info:', err);
    //   },
    // });
  }

  /**
   * Load the exam and determine if processing is required.
   */
  loadExam(): void {
    this.fileService.getFileContent(this.fileId!).subscribe({
      next: (data: any) => {
        console.log('File content:', data);

        let idx = data.chapters.findIndex((item: any) => item.id == this.examId);
        if(idx == -1) {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load exam.' });
          return;
        }
        this.exam = data.chapters[idx];

        if (this.exam.need_processing) {
          this.messageService.add({ severity: 'info', summary: 'Info', detail: 'Processing exam started...' });
          this.processExam();
          return;
        }

        this.totalQuestions = this.exam.generated_questions.questions.length;

        this.breadcrumbItems = [
          { label: 'Home', routerLink: `/roadmap/${this.fileId}` },
          { label: this.exam.title }
        ];

        // Initialize selected answers array
        this.selectedAnswers = new Array(this.totalQuestions).fill(null);

        console.log('Exam loaded:', this.exam);

      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load exam.' });
      },
    });
  }

  onSelectOption(option: any, index: number): void {
    if (!this.exam || !this.exam.generated_questions.questions[this.currentQuestionIndex]) {
      return;
    }

    // Store the selected answer index (0-3)
    this.selectedAnswers[this.currentQuestionIndex] = index;

    this.selectedOptionIndex = index;
  }

  updateProgress(): void {
    this.progress = ((this.currentQuestionIndex + 1) / this.totalQuestions) * 100;
  }

  updateSteps(): void {
    // Enable current and previous steps
    this.stepsModel.forEach((step, index) => {
      step.disabled = index > this.currentQuestionIndex;
    });
  }

  submitExam(): void {
    this.isExamSubmitted = true;

    if (!this.exam?.generated_questions?.questions) return;

    const submissionData = {
      exam_id: this.examId,
      answers: this.exam.generated_questions.questions.map((_: any, index: number) => ({
        question_number: index + 1, // Convert to 1-based numbering
        answer: this.selectedAnswers[index] + 1// 0-3 index of selected option
      }))
    };

    console.log('Submitting:', submissionData);

    this.fileService.submitExam(submissionData).subscribe({
      next: (response: any) => {
        this.router.navigate(['review'], { relativeTo: this.route });
      },
      error: (err: any) => {
        console.error("Submission failed", err);
        this.displayStatusDialog = false;
      },
    });
  }

  goToPreviousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToNextQuestion(): void {
    if (this.currentQuestionIndex < this.totalQuestions - 1) {
      this.currentQuestionIndex++;
      this.selectedOptionIndex = null;
    } else {
      this.submitExam();
    }
  }

  /**
   * Trigger exam processing.
   * Connect to WebSocket and wait for progress updates.
   */
  processExam(): void {
    this.isProcessing = true;
    this.startProcessing();

    this.fileService.generateExam(this.fileId!, this.examId!).subscribe({
      next: () => {
        // this.messageService.add({ severity: 'success', summary: 'Processing', detail: 'Exam processing initiated.' });

        // Connect to WebSocket to monitor progress
        // this.connectToWebSocket();
      },
      error: () => {
        this.isProcessing = false;
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to generate exam.' });
      },
    });
  }

  /**
   * Connect to WebSocket and listen for progress updates.
   */
  connectToWebSocket(): void {
    if (this.websocketConnected || !this.userId) {
      console.log('WebSocket is already connected or user ID is missing.');
      return;
    }

    console.log('Connecting to WebSocket...');
    this.progressWebsocketService.connect(this.userId!, this.onProgressUpdate.bind(this));
    this.websocketConnected = true;
  }

  /**
   * Callback for WebSocket progress updates.
   */
  onProgressUpdate(data: { chapterIndex?: number; examId?: string; progress: number }): void {
    console.log('Progress update from WebSocket:', data);

    if (data.examId === this.examId) {
      console.log(`Progress for exam: ${this.examId} = ${data.progress}%`);

      if (data.progress === 100) {
        console.log(`Processing complete for exam: ${this.examId}. Reloading exam data...`);
        this.loadExam();
        this.disconnectWebSocket();
        this.isProcessing = false;
      } else if (data.progress === -1) {
        console.error('Processing failed for exam:', this.examId);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to process exam.' });
        this.disconnectWebSocket();
        this.isProcessing = false;
        console.log('isProcessing set to false due to error.');
      }
    } else {
      console.log('Progress update is not for the current exam.');
    }
  }

  /**
   * Disconnect from WebSocket.
   */
  disconnectWebSocket(): void {
    if (this.websocketConnected) {
      console.log('Disconnecting from WebSocket...');
      this.progressWebsocketService.disconnect();
      this.websocketConnected = false;
    }
  }

  ngOnDestroy(): void {
    // Clean up resources by disconnecting WebSocket
    this.disconnectWebSocket();
  }

  retryExam(): void {
    window.location.reload();
  }

  goToRoadmap(): void {
    if (this.fileId) {
      this.router.navigate(['/course/roadmap', this.fileId]);
    } else {
      console.error('Course ID is missing.');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to navigate to roadmap.' });
    }
  }

  startProcessing() {
    this.shuffleMessages();
    let index = 0;
    const interval = setInterval(() => {
      this.loadingMessageIndex = index;
      index++;
      if (index >= this.loadingMessages.length) {
        clearInterval(interval);
      }
    }, 2000);
  }

  shuffleMessages() {
    this.loadingMessages = this.loadingMessages.sort(() => Math.random() - 0.5);
  }
}
