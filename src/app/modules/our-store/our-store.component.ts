import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ApiService } from '../../shared/services/api.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-our-store',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './our-store.component.html',
  styleUrl: './our-store.component.scss'
})
export class OurStoreComponent implements OnInit {
  constructor(private fb: FormBuilder,
    private ApiService: ApiService,
  ) {

  }
  stores: any = [];

  async ngOnInit() {
    await this.fetchStores();
  }

  async fetchStores() {
    await this.ApiService.fetchStores().then((res) => {
      this.stores = res
    })
  }
}
