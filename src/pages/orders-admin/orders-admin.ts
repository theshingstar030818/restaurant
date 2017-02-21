import { Component, Injectable, Inject, forwardRef } from '@angular/core';
import { NavController, NavParams, Events } from 'ionic-angular';

import {CloudService} from '../../providers/cloud-service';


/*
  Generated class for the OrdersAdmin page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-orders-admin',
  templateUrl: 'orders-admin.html'
})
export class OrdersAdminPage {

  cloudService: CloudService;

  constructor(@Inject(forwardRef(() => CloudService)) cloudService: CloudService,
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	public events: Events,
  ) {
    this.cloudService = cloudService;
  }

  ionViewDidLoad() {
  
  }

}
