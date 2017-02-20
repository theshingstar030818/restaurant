import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {MenuService} from '../../services/menu-service';
import {ConfigService} from '../../services/config-service';
import {CategoryService} from '../../services/category-service';
import {UserService} from '../../services/user-service';

import {CategoryPage} from "../category/category";
import {AddCategoryModal} from '../addCategoryModal/modal-content';

import { ModalController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  // slides for slider
  public slides = [
    "assets/img/categories/fruit.jpg",
    "assets/img/categories/pizza.jpg",
    "assets/img/categories/sushi.jpg"
  ];

  // list of categories
  public categories: any;
  public user: any;

  public myInput: any;


  constructor(
    public modalCtrl: ModalController, 
    public nav: NavController, 
    public menuService: MenuService,
    public loadingCtrl: LoadingController,
    public configService: ConfigService,
    public categoryService: CategoryService,
    public userService: UserService
    ) {
    // set data for categories
    console.log("set data for categories");
    menuService.fetchMenu();
    this.categories = menuService.menu;
    this.presentLoading();
    this.myInput = "";
  }

  onInput(event){
    console.log(event.target.value.length);
  }

  onCancel(event){
    console.log(event.target.value.length);
  }

  // view a category
  viewCategory(categoryId) {
    console.log("category select id : " + categoryId);
    this.nav.push(CategoryPage, {id: categoryId});
  }

  openModal() {
    let modal = this.modalCtrl.create(AddCategoryModal);
    modal.present();
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Please wait...",
      dismissOnPageChange: true
    });
    loader.present();
  }
}

