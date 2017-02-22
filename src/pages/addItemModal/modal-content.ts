import {Component} from '@angular/core';
import { Platform, NavParams, ViewController, AlertController, LoadingController, Events } from 'ionic-angular';

import {ImageService} from '../../providers/image-service';
import {CloudService} from '../../providers/cloud-service';
import {ConfigService} from '../../providers/config-service';

@Component({
  templateUrl: 'modal-content.html'
})

export class AddItemModal {
  
  public data: any = {};
  public files: any = [];
  public optionsModels: any = {};
  public extrasModels: any = {};
  public sizesModels: any = {};
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
    public configService: ConfigService,
  ) {
    this.data.edit = params.get('edit');
    this.data.item = params.get('item');
    this.data.category = params.get('category');
    this.data.editItem = {};
    if(this.data.edit){
      this.data.editItem = cloudService.getEditAbleObject(this.data.item);
      this.data.item = cloudService.menu.allMenuItems[this.data.item.id];
      this.files = this.data.item.images.array;
      for(var i=0; i<this.data.item.object.get("options").length; i++){
        this.optionsModels[this.data.item.object.get("options")[i].name] = this.data.item.object.get("options")[i].value;
      }
      for(var i=0; i<this.data.item.object.get("extras").length; i++){
        this.extrasModels[this.data.item.object.get("extras")[i].name] = this.data.item.object.get("extras")[i].value;
      }
      for(var i=0; i<this.data.item.object.get("sizes").length; i++){
        this.sizesModels[this.data.item.object.get("sizes")[i].name] = this.data.item.object.get("sizes")[i].value;
      }
    }
  }

  fileChangeEvent(fileInput: any){
    let me = this;
    me.imageService.getMultipleParseFilesBase64(fileInput).then((files) => {
      me.files = me.files.concat(files);
    });
  }

  clickSelect(){
    document.getElementById("files").click();
  }

  removeImage(index){
    if(this.files.length>1){
      this.files.splice(index, 1);
    }else{
      this.events.publish("event:toast", { message: "Min (1) file required.", position: "bottom", time:5000});
    }
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

  createItem(){
    var me = this;
    
    if(this.data.editItem.name && 
      this.data.editItem.price && 
      this.data.category &&
      this.files.length>0)
    {
      me.presentLoading();
      this.cloudService.addItem(this).then(()=>{
        me.dismissLoading();
        me.dismiss();
        me.showAlert();
      }).catch((error)=>{
        me.dismissLoading();
        me.dismiss();
        me.events.publish("event:toast", { message: error.message, position: "bottom", time:5000});
      });
    }else{
      me.events.publish("event:toast", { message: "Missing mandatory fields", position: "bottom", time:5000});
    }
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

  showAlert() {
    let alert = this.alertCtrl.create({
      title: 'Saved',
      subTitle: 'Your new item has been added.',
      buttons: ['OK']
    });
    alert.present();
  }

  addNewSize(){
    var me= this;
    
    var me=this;
    let prompt = this.alertCtrl.create({
      title: 'Add New Size',
      message: "",
      inputs: [
        {
          name: 'size',
          value: '',
          type: "text",
          placeholder: 'Size',
          label: 'Size'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            if(data.size){
                this.cloudService.addNewSize(data.size).then((response) => {
                  return response;
                }).then((size) => {
                  
                  //console.log(extra);
                  return true;
                }).catch((ex) => {
                  console.error('Error : ', ex);
                });
              // }
            }else{
              return false;
            }            
          }
        }
      ]
    });
    prompt.present();
  }

  addNewExtra(){
    var me= this;
    
    var me=this;
    let prompt = this.alertCtrl.create({
      title: 'Add New Extra',
      message: "",
      inputs: [
        {
          name: 'extra',
          value: '',
          type: "text",
          placeholder: 'Extra',
          label: 'Extra'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            if(data.extra){
                this.cloudService.addNewExtra(data.extra).then((response) => {
                  return response;
                }).then((extra) => {
                  
                  return true;
                }).catch((ex) => {
                  console.error('Error : ', ex);
                });
            }else{
              return false;
            }            
          }
        }
      ]
    });
    prompt.present();
  }

  addNewOption(){
    var me= this;
    
    var me=this;
    let prompt = this.alertCtrl.create({
      title: 'Add New Option',
      message: "",
      inputs: [
        {
          name: 'option',
          value: '',
          type: "text",
          placeholder: 'Option',
          label: 'Option'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            if(data.option){
                this.cloudService.addNewOption(data.option).then((response) => {
                  return response;
                }).then((option) => {
                  
                  //console.log(option);
                  return true;
                }).catch((ex) => {
                  console.error('Error : ', ex);
                });
              // }
            }else{
              return false;
            }            
          }
        }
      ]
    });
    prompt.present();    
  }
}