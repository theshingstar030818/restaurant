import {Component} from '@angular/core';

import { Platform, NavParams, ViewController } from 'ionic-angular';

import { AlertController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

import {ItemService} from '../../services/item-service';
import {ConfigService} from '../../services/config-service';

import Parse from 'parse';

@Component({
  templateUrl: 'modal-content.html'
})

export class AddItemModal {
  
  public name: any;
  public price: any;
  public description: any;

  public thumbFile: any;
  public thumbFileDetailObject: any;

  public imagesFile: any;
  public imagesFileDetailObject: any;

  public optionsModels: any;
  public extrasModels: any;
  public sizesModels: any;

  public category: any;
  
  public edit: boolean;
  public itemToEdit: any;
  public title: any;

  public outOfStock: any;
  public isDeleted: any;

  constructor(
    public platform: Platform,
    public params: NavParams,
    public viewCtrl: ViewController,
    public itemService: ItemService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public configService: ConfigService
  ) {

    this.title ="Add Item";
    //initialize dynamic 
    this.optionsModels = {};
    this.extrasModels = {};
    this.sizesModels = {};

    this.imagesFile = [];
    this.imagesFileDetailObject =  [];

    this.category = this.params.get('category');
    this.edit = this.params.get('edit');
    this.itemToEdit = this.params.data.category.items[this.params.get('currItemIndex')];
    this.outOfStock = false;
    this.isDeleted = false;
    if(this.edit){
      this.title ="Edit Item";
      this.name = this.itemToEdit.get("name");
      this.price = this.itemToEdit.get("price");
      this.description = this.itemToEdit.get("description");
      this.outOfStock = this.itemToEdit.get("outOfStock");
      this.isDeleted = this.itemToEdit.get("isDeleted");
      for(var i=0; i<this.itemToEdit.get("options").length; i++){
        this.optionsModels[this.itemToEdit.get("options")[i].name] = this.itemToEdit.get("options")[i].value;
      }
      for(var i=0; i<this.itemToEdit.get("extras").length; i++){
        this.extrasModels[this.itemToEdit.get("extras")[i].name] = this.itemToEdit.get("extras")[i].value;
      }
      for(var i=0; i<this.itemToEdit.get("sizes").length; i++){
        this.sizesModels[this.itemToEdit.get("sizes")[i].name] = this.itemToEdit.get("sizes")[i].value;
      }
    }
    console.log("Add/Edit Item modal");
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
                this.itemService.addNewSize(data.size).then((response) => {
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
                this.itemService.addNewExtra(data.extra).then((response) => {
                  return response;
                }).then((extra) => {
                  
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
                this.itemService.addNewOption(data.option).then((response) => {
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

  imagesFileChangeEvent(fileInput: any){
    var me = this;
    if(fileInput.target.files){
      var reader = {};
      var i;
      for(i=0; i<fileInput.target.files.length; i++){
        reader[i] =  new FileReader()
        reader[i].onload = function (e : any) {
          //var _imageObjectExt = /[^/]*$/.exec(e.target.result.match(/[^;]*/)[0])[0];
          var parseFile = new Parse.File( fileInput.target.files[i].name, { base64: e.target.result });
          console.log("parse File => " + parseFile + " fileDetailObject => " + fileInput.target.files[i]);
          me.imagesFile.push(parseFile);
          me.imagesFileDetailObject.push(fileInput.target.files[i]);
          i++;
        }
        reader[i].readAsDataURL(fileInput.target.files[i]);
      }
      i = 0;
    }
  }

  thumbFileChangeEvent(fileInput: any){
    var me = this;

    if (fileInput.target.files && fileInput.target.files[0]) {
      var reader = new FileReader();
      
      reader.onload = function (e : any) {
          //var _imageObjectExt = /[^/]*$/.exec(e.target.result.match(/[^;]*/)[0])[0];
          var parseFile = new Parse.File( fileInput.target.files[0].name, { base64: e.target.result });
          
          me.thumbFile = parseFile;
          me.thumbFileDetailObject = fileInput.target.files[0];

      }
      reader.readAsDataURL(fileInput.target.files[0]);
    }
  }

  createItem(){
    var me = this;
    if(this.name && this.price && this.category){
      if(this.edit){
        this.presentLoading();
        this.itemService.addItem(this).then((response) => {
          return response;
        }).then((itemObject) => {
          //reset modal and dismiss
          this.showAlert();
          me.dismiss();
        }).catch((ex) => {
          console.error('Error : ', ex);
        });
      }else {
        if(this.thumbFile && (this.imagesFile.length + 1) >= this.configService.minItemImages){
          this.presentLoading();
          this.itemService.addItem(this).then((response) => {
            return response;
          }).then((itemObject) => {
            //reset modal and dismiss
            this.showAlert();
            me.dismiss();
          }).catch((ex) => {
            console.error('Error : ', ex);
          });
        }else{
          console.warn("Name or file not added");
        }
      }
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
      subTitle: 'Your new item has been added.',
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