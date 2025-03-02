import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';
import { LoginComponent } from './views/login/login.component';
import { OnboardingComponent } from './views/onboarding/onboarding.component';
import { PageNotFoundComponent } from './views/page-not-found/page-not-found.component';
import { AppHomeComponent } from './views/app-home/app-home.component';
import { OnboardingGuard } from './guards/onboarding.guard';
import { AuthGuard } from './guards/auth.guard';
import { GuestGuard } from './guards/guest.guard';
import { MainFeedComponent } from './views/main-feed/main-feed.component';
import { SubjectsComponent } from './views/subjects/subjects.component';
import { ViewPostComponent } from './views/view-post/view-post.component';
import { ViewSubjectComponent } from './views/view-subject/view-subject.component';
import { CreatePostComponent } from './views/create-post/create-post.component';
import { ViewChapterComponent } from './views/view-chapter/view-chapter.component';
import { CourseHomeComponentt } from './views/course-home/course-home.component';
import { ExamComponent } from './views/exam/exam.component';
import { ExamReviewComponent } from './views/exam-review/exam-review.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [GuestGuard],
  },
  {
    path: '',
    component: AppHomeComponent,
    children: [
      {
        path: '',
        canActivate: [AuthGuard, OnboardingGuard],
        component: MainFeedComponent,
      },
      {
        path: 'file/:fileId/chapter/:chapterId',
        canActivate: [AuthGuard /* OnboardingGuard */],
        component: ViewChapterComponent,
      },
      {
        path: 'roadmap/:fileId',
        canActivate: [AuthGuard /* OnboardingGuard */],
        component: CourseHomeComponentt
      },
      {
        path: 'file/:fileId/exam/:examId',
        canActivate: [AuthGuard /* OnboardingGuard */],
        component: ExamComponent
      },
      {
        path: 'file/:fileId/exam/:examId/review',
        canActivate: [AuthGuard /* OnboardingGuard */],
        component: ExamReviewComponent
      },
      {
        path: 'subjects',
        title: 'EduNest | Subjects',
        canActivate: [AuthGuard /* OnboardingGuard */],
        component: SubjectsComponent,
      },
      {
        path: 'subject/:id',
        title: 'EduNest | View Subject',
        canActivate: [AuthGuard /* OnboardingGuard */],
        component: ViewSubjectComponent,
      },
      {
        path: 'collection',
        title: 'EduNest | Followed Subjects',
        canActivate: [AuthGuard /* OnboardingGuard */],
        component: SubjectsComponent,
      },
      {
        path: 'post',
        children: [
          {
            path: 'create',
            title: 'EduNest | Create Post',
            canActivate: [AuthGuard /* OnboardingGuard */],
            component: CreatePostComponent,
          },
          {
            path: ':postId',
            title: 'EduNest | View Post',
            component: ViewPostComponent,
          },
        ],
      },
    ],
  },
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '**',
    component: PageNotFoundComponent,
  },
];
