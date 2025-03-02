import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
// import { CourseService } from '../../services/data/course.service';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MarkdownModule } from 'ngx-markdown';
import { ThemeService } from '../../services/theme.service';
import { SkeletonModule } from 'primeng/skeleton';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';
import { QuizComponent } from '../../components/quiz/quiz.component';
import { SidebarStateService } from '../../services/sidebar-state.service';
import { FlashcardComponent } from '../../components/flashcard/flashcard.component';
// import { ProgressWebsocketService } from '../../services/progress-websocket.service';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DialogModule } from 'primeng/dialog';
import { MenuItem, MessageService } from 'primeng/api';
import { ConfettiService } from '../../services/confetti.service';
// import { MathJaxService } from '../../services/helper/mathjax.service';
// import { MathJaxParagraphComponent } from '../math-jax-paragraph/math-jax-paragraph.component';
// import { SplitMathPipe } from '../../pipes/split-math.pipe'; 
import { Menu } from 'primeng/menu';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-view-chapter',
  templateUrl: './view-chapter.component.html',
  imports: [MarkdownModule, CommonModule, ButtonModule, SkeletonModule, Menu, FlashcardComponent, TranslateModule, QuizComponent, RouterModule, DialogModule],
  styleUrl: './view-chapter.component.scss',
  animations: [
    // Content wrapper animation: Appears with fade and slide-in
    trigger('contentAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(15px)' }),
        animate(
          '500ms ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),

    // Stagger animation for list items
    trigger('listAnimation', [
      transition(':enter', [
        query('*',
          [
            style({ opacity: 0, transform: 'translateY(20%)' }),
            stagger('30ms', [
              animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
          ],
          { optional: true }
        ),
      ]),
    ]),

    // Animation for resetting sections (forces animation restart)
    trigger('sectionChange', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('0ms', style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class ViewChapterComponent implements OnInit {
  @ViewChild('siteHeader') header!: ElementRef;
  sidebarOpen$: Observable<boolean> | any;
  private lastScroll = 0;
  displayCompletionDialog = false;
  menuItems: MenuItem[] = [];

  fileId: string | null = null;
  chapterId: string | null = null;
  chapter: any;
  courseData: any;
  activeSection: string = 'unit-guide';
  correctAnswers: boolean[] = [];

  currentFlashcardIndex: number = 0;

  isDarkMode = false;
  private userId: string | null = null;
  isLoading: boolean = true;

  reRenderKey = 0; 

  private websocketConnected: boolean = false;

  lineBreak(str: string): string {
    return str.replace(/\n/g, '</br>');
  }

  constructor(
    private route: ActivatedRoute,
    private sidebarStateService: SidebarStateService,
    private themeService: ThemeService,
    private fileService: FileService,
    private authService: AuthService,
    // private progressWebSocketService: ProgressWebsocketService,
    private messageService: MessageService,
    private confettiService: ConfettiService,
    private router: Router
  ) {
    this.sidebarOpen$ = this.sidebarStateService.sidebarOpen$;
  }

  ngOnInit(): void {
    // Get route parameters
    this.route.paramMap.subscribe((params) => {
      this.chapterId = params.get('chapterId');
      this.fileId = params.get('fileId');
    });

    this.menuItems = [
      {
        label: 'Flip Card Game',
        icon: 'pi pi-play',
        command: () => this.navigateToFlipCardGame()
      }
    ];

    // Subscribe to theme changes
    this.themeService.isDarkMode$.subscribe((isDarkMode) => {
      this.isDarkMode = isDarkMode;
    });

    // Fetch course and chapter data
    if (this.fileId) {
      this.fetchFileData();
    }
  }

  // Method to handle the correctAnswer event
  onCorrectAnswer(questionIndex: number): void {
    this.correctAnswers[questionIndex] = true;

    // Check if all questions are answered correctly
    if (this.correctAnswers.filter(Boolean).length === this.chapter.generatedQuestions.length) {
      this.checkAndMarkChapterCompleted();
    }
  }

  /**
 * Check if all questions are answered correctly and mark the chapter as completed.
 */
  checkAndMarkChapterCompleted(): void {
    if (this.chapter?.generatedQuestions) {
      const allCorrect = this.correctAnswers.every((correct) => correct);

      if (allCorrect) {
        this.displayCompletionDialog = true;
        
        this.confettiService.triggerConfetti();

        // Call the backend to mark the chapter as completed
        // this.courseService.setChapterCompleted(this.fileId!, this.chapterId!).subscribe({
        //   next: () => {
        //     this.messageService.add({
        //       severity: 'success',
        //       summary: 'Success',
        //       detail: 'Chapter marked as completed.',
        //     });
        //   },
        //   error: (err) => {
        //     this.messageService.add({
        //       severity: 'error',
        //       summary: 'Error',
        //       detail: 'Failed to mark chapter as completed.',
        //     });
        //   },
        // });
      }
    }
  }

  /**
  * Fetch course data and find the specific chapter being viewed.
  */
  fetchFileData(): void {
    console.log('Fetching file data...');
    this.fileService.getFileContent(this.fileId!).subscribe({
      next: (data: any) => {
      this.courseData = data;

      if (this.chapterId && this.courseData?.chapters) {
        this.chapter = this.courseData.chapters.find(
          (ch: any) => ch.id === parseInt(this.chapterId!)
        );

        if (!this.chapter) {
        console.error(`Unable to find chapter with ID: ${this.chapterId}`);
        return;
        }

        console.log('Chapter loaded:', this.chapter);

        // If processing is required, start processing and connect to WebSocket
        if (this.chapter?.need_processing) {
        console.log('Chapter needs processing. Initiating...');
        this.triggerChapterProcessing();
        }
      }
      },
      error: (err: any) => {
      console.error('Error fetching file content:', err);
      }
    });

    // this.courseService.getCourseById(this.fileId!).subscribe({
    //   next: (data) => {
    //     this.courseData = data;

    //     if (this.chapterId && this.courseData?.chapters) {
    //       this.chapter = this.courseData.chapters.find(
    //         (ch: any) => ch._id === this.chapterId
    //       );

    //       if (!this.chapter) {
    //         console.error(`Unable to find chapter with ID: ${this.chapterId}`);
    //         return;
    //       }

    //       console.log('Chapter loaded:', this.chapter);

    //       // If processing is required, start processing and connect to WebSocket
    //       if (this.chapter?.needsProcessing) {
    //         console.log('Chapter needs processing. Initiating...');
    //         this.triggerChapterProcessing();
    //       }
    //     }
    //   },
    //   error: (err) => {
    //     console.error('Error fetching course data:', err);
    //   },
    // });
  }

  /**
   * Trigger the processing of the current chapter.
   * Connect to the WebSocket to listen for progress updates.
   */
  triggerChapterProcessing(): void {
    this.fileService.generateChapter(this.fileId!, this.chapterId!).subscribe({
      next: () => {
        console.log(`Processing initiated for chapter: ${this.chapterId}`);

        // Connect to WebSocket to monitor progress
        // this.connectToWebSocket();
      }
    });

    // this.courseService.processChapter(this.fileId!, this.chapter._id).subscribe({
    //   next: () => {
    //     console.log(`Processing initiated for chapter: ${this.chapter._id}`);

    //     // Connect to WebSocket to monitor progress
    //     this.connectToWebSocket();
    //   },
    //   error: (err) => {
    //     console.error('Error initiating chapter processing:', err);
    //   },
    // });
  }

  /**
   * Connect to WebSocket to listen for progress updates.
   * Automatically disconnect when processing completes (progress = 100%).
   */
  connectToWebSocket(): void {
    if (this.websocketConnected) {
      console.log('WebSocket already connected.');
      return;
    }

    // this.authService.getUserInfo().subscribe({
    //   next: (user) => {
    //     this.userId = user._id;

    //     if (this.userId) {
    //       this.progressWebSocketService.connect(this.userId, this.onProgressUpdate.bind(this));
    //     }
    //   },
    //   error: (error) => {
    //     console.error('Error fetching user info:', error);
    //   },
    //   complete: () => {
    //     this.isLoading = false;
    //   }
    // });

    this.websocketConnected = true;
  }

  /**
   * WebSocket progress update callback.
   * Triggers a re-fetch of the chapter when processing completes.
   */
  onProgressUpdate(data: { chapterIndex?: number; examId?: string; progress: number }): void {
    console.log('Progress update from WebSocket:', data);

    // Check if the current update is for this chapter
    const chapterIndex = this.courseData?.chapters.findIndex(
      (ch: any) => ch._id === this.chapterId
    );

    if (chapterIndex === data.chapterIndex) {
      console.log(`Progress for chapter: ${this.chapterId} = ${data.progress}%`);

      if (data.progress === 100) {
        console.log(`Processing complete for chapter: ${this.chapterId}. Refreshing data...`);
        this.fetchFileData();
        this.disconnectWebSocket();
      }
    }
  }

  /**
   * Disconnect from the WebSocket to clean up resources.
   */
  disconnectWebSocket(): void {
    // if (this.websocketConnected) {
    //   console.log('Disconnecting from WebSocket...');
    //   this.progressWebSocketService.disconnect();
    //   this.websocketConnected = false;
    // }
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const currentScroll = window.pageYOffset;

    if (currentScroll > this.lastScroll && currentScroll > 50) {
      this.header.nativeElement.classList.add('header-hidden');
    } else {
      this.header.nativeElement.classList.remove('header-hidden');
    }

    this.lastScroll = currentScroll;
  }

  onSelectSection(section: string): void {
    this.activeSection = section;
    this.currentFlashcardIndex = 0; // Always reset to first card
  
    if (section === 'questions') {
      this.correctAnswers = new Array(this.chapter.generated_questions.questions.length).fill(false);
    }
  }

  get flashcards(): any[] {
    if (!this.chapter?.generated_questions?.questions) return [];
    return this.chapter.generated_questions.questions.map((question: { question: any; explanation: any; hint: any; }) => ({
      front: question.question,
      back: `${question.explanation}\n\nHint: ${question.hint}`
    }));
  }

  navigateFlashcard(direction: 'prev' | 'next') {
    if (direction === 'prev' && this.currentFlashcardIndex > 0) {
      this.currentFlashcardIndex--;
    } else if (
      direction === 'next' &&
      this.currentFlashcardIndex < this.flashcards.length - 1
    ) {
      this.currentFlashcardIndex++;
    }
  }

  ngOnDestroy(): void {
    this.disconnectWebSocket();
  }

  navigateToFlipCardGame(): void {
    if (this.fileId && this.chapterId) {
      this.router.navigate([`/card-flip-game/${this.fileId}/${this.chapterId}`]);
    }
  }
}
