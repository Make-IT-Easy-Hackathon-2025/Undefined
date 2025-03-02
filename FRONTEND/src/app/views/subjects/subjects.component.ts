import { Component, EventEmitter, OnInit } from '@angular/core';
import { SubjectService } from '../../services/subject.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { PaginatorModule } from 'primeng/paginator';
import { Router, ActivatedRoute } from '@angular/router';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-subjects',
  templateUrl: './subjects.component.html',
  styleUrls: ['./subjects.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    InputTextModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    InputGroupModule,
    InputGroupAddonModule,
    PaginatorModule
  ],
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
        query('*', [
          style({ opacity: 0, transform: 'translateY(20%)' }),
          stagger('30ms', [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
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
export class SubjectsComponent implements OnInit {
  subjects: any[] = [];
  filteredSubjects: any[] = [];
  paginatedSubjects: any[] = [];
  searchQuery: string = '';
  yearFilter: string = '';
  filterByUser: boolean = false;
  yearOptions: any[] = [
    { label: 'All Years', value: '' },
    { label: 'I', value: '1' },
    { label: 'II', value: '2' },
    { label: 'III', value: '3' },
    { label: 'IV', value: '4' }
  ];
  currentPage: number = 0;
  totalRecords: number = 0;

  constructor(
    private subjectService: SubjectService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    let route = this.route.snapshot;
    if(route.url[0].path === 'collection') {
      this.filterByUser = true;
    }
    if(route.queryParams['q']) {
      this.searchQuery = route.queryParams['q'];
    }
    this.loadSubjects();
  }

  // Load subjects based on search query
  loadSubjects(): void {
    if(this.filterByUser) {
      this.subjectService.getFollowedSubjects().subscribe(subjects => {
        this.subjects = subjects.map((subject: any) => {
          subject.is_subscribed = true;
          return subject;
        });
        this.applyFilters();
      });
    } else {
      this.subjectService.getSubjects(this.searchQuery).subscribe(subjects => {
        this.subjects = subjects;
        this.applyFilters(); // Apply both search and year filters
      });
    }
  }

  loadFollowedSubjects(): void {
  }

  // Apply both search and year filters
  applyFilters(): void {
    this.filteredSubjects = this.subjects.filter(subject => {
      // Check if the subject matches the search query
      const matchesSearch = !this.searchQuery ||
                            subject.title.toLowerCase().includes(this.searchQuery.toLowerCase());

      // Check if the subject matches the year filter
      const matchesYear = !this.yearFilter ||
                          (subject.year && subject.year.toString() === this.yearFilter);

      return matchesSearch && matchesYear;
    });

    this.totalRecords = this.filteredSubjects.length;
    this.updatePaginatedSubjects();
  }

  // Convert year to Roman numeral
  toRoman(num: number): string {
    const romanNumerals = ['I', 'II', 'III', 'IV'];
    if (num) {
      return romanNumerals[num - 1] || num.toString();
    }
    return '';
  }

  // Handle year filter change
  filterByYear(): void {
    this.applyFilters(); // Reapply filters when year filter changes
  }

  // Toggle follow/unfollow
  toggleFollow(event: any, subject: any): void {
    event.stopPropagation();
    this.subjectService.toggleFollow(subject.id, subject.is_subscribed).subscribe(() => {
      subject.is_subscribed = !subject.is_subscribed;
      this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Follow status updated' });
    });
  }

  // Handle search when Enter is pressed
  onSearch(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.searchQuery },
      queryParamsHandling: 'merge'
    });

    this.loadSubjects(); // This will call applyFilters internally
  }

  // Handle pagination
  onPageChange(event: any): void {
    this.currentPage = event.page;
    this.updatePaginatedSubjects();
  }

  // Update paginated subjects
  updatePaginatedSubjects(): void {
    const startIndex = this.currentPage * 10;
    const endIndex = startIndex + 10;
    this.paginatedSubjects = this.filteredSubjects.slice(startIndex, endIndex);
  }

  onSubjectClick(subject: any): void {
    this.router.navigate(['/subject', subject.id]);
  }
}
