import {Component} from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import {MenuService} from '../../services/menu-service';

import Parse from 'parse';

@Component({
  templateUrl: 'modal-content.html'
})

export class AddCategoryModal {
  
  public name: any;
  public file: any;
  public fileDetailObject: any;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    public menuService: MenuService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController
  ) {

  }

  fileChangeEvent(fileInput: any){
    var me = this;

    if (fileInput.target.files && fileInput.target.files[0]) {
      var reader = new FileReader();
      
      reader.onload = function (e : any) {
          //var _imageObjectExt = /[^/]*$/.exec(e.target.result.match(/[^;]*/)[0])[0];
          var parseFile = new Parse.File( fileInput.target.files[0].name, { base64: e.target.result });
          
          me.file = parseFile;
          me.fileDetailObject = fileInput.target.files[0];

      }
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  createCategory(){
    var me = this;
    if(this.name && this.file && this.fileDetailObject){
      this.presentLoading();
      this.menuService.addItem(this.name, this.file,this.fileDetailObject).then((response) => {
        return response;
      }).then((menuObject) => {
        //reset modal and dismiss
        me.name = "";
        this.showAlert();
        me.dismiss();
      }).catch((ex) => {
        console.error('Error : ', ex);
      });
    }else{
      console.warn("Name or file not added");
    }
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