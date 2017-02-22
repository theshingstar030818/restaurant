import { Component } from '@angular/core';
import { NavController, NavParams, Events, ModalController } from 'ionic-angular';

import {CloudService} from '../../providers/cloud-service';
import {ConfigService} from '../../providers/config-service';
import {ItemPage} from '../item/item';
import {AddItemModal} from '../addItemModal/modal-content';

/*
  Generated class for the Category page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-category',
  templateUrl: 'category.html'
})
export class CategoryPage {

	public category: any;

  //page event handlers
  private fetchMenuEvent: (menu) => void;

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	public configService: ConfigService,
  	public events: Events,
  	public cloudService: CloudService,
  	public modalCtrl: ModalController,
  ) {
  	this.category = cloudService.menu.map[navParams.get('category').id];
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CategoryPage');
  }

  ionViewWillEnter(){
    this.initializeEventHandlers();
    this.subscribeEvents();
  }

  ionViewWillLeave() {
    this.unsubscribeEventHandlers();
  }

  // view item detail
  viewItem(item, index) {
    this.navCtrl.push(ItemPage, {item: item})
  }

  initializeEventHandlers(){
    this.initializeFetchMenuEvent();
  }

  initializeFetchMenuEvent(){
    let me = this;
    this.fetchMenuEvent = (menu) => {
      this.category = this.cloudService.menu.map[this.category["object"].id];
    };
  }

  subscribeEvents(){   
    this.events.subscribe('fetchMenu:event', this.fetchMenuEvent);
  }

  unsubscribeEventHandlers(){
    this.unsubscribeFetchMenuEvent();
  }

  unsubscribeFetchMenuEvent(){
    if(this.fetchMenuEvent){
      this.events.unsubscribe('fetchMenu:event', this.fetchMenuEvent);
      this.fetchMenuEvent = undefined;
    }
  }

  openModal(category) {
    let modal = this.modalCtrl.create(AddItemModal, {edit:false, item: null, category: this.category});
    modal.present();
  }

  editItem(item, index){
    this.cloudService.getCategoryImages(item).then((images)=>{
      item["images"] = images;
      let modal = this.modalCtrl.create(AddItemModal, {edit:true, item: item, category: this.category});
      modal.present();
    });
  }
  

}
