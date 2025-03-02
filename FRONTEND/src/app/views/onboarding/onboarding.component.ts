import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SelectButton } from 'primeng/selectbutton';
import { DropdownModule } from 'primeng/dropdown';
import { StepsModule } from 'primeng/steps';
import { InputTextModule } from 'primeng/inputtext';
import { ThemeToggleComponent } from '../../components/theme-toggle/theme-toggle.component';
import { AuthService } from '../../services/auth.service';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { CustomLoadingComponent } from '../../components/custom-loading/custom-loading.component';
import {
  trigger,
  style,
  transition,
  animate,
  query,
  stagger,
} from '@angular/animations';
import { getNames } from 'country-list';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

export function noNumbersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (/\d/.test(value)) {
      return { containsNumbers: true };
    }
    return null;
  };
}

interface SelectOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-onboarding',
  imports: [CommonModule, ButtonModule, TranslateModule, ReactiveFormsModule, SelectButton, DropdownModule, StepsModule, InputTextModule, ThemeToggleComponent, ToastModule, CustomLoadingComponent],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss',
  providers: [MessageService],
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
            style({ opacity: 0, transform: 'translateY(20%)' }),
            stagger('100ms', [
              animate(
                '300ms ease-out',
                style({ opacity: 1, transform: 'translateY(0)' })
              ),
            ]),
          ]
        ),
      ]),
    ]),
  ],
})
export class OnboardingComponent implements OnInit {
  steps: MenuItem[] = [];
  currentStep: number = 0;
  onboardingForm: FormGroup;
  isLoading: boolean = true;
  countries: string[] = [];
  universities: string[] = [];
  educationLevels: SelectOption[] = [];
  usageTypes: SelectOption[] = [];

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private messageService: MessageService, private translate: TranslateService) {
    this.onboardingForm = this.fb.group({
      firstname: ['', [Validators.required, noNumbersValidator()]],
      lastname: ['', [Validators.required, noNumbersValidator()]],
      country: ['', Validators.required],
      university: ['', Validators.required],
      educationLevel: ['', Validators.required],
      usagePlan: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.countries = getNames();
    this.universities = this.authService.getUniversities();
    this.loadTranslations();

    setTimeout(() => {
      this.isLoading = false;
    }, 2000);
  }

  private loadTranslations() {
    // Translate steps
    this.steps = [
      {
        label: this.translate.instant('ONBOARDING.STEPS.PERSONAL_INFO'),
        routerLink: 'personal'
      },
      {
        label: this.translate.instant('ONBOARDING.STEPS.EDUCATION'),
      }
    ];

    // Translate education levels
    this.educationLevels = [
      { label: this.translate.instant('ONBOARDING.EDUCATION_LEVELS.SCHOOL'), value: 'school' },
      { label: this.translate.instant('ONBOARDING.EDUCATION_LEVELS.UNDERGRADUATE'), value: 'undergraduate' },
      { label: this.translate.instant('ONBOARDING.EDUCATION_LEVELS.MASTER'), value: 'master' },
      { label: this.translate.instant('ONBOARDING.EDUCATION_LEVELS.OTHER'), value: 'other' }
    ];

    // Translate usage types
    this.usageTypes = [
      { label: this.translate.instant('ONBOARDING.USAGE_TYPES.EXAM_PREP'), value: 'exam_prep' },
      { label: this.translate.instant('ONBOARDING.USAGE_TYPES.GENERAL_STUDY'), value: 'general_study' },
      { label: this.translate.instant('ONBOARDING.USAGE_TYPES.TUTORING'), value: 'tutoring' },
      { label: this.translate.instant('ONBOARDING.USAGE_TYPES.OTHER'), value: 'other' }
    ];
  }

  nextStep() {
    if (this.currentStep === 0 && this.isPersonalInfoValid()) {
      this.currentStep = 1;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  isPersonalInfoValid(): boolean {
    return this.onboardingForm.get('firstname')!.valid &&
           this.onboardingForm.get('lastname')!.valid &&
           this.onboardingForm.get('country')!.valid &&
           this.onboardingForm.get('university')!.valid;
  }

  onSubmit() {
    if (this.onboardingForm.valid) {
      this.authService.sendOnboardingInfo(
        this.onboardingForm.value.firstname,
        this.onboardingForm.value.lastname,
        this.onboardingForm.value.country,
        this.onboardingForm.value.university,
        this.onboardingForm.value.educationLevel,
        this.onboardingForm.value.usagePlan
      ).subscribe(response => {
        this.router.navigate(['/']);
      }, error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while submitting your information'
        });
        console.error('Error submitting onboarding information', error);
      });
    }
  }
}
