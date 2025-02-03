import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ContextService } from '../../core/services/context.service';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class PaymentComponent implements OnInit {

  constructor(public contextService: ContextService) { }

  ngOnInit() {
  }

}
