import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { SubjectService } from '../../services/subject.service';
import { PostService } from '../../services/post.service';
import { Router } from '@angular/router';
import TurndownService from 'turndown';

@Component({
  selector: 'app-post-form',
  imports: [ButtonModule, CardModule, ToastModule, FileUploadModule, EditorModule, InputTextModule, ReactiveFormsModule, AutoCompleteModule],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.scss'
})
export class PostFormComponent {
  postForm: FormGroup;
  subjects: any[] = [];
  filteredSubjects: any[] = [];
  uploadedFiles: File[] = [];
  turndownService = new TurndownService();
  modules = {
    toolbar: [
      [{ size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline'],
    ]
  };

  constructor(private fb: FormBuilder, private subjectService: SubjectService, private postService: PostService, private router: Router) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      subject: ['', Validators.required],
      body: ['', Validators.required]
    });
    this.subjectService.getSubjects().subscribe(subjects => this.subjects = subjects);
    this.turndownService.addRule('qlSizeHuge', {
      filter: (node) => {
        return (
          node.nodeName === 'SPAN' &&
          node.getAttribute('class')?.includes('ql-size-huge') || false
        );
      },
      replacement: (content) => {
        return `\n## ${content}\n`;
      },});
      this.turndownService.addRule('qlSizeLarge', {
        filter: (node) => {
          return (
            node.nodeName === 'SPAN' &&
            node.getAttribute('class')?.includes('ql-size-large') || false
          );
        },
        replacement: (content) => {
          return `\n### ${content}\n`;
      },});
      this.turndownService.addRule('qlSizeSmall', {
        filter: (node) => {
          return (
            node.nodeName === 'SPAN' &&
            node.getAttribute('class')?.includes('ql-size-small') || false
          );
        },
        replacement: (content) => {
          return `\n<small> ${content}</small>\n`;
      },});
      this.turndownService.addRule('qlSizeSmall', {
        filter: (node) => {
          return node.nodeName === 'U';
        },
        replacement: (content) => {
          return `\n<u> ${content}</u>\n`;
      },});
  }

  searchSubjects(event: any) {
    const query = event.query;
    this.filteredSubjects =  this.subjects.filter(subject => subject.title.toLowerCase().includes(query.toLowerCase()));
  }

  onFileSelect(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
    console.log('Selected Files:', this.uploadedFiles);
  }

  onFileRemove(event: any) {
    this.uploadedFiles = this.uploadedFiles.filter(file => file.name !== event.file.name);
    console.log('Remaining Files:', this.uploadedFiles);
  }

  submitPost() {
    console.log(this.postForm.value);
    let content = this.turndownService.turndown(this.postForm.value.body);

    if (this.postForm.valid) {
      this.postService.createPost(this.postForm.value.title, this.postForm.value.subject.id, content, this.uploadedFiles)
        .subscribe({next: () => {
          this.router.navigate(['/']);
        }
      });
    }
  }
}
