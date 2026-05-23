import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoriesPage } from './inventories.page';

describe('InventoriesPage', () => {
  let component: InventoriesPage;
  let fixture: ComponentFixture<InventoriesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoriesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
