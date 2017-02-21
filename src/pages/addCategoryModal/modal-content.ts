import {Component} from '@angular/core';
import { Platform, NavParams, ViewController, AlertController, LoadingController, Events } from 'ionic-angular';

import {ImageService} from '../../providers/image-service';
import {MenuService} from '../../providers/menu-service';

@Component({
  templateUrl: 'modal-content.html'
})

export class AddCategoryModal {
  
  public name: any;
  public files: any = [];
  public fileDetailObject: any;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public imageService: ImageService,
    public menuService: MenuService,
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
      me.menuService.addMenuCategory(me.name,me.files).then((response) => {
        me.events.publish("event:toast", { message: "Saved!", position: "bottom", time:5000});
        me.dismiss();
      }).catch((error)=>{
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