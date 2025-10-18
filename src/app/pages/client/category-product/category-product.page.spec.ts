import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoryProductPage } from './category-product.page';

describe('CategoryProductPage', () => {
  let component: CategoryProductPage;
  let fixture: ComponentFixture<CategoryProductPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CategoryProductPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
