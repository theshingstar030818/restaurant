import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';

import {CloudService} from '../../providers/cloud-service';
import {ConfigService} from '../../providers/config-service';
import {CartService} from '../../providers/cart-service';

/*
  Generated class for the Item page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-item',
  templateUrl: 'item.html'
})
export class ItemPage {

	public item: any;
  public cart: any;

  public optionsModels: any;
  public extrasModels: any;
  public sizesModels: any;
  public showOptions: boolean;
  public showExtras: boolean;
  public showSizes: boolean;

  constructor(
  	private navParams: NavParams,
    public nav: NavController, 
    public alertController: AlertController, 
    public cartService: CartService,
    public configService: ConfigService,
    public loadingCtrl: LoadingController
  ) {
  	
  	// get sample data for item
    let item = navParams.get('item');
    console.log("showing item page for item: " + item);

    // this.item = itemService.getItem(id);

    this.optionsModels = {};
    this.extrasModels = {};
    this.sizesModels = {};
    
    this.showOptions = !(this.item.get('options').length == 0);
    this.showExtras = !(this.item.get('extras').length == 0);
    this.showSizes = !(this.item.get('sizes').length == 0);

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ItemPage');
  }

}
