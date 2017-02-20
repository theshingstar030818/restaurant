import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import { NavParams } from 'ionic-angular';

import {CategoryService} from '../../services/category-service';
import {UserService} from '../../services/user-service';

import {ItemPage} from "../item/item";

import {AddItemModal} from '../addItemModal/modal-content';

import { ModalController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-category',
  templateUrl: 'category.html'
})
export class CategoryPage {
  // category object
  public category: any;
  public user: any;

  public edit: boolean;
  public currItemIndex: any;

  constructor(
    private navParams: NavParams, 
    public nav: NavController, 
    public categoryService: CategoryService,
    public modalCtrl: ModalController,
    public userService: UserService
  ) {
    // get first category as sample data
    let id = navParams.get('id');
    console.log("showing category page for id : " + id);
    this.category = categoryService.getItem(id);
    this.user = this.userService.getUser();
  }

  // view item detail
  viewItem(id) {
    this.nav.push(ItemPage, {id: id})
  }

  openModal(category) {
    this.edit = false;
    let modal = this.modalCtrl.create(AddItemModal, this);
    modal.present();
  }

  editItem(itemIndex){
    this.edit = true;
    this.currItemIndex = itemIndex;
    let modal = this.modalCtrl.create(AddItemModal, this);
    modal.present();
  }
}
