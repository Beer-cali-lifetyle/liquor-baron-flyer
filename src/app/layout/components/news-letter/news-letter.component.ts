import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AppBase } from '../../../../app-base.component';
import { ApiService } from '../../../shared/services/api.service';
import { UiToasterService } from '../../../core/services/toaster.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-news-letter',
  templateUrl: './news-letter.component.html',
  styleUrls: ['./news-letter.component.css'],
  standalone: true, imports: [
    ReactiveFormsModule, CommonModule
  ]
})
export class NewsLetterComponent extends AppBase implements OnInit {

  constructor(
    private fb: FormBuilder,
    private toaster: UiToasterService
  ) { super(); }

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    })
  }

  async onSubmit() {
    if (this.form.valid) {
      this.toaster.Success('You have been sucessfully subscribed to newsletter.')
      this.form.patchValue({
        email: ''
      })
    } else {
      this.validateForm()
    }
  }

}
