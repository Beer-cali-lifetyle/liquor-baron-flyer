import { Component, OnInit } from '@angular/core';
import { UiLoaderService } from "../../../core/services/loader.service";
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css'],
  standalone: true,
  imports: [
    CommonModule
  ]
})
export class LoaderComponent implements OnInit {

  loading: boolean = false;
  loadingSubcription: Subscription = new Subscription;

  constructor(private loaderService: UiLoaderService) { }
  ngOnInit(): void {
    this.loadingSubcription = this.loaderService.onLoad().subscribe((status: any) => {

      this.loading = status;
    });

  }

}
