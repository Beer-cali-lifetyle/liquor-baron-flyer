import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { AppBase } from '../../../app-base.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UiToasterService } from '../../core/services/toaster.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ContactComponent extends AppBase implements OnInit {

  constructor(
    private ApiService: ApiService,
    private toaster: UiToasterService,
    private fb: FormBuilder
  ) {
    super();
  }

  async ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]],
      phNo: ['']
    })
  }

  async onSubmit() {
    if (this.form.valid) {
      await this.ApiService.contactUs(this.form.value).then(res => {
        this.toaster.Success('Contact query sent successfully');
        this.form.reset();
      })
    } else { this.validateForm(); }
  }

}
