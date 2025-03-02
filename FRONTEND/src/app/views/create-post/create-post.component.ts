import { Component } from '@angular/core';
import { PostFormComponent } from "../../components/post-form/post-form.component";
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-create-post',
  imports: [PostFormComponent],
  templateUrl: './create-post.component.html',
  styleUrl: './create-post.component.scss',
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
              stagger('10ms', [
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
export class CreatePostComponent {

}
