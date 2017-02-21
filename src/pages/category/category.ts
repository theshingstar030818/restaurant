import { Component } from '@angular/core';
import { NavController, NavParams, Events, ModalController } from 'ionic-angular';

import {CloudService} from '../../providers/cloud-service';
import {ConfigService} from '../../providers/config-service';

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

}
