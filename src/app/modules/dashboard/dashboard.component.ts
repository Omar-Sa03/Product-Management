import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PerfumeService } from '../../core/services/perfume.service';
import { Perfume } from '../../core/models/perfume.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  perfumes: Perfume[] = [];
  perfumeForm: FormGroup;
  isEditing = false;
  editingId: number | null = null;
  showForm = false;

  constructor(
    private perfumeService: PerfumeService,
    private fb: FormBuilder
  ) {
    this.perfumeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      brand: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      size: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      image: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  ngOnInit(): void {
    this.loadPerfumes();
  }

  loadPerfumes(): void {
    this.perfumeService.getAllPerfumes().subscribe(
      perfumes => this.perfumes = perfumes
    );
  }

  get Perfumes(): Perfume[] {
    return this.perfumes;
  }

  // Statistics methods for the dashboard header
  getTotalStock(): number {
    return this.perfumes.reduce((total, perfume) => total + perfume.stock, 0);
  }

  getTotalValue(): number {
    return this.perfumes.reduce((total, perfume) => total + (perfume.price * perfume.stock), 0);
  }

  // Form methods (kept for editing functionality)
  closeForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingId = null;
    this.perfumeForm.reset();
  }

  onSubmit(): void {
    if (this.perfumeForm.valid) {
      const perfumeData = this.perfumeForm.value;
      
      if (this.isEditing && this.editingId) {
        this.perfumeService.updatePerfume(this.editingId, { ...perfumeData, id: this.editingId })
          .subscribe(() => {
            this.loadPerfumes();
            this.closeForm();
          });
      } else {
        this.perfumeService.createPerfume(perfumeData)
          .subscribe(() => {
            this.loadPerfumes();
            this.closeForm();
          });
      }
    }
  }

  editPerfume(perfume: Perfume): void {
    this.isEditing = true;
    this.editingId = perfume.id;
    this.showForm = true;
    this.perfumeForm.patchValue(perfume);
  }

  deletePerfume(id: number): void {
    if (confirm('Are you sure you want to delete this perfume?')) {
      this.perfumeService.deletePerfume(id).subscribe(() => {
        this.loadPerfumes();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.perfumeForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['min']) return `${fieldName} must be greater than 0`;
      if (field.errors['pattern']) return `${fieldName} must be a valid URL`;
    }
    return '';
  }
}