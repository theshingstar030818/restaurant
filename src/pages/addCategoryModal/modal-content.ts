import {Component} from '@angular/core';
import { Platform, NavParams, ViewController, AlertController, LoadingController, Events } from 'ionic-angular';

import {ImageService} from '../../providers/image-service';
import {CloudService} from '../../providers/cloud-service';

@Component({
  templateUrl: 'modal-content.html'
})

export class AddCategoryModal {
  
  public name: any;
  public files: any = [];
  public fileDetailObject: any;
  public loader: any;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public imageService: ImageService,
    public cloudService: CloudService,
    public events: Events,
  ) {}

  fileChangeEvent(fileInput: any){
    let me = this;
    me.imageService.getMultipleParseFilesBase64(fileInput).then((files) => {
      console.log(files);
      me.files = files;
    });
  }

  createCategory(){
    let me = this;
    if(me.name && me.files.length>0){
      me.presentLoading();
      me.cloudService.addMenuCategory(me.name,me.files).then((response) => {
        me.events.publish("event:toast", { message: "Saved!", position: "bottom", time:5000});
        me.dismissLoading();
        me.dismiss();
      }).catch((error)=>{
        me.dismissLoading();
        me.events.publish("event:toast", { message: error.message, position: "bottom", time:5000});
      });
    }else{
      me.events.publish("event:toast", { message: "Name or file not added", position: "bottom", time:5000});
    }
  }

  clickSelect(){
    document.getElementById("files").click();
  }

  removeImage(index){
    this.files.splice(index, 1);
  }

  presentLoading() {
  this.loader = this.loadingCtrl.create({
      content: "Please wait...",
      dismissOnPageChange: true
    });
    this.loader.present();
  }

  dismiss() {
    this.viewCtrl.dismiss();
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
}