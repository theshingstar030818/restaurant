import {Component} from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

import {AlertController} from 'ionic-angular';
import {LoadingController} from 'ionic-angular';
import {CloudService} from '../../providers/cloud-service';
import {Events} from 'ionic-angular';

import Parse from 'parse';

@Component({
  templateUrl: 'modal-content.html'
})

export class AddAddressModal {
  
  public unitNumber: any;
  public buildingNumber: any;
  public streetName: any;
  public city: any;
  public state: any;
  public postalCode: any;
  public country: any;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    public cloudService: CloudService,
    public alertCtrl: AlertController,
    public events: Events,
    public loadingCtrl: LoadingController,
  ) {

  }

  createCategory(){
    var me = this;
    var data = {
      unitNumber: this.unitNumber,
      buildingNumber: this.buildingNumber,
      streetName: this.streetName,
      city: this.city,
      state: this.state,
      country: this.country,
      postalCode: this.postalCode,
    };
    
    if(data.unitNumber == undefined){
      data.unitNumber = "";
    }
    if(data.buildingNumber == undefined){
      data.buildingNumber = "";
    }
    if(data.streetName == undefined){
      data.streetName = "";
    }
    if(data.city == undefined){
      data.city = "";
    }
    if(data.state == undefined){
      data.state = "";
    }
    if(data.country == undefined){
      data.country = "";
    }
    if(data.postalCode == undefined){
      data.postalCode = "";
    }

    me.cloudService.addAddress(data).then((response) => {
      return response;
    }).then((itemObject) => {
      console.log("address added");
      me.events.publish('user:update', null);
      //dismiss controller
      me.dismiss();
    }).catch((ex) => {
      console.error('Error : ', ex);
    });
  }

  onChange(event) {
    var files = event.srcElement.files;
    console.log(files);
  }

  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'Success',
      subTitle: 'Your new menu category has been added.',
      buttons: ['OK']
    });
    alert.present();
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Please wait...",
      dismissOnPageChange: true
    });
    loader.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}