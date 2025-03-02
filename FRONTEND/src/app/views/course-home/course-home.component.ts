import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
// import { CourseService } from '../../services/data/course.service';
import { CommonModule } from '@angular/common';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { FileService } from '../../services/file.service';

@Component({
  selector: 'app-course-home',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BreadcrumbModule, ToastModule],
  templateUrl: './course-home.component.html',
  styleUrl: './course-home.component.scss',
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
        query(
          'div',
          [
            style({ opacity: 0 }),
            stagger('30ms', [
              animate(
                '300ms ease-out',
                style({ opacity: 1 })
              ),
            ]),
          ]
        ),
      ]),
    ]),
  ],
})
export class CourseHomeComponentt implements OnInit {
  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/' };
  isMobile: boolean = window.innerWidth <= 768;

  constructor(private route: ActivatedRoute, /* private courseService: CourseService, */ private router: Router, private messageService: MessageService, private fileService: FileService) { }
  fileId: string | null = null;
  roadmapData: any;
  courseTitle: string | null = null;

  ngOnInit(): void {
    this.fileId = this.route.snapshot.paramMap.get('fileId');

    if (this.fileId) {
      this.loadRoadmapData(this.fileId);
    }

    this.checkScreenSize();
  }

  loadRoadmapData(courseId: string): void {
    this.fileService.getTitles(courseId).subscribe({
      next: (data: { document_id: string; titles: { id: number; title: string | null; type: string }[] }) => {
      this.roadmapData = data.titles.map((item, index) => ({
        ...item,
        completed: false, // Assuming a default value for completed
        onModel: item.type // Assuming type is the model type
      }));
      this.courseTitle = data.titles[0]?.title || 'Untitled Course';

      this.breadcrumbItems = [
        { label: 'Home', routerLink: `/post/${localStorage.getItem('selectedPostId')}` },
        { label: this.courseTitle }
      ];
      },
      error: (err: any) => {
      console.error('Error fetching course titles:', err);
      }
    });
    /* this.courseService.getCourseRoadmap(courseId).subscribe({
      next: (data) => {
        this.roadmapData = data.roadmap;
        this.courseTitle = data.title;
        this.courseDescription = data.description;

        this.breadcrumbItems = [
          { label: 'Home', routerLink: `/workspace/${localStorage.getItem('selectedWorkspaceId')}` },
          { label: this.courseTitle! }
        ];
      },
      error: (err) => {
        console.error('Error fetching course roadmap:', err);
      }
    }); */
  }

  getRoadmapClass(item: any, index: number): { [key: string]: boolean } {
    const firstNotCompletedIndex = this.roadmapData.findIndex((x: any) => !x.completed);

    // Determine classes
    return {
      completed: item.completed,
      'first-not-completed': !item.completed && index === firstNotCompletedIndex,
      'not-completed': !item.completed && index !== firstNotCompletedIndex,
    };
  }

  onRoadmapItemClick(item: any): void {
    console.log('Roadmap item clicked:', item);

    if (item.onModel === 'chapter') {
      this.router.navigate([`/file/${this.fileId}/chapter/${item.id}`]);
    } else if (item.onModel === 'exam') {
      const previousChaptersCompleted = this.roadmapData
        .slice(0, this.roadmapData.indexOf(item))
        .filter((x: any) => x.onModel === 'Chapter')
        .every((x: any) => x.completed);

      if (previousChaptersCompleted) {
        this.router.navigate([`/file/${this.fileId}/exam/${item.id}`]);
      } else {
        this.messageService.add({ severity: 'warn', summary: 'Warning', detail: 'Complete all previous chapters before taking the exam.' });
        console.warn('Complete all previous chapters before taking the exam.');
      }
    } else if (item.onModel === 'exam_review') {
      this.router.navigate([`/file/${this.fileId}/exam/${item.id - 1}/review`]);
    }
  }

  getRoadmapLineImage(index: number): string {
    if (this.isMobile) {
      return 'url(/assets/img/down-hand-drawn.png)';
    }
    return index % 2 === 0
      ? 'url(/assets/img/right-hand-drawn.png)'
      : 'url(/assets/img/left-hand-drawn.png)';
  }

  @HostListener('window:resize', [])
  checkScreenSize() {
    this.isMobile = window.innerWidth <= 768;
  }
}
