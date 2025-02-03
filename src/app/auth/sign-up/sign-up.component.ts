import { Component, OnInit } from '@angular/core';
import { SharedModule } from '../../shared/shared/shared.module';
import { CommonModule } from '@angular/common';
import { AppBase } from '../../../app-base.component';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { Router } from '@angular/router';
import { ContextService } from '../../core/services/context.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  standalone: true,
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SignUpComponent extends AppBase implements OnInit {
  passwordFieldType: string = 'password';
  constructor(private fb: FormBuilder, private ApiService: ApiService, private router: Router, private context: ContextService) { super(); }

  ngOnInit() {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required]
    }, { validator: this.mustMatch('password', 'password_confirmation') });
  }

 async onSignup() {
  console.log(this.form.value)
    if (this.form.valid) {
      try {
        const payload ={
            name: this.form.value.firstName + ' ' + this.form.value.lastName ,
            first_name: this.form.value.firstName,
            last_name: this.form.value.lastName,
            email :this.form.value.email,
            password: this.form.value.password,
            password_confirmation: this.form.value.password_confirmation
        }
        const res = await this.ApiService.SignUp(payload);
        
        this.context.user.set(res?.user);
          localStorage.setItem('access_token', res?.token);
          localStorage.setItem('user_id', res?.user?.id);
          localStorage.setItem('user', JSON.stringify(res?.user));
        this.router.navigate(['/home'])
      } catch (error) {
        console.error('Sign-in error:', error);
      }
    } else {
      this.validateForm();
    }
  }

  mustMatch(password: string, password_confirmation: string) {
    return (formGroup: FormGroup) => {
      const passControl = formGroup.controls[password];
      const confirmPassControl = formGroup.controls[password_confirmation];
  
      if (confirmPassControl.errors && !confirmPassControl.errors['mustMatch']) {
        return;
      }
  
      if (passControl.value !== confirmPassControl.value) {
        confirmPassControl.setErrors({ mustMatch: true });
      } else {
        confirmPassControl.setErrors(null);
      }
    };
  }
  

  togglePasswordVisibility() {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

}
