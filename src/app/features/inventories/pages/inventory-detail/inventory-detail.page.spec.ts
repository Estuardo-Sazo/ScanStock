import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryDetailPage } from './inventory-detail.page';

describe('InventoryDetailPage', () => {
  let component: InventoryDetailPage;
  let fixture: ComponentFixture<InventoryDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(InventoryDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
