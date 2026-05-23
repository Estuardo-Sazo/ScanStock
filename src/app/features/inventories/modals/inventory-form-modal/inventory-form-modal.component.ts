import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  IonButton,
  IonInput,
  IonLabel,
  IonItem,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonIcon,
  ModalController,
  IonTextarea, IonFooter } from '@ionic/angular/standalone';
import {
  close,
  createOutline,
  playOutline,
  informationCircleOutline,
} from 'ionicons/icons';
import { addIcons } from 'ionicons';
import { InventoryService } from '../../../../core/services/inventory.service';
import { Inventory } from '../../../../core/database/app-db';

@Component({
  selector: 'app-inventory-form-modal',
  templateUrl: './inventory-form-modal.component.html',
  styleUrls: ['./inventory-form-modal.component.scss'],
  standalone: true,
  imports: [IonFooter, 
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonContent,
    IonIcon,
  ],
})
export class InventoryFormModalComponent implements OnInit {
  form!: FormGroup;
  isEditing = false;
  inventory?: Inventory;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private inventoryService: InventoryService,
  ) {
    addIcons({
      close,
      createOutline,
      playOutline,
      informationCircleOutline,
    });
  }

  ngOnInit() {
    this.initForm();
  }

  private initForm() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
    });

    // Si estamos editando, llenar el formulario
    if (this.inventory) {
      this.isEditing = true;
      this.form.patchValue({
        name: this.inventory.name,
        description: this.inventory.description,
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    this.isLoading = true;

    const formValue = this.form.value;

    if (this.isEditing && this.inventory?.id) {
      // Actualizar
      this.inventoryService
        .update(this.inventory.id, {
          name: formValue.name,
          description: formValue.description,
        })
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.modalController.dismiss({
              success: true,
              message: 'Inventario actualizado',
            });
          },
          error: () => {
            this.isLoading = false;
          },
        });
    } else {
      // Crear nuevo
      this.inventoryService
        .create({
          name: formValue.name,
          description: formValue.description,
          createdAt: new Date(),
        })
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.modalController.dismiss({
              success: true,
              message: 'Inventario creado',
            });
          },
          error: () => {
            this.isLoading = false;
          },
        });
    }
  }

  closeModal() {
    this.modalController.dismiss();
  }

  get isFormValid(): boolean {
    return this.form.valid;
  }
}
