import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface Options {
    withFormData: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CommonService {
    constructor(private router: Router) {

    }

    goToPage(value: any) {
        this.router.navigate([value])
            .then(() => {
                window.location.reload();
            });
    }

}