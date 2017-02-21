import { Component } from '@angular/core';
import { NavController, NavParams, MenuController, LoadingController, Events } from 'ionic-angular';

import {ConfigService} from '../../providers/config-service';
import {CloudService} from '../../providers/cloud-service';

import {RegisterPage} from "../register/register";

/*
  Generated class for the Login page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {

	public config: any;
  	public user: any = {};
  	public loader: any;

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	public configService: ConfigService,
  	public cloudService: CloudService,
  	public menu: MenuController,
  	public loadingCtrl: LoadingController,
  	public events: Events,
  ) {
  	if(cloudService.getUser()){
      this.navCtrl.setRoot(cloudService.getRootPage());
    }

  }

  ionViewWillLeave() {
    this.menu.enable(true);
  }

  ionViewWillEnter() {
    this.menu.enable(false);
  }

  ionViewDidLoad() {
    // console.log('ionViewDidLoad LoginPage');
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Please wait..."
    });
    this.loader = loader;
    loader.present();
  }

  dismissLoading(){
    if(this.loader){
      this.loader.dismiss().then((response) => {
        return response;
      }).then((response) => {
        console.info(response)
      }).catch((error) => {
        console.error(error);
      });
    }
  }

  login() {
    var me = this;
    me.presentLoading();
    //this.presentLoading(); // dismiss not working for some reason ! :@
    if(this.user.username && this.user.password){
      me.cloudService.login(this.user.username,this.user.password).then((response) => {
        return response;
      }).then((page) => {
        this.navCtrl.setRoot(page);
      	me.dismissLoading();
      }).catch((ex) => {
        me.events.publish("event:toast", { message: "Invalid credentials", position: "bottom", time:5000});
      	me.dismissLoading();
      });
    }else{
   	  me.events.publish("event:toast", { message: "Credentials missing", position: "bottom", time:5000});
      me.dismissLoading();
    }
  }

  // go to register page
  register() {
    this.navCtrl.setRoot(RegisterPage);
  }

}
