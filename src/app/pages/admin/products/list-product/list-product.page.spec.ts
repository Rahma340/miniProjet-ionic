import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListProductPage } from './list-product.page';

describe('ListProductPage', () => {
  let component: ListProductPage;
  let fixture: ComponentFixture<ListProductPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ListProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
