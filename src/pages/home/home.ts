import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import {ConfigService} from '../../providers/config-service';
import {MenuService} from '../../providers/menu-service';

/*
  Generated class for the Home page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	public configService: ConfigService,
  	public menuService: MenuService,
  ) {
  	
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad HomePage');
  }

}
