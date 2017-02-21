import { Component } from '@angular/core';
import { NavController, NavParams, MenuController, LoadingController, Events } from 'ionic-angular';

import {ConfigService} from '../../providers/config-service';
import { CloudService } from '../../providers/cloud-service';

import {LoginPage} from "../login/login";

/*
  Generated class for the Register page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-register',
  templateUrl: 'register.html'
})
export class RegisterPage {

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

  register() {
    this.cloudService.logout();
    var me = this;
    me.presentLoading();
    if(this.user.username && this.user.password && this.user.repassword){
      if(this.user.password == this.user.repassword){
        //signup user
        me.cloudService.register(this.user.username,this.user.repassword).then((response) => {
	        return response;
	      }).then((page) => {
	        this.navCtrl.setRoot(page);
	      	me.dismissLoading();
	      }).catch((error) => {
	        me.events.publish("event:toast", { message: error.message, position: "bottom", time:5000});
	      	me.dismissLoading();
	      });
      }else{
      	me.events.publish("event:toast", { message: "Passwords you enter do not match", position: "bottom", time:5000});
      }
    }else{
      me.events.publish("event:toast", { message: "Please enter all fields", position: "bottom", time:5000});
    }
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad RegisterPage');
  }

  login() {
    this.navCtrl.setRoot(LoginPage);
  }

}
