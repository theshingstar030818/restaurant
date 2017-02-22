import { Component } from '@angular/core';
import { NavController, NavParams, Events, LoadingController } from 'ionic-angular';

import { CloudService } from '../../providers/cloud-service';
import { ImageService } from '../../providers/image-service';

/*
  Generated class for the User page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-user',
  templateUrl: 'user.html'
})
export class UserPage {

	private user: any;
	public loader: any;

  constructor(
  	public navCtrl: NavController, 
  	public navParams: NavParams,
  	public cloudService: CloudService,
  	public events: Events,
  	public loadingCtrl: LoadingController,
  	public imageService: ImageService
  ) {
  	this.user = cloudService.getEditAbleUser();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserPage');
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

  clickUploadButton(){
  	document.getElementById("uploadButton").click();
  }

  uploadProfilePic(fileInput: any){
    if(fileInput.target.files.length==1){
      let me = this;
      me.presentLoading();
      me.imageService.getParseFileBase64(fileInput).then((parseFileBase64) => {
        me.dismissLoading();
        me.saveProfile(parseFileBase64);
      }).catch((error) => {
        me.dismissLoading();
        me.events.publish("event:toast", { message: "Error uploading file", position: "bottom", time:2000});
      });
    }else{
      console.error("upload profile pic error");
    }
  }

  saveProfile(image){
  	let me = this;
  	me.presentLoading();
  	this.cloudService.updateUserProfile(this.user,image).then((response) => {
	    return response;
	  }).then((user) => {
	    me.user = user;
	  	me.dismissLoading();
	  	me.events.publish("event:toast", { message: "Saved!", position: "bottom", time:5000})
	  }).catch((error) => {
	    me.events.publish("event:toast", { message: error.message, position: "bottom", time:5000});
	  	me.dismissLoading();
	  });
  }

}
