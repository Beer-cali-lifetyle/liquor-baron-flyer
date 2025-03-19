import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs/internal/Subject';
import { AbstractControl } from '@angular/forms';

@Component({
    template: ''
})
export abstract class AppBase {
    isEditMode=false;
    currentPage = 1;
    pageSize = 1;
    searchTerm = '';
    dataSource: any;
    pageSizeOptions: number[] = [10, 25, 50, 100];
    public params: Subject<any> = new Subject<any>();
    public isEdit: boolean = false;
    public id: any;

    public form!: FormGroup;
    public menuForm!: FormGroup;

    public tableSearch: string = '';

    public tableNoContent: string | undefined = 'https://s3.ca-central-1.amazonaws.com/ml.public.documents/assets/images/Nodata.png';


    // Report common variables
    // start
    public today:any = new Date();
    public firstDayOfMonth = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    public currentDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());

    public formattedFirstDayOfMonth = `${this.firstDayOfMonth.getFullYear()}-${String(this.firstDayOfMonth.getMonth() + 1).padStart(2, '0')}-${String(this.firstDayOfMonth.getDate()).padStart(2, '0')}`;
    public formattedSecondDayOfMonth = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}-${String(this.currentDate.getDate()).padStart(2, '0')}`;
    // end

    constructor() {
        this.params.subscribe((value: { id: string }) => {
            this.id = value.id || undefined;
            console.log('edv', this.id);
            this.isEdit = !!this.id; 
        });
        
    }
    public checkMode(params: any) {
        this.params.next(params);
    };

    get f() { return this.form.controls; }

    public async validateForm(instance: FormArray | FormGroup = this.form) {
        console.log(`Form Validation Error\n`);
        this.markControlsAsTouched(instance);
    }
    
    private markControlsAsTouched(instance: FormGroup | FormArray) {
        Object.keys(instance.controls).forEach((key: string) => {
            const control = (instance.controls as { [key: string]: AbstractControl<any, any> })[key];
            
            if (control.status === 'INVALID' && window.location.href.includes('localhost')) {
                console.log(`Validation Error in field: ${key}`, control.errors); // Log field name and errors
            }
    
            if (control instanceof FormControl) {
                control.markAsTouched();
                control.markAsDirty();
                control.updateValueAndValidity();
    
                // Log error details if any
                if (control.errors) {
                    console.log(`Field: ${key} is invalid. Errors: `, control.errors);
                    this.scrollToError(key);
                }
            } else if (control instanceof FormGroup || control instanceof FormArray) {
                this.markControlsAsTouched(control); // Recursive call for nested form groups/arrays
    
                // Check if the current group or array has errors
                if (control.errors) {
                    console.log(`Field: ${key} has validation errors: `, control.errors);
                    this.scrollToError(key);
                }
            }
        });
    }
    

    scrollToError(field: string): void {
        const element = document.querySelector(`[formControlName="${field}"]`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: "center" });
        }
    }

    public async onChangePageSize(event: any) {
        this.pageSize = parseInt(event.target.value);
    }

    filterSearch(): void {
        this.dataSource.filter = this.tableSearch.trim().toLowerCase();
    }

}
