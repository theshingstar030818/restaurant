import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {CategoryService} from '../../services/category-service';
import {CategoryPage} from "../category/category";

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-categories',
  templateUrl: 'categories.html'
})
export class CategoriesPage {
  // list of categories
  public categories: any;

  constructor(public nav: NavController, public categoryService: CategoryService) {
    // set sample data
    this.categories = categoryService.getAll();
  }

  // view a category
  viewCategory(categoryId) {
    this.nav.push(CategoryPage, {id: categoryId});
  }
}
