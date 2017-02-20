import {Component} from '@angular/core';
import {NavController, AlertController} from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import {ConfigService} from '../../services/config-service';
import {UserService} from '../../services/user-service';
import { ModalController } from 'ionic-angular';
import { LoadingController } from 'ionic-angular';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-order',
  templateUrl: 'order.html'
})
export class OrderPage {

  private order: any;
  private index: any;
  private loader: any;

  private showDeclineButton:any;
  private showApproveButton:any;
  private showDeliverButton: any;
  private showCompleteButton: any;
  private showCancelButton: any;
  private showCallDriver: any;

  private isDelivery: boolean;

  constructor(
    private navParams: NavParams,
    public modalCtrl: ModalController, 
    public alertController: AlertController,
    public nav: NavController, 
    public loadingCtrl: LoadingController,
    public configService: ConfigService,
    public userService: UserService
  ) {
    
    let id = navParams.get('id');
    let index = navParams.get('index');
    this.order = userService.getUser().ordersMap[id];
    this.index = index;
    
    this.showDeclineButton = (this.userService.isAdmin() && (this.order.status=='Pending Approval'||this.order.status=='In Kitchen'||this.order.status=='Out for Delivery'));
    this.showApproveButton = (this.userService.isAdmin() && (this.order.status=='Pending Approval'||this.order.status=='Declined'||this.order.status=='Cancelled'));
    this.showDeliverButton = (this.userService.isAdmin() && (this.order.status=='In Kitchen'));
    this.showCompleteButton = (this.userService.isAdmin() && (this.order.status=='Out for Delivery'));
    this.showCancelButton = ( !(this.userService.isAdmin()) && (this.order.status=='Pending Approval'));
    this.showCallDriver = (this.order.status=='Out for Delivery');
    this.isDelivery = (this.order.type=="delivery");
    
    this.presentLoading();
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Please wait...",
      dismissOnPageChange: true
    });
    this.loader = loader;
    loader.present();
  }

  dismissLoading(){
    this.loader.dismiss();
  }

  declineOrder(orderId, which){
    var me = this;
    this.presentLoading();
    this.userService.declineOrder(orderId,me.index,which).then((response) => {
        return response;
      }).then((order) => {
        me.presentAlert("Order Declined!","Status : Declined",null);
        me.dismissLoading();
      }).catch((ex) => {
        console.error('Error : ', ex);
      });
  }

  approveOrder(orderId,which){
    var me = this;
    this.presentLoading();
    this.userService.approveOrder(orderId,me.index,which).then((response) => {
        return response;
      }).then((order) => {
        me.presentAlert("Order Approved!","Status : In Kitchen",null);
        me.dismissLoading();
      }).catch((ex) => {
        console.error('Error : ', ex);
      });
  }

  orderOutForDelivery(orderId, index,driver){
    var me = this;
    this.presentLoading();
    this.userService.orderOutForDelivery(orderId,me.index,driver).then((response) => {
        return response;
      }).then((order) => {
        me.presentAlert("Done","Status : Out for delivery",null);
        this.showDeliverButton = false;
        this.showCompleteButton = true;
        me.dismissLoading();
      }).catch((ex) => {
        console.error('Error : ', ex);
      });
  }

  completeOrder(orderId, index){
    var me = this;
    this.presentLoading();
    this.userService.completeOrder(orderId,me.index).then((response) => {
        return response;
      }).then((order) => {
        me.presentAlert("Order Marked Completed","Status : Complete",null);
        me.dismissLoading();
      }).catch((ex) => {
        console.error('Error : ', ex);
      });
  }

  // CLIENT CANCEL ORDER
  cancelOrder(orderId,which){
    var me = this;
    let prompt = this.alertController.create({
      title: 'Confirm Cancel ?',
      message: "Are you sure you want to cancel this order?",
      inputs: [],
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
            me.presentLoading();
            me.userService.cancelOrder(orderId,me.index,which).then((response) => {
                return response;
              }).then((order) => {
                 me.dismissLoading();
              }).catch((ex) => {
                //console.error('Error : ', ex);
                me.dismissLoading();
                me.presentAlert("Error",ex,null);
              });  
          }
        }
      ]
    });
    prompt.present();
  }

  showDriverSelectionAlert(orderId, index) {
    var me = this;
    let alert = this.alertController.create();
    alert.setTitle('Select Driver');

    for(var i=0 ;i<this.userService.getEmployees().length;i++ ){
      alert.addInput({
        type: 'radio',
        label: this.userService.getEmployees()[i].get("name"),
        value: this.userService.getEmployees()[i],
        checked: false
      });
    }

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        console.log(data);
        if(data){
          me.orderOutForDelivery(orderId, index, data);
        }else{
          me.presentAlert("Error","Please select a driver.",null);
        }
        
      }
    });
    alert.present();
  }

  presentAlert(title,message,call) {
    let alert = this.alertController.create({
      title: title,
      subTitle: message,
      buttons: [
        {
          text: 'OK',
          handler: data => {
            if(call){
              call();
            }
          }
        }
      ]
    });
    alert.present();
  }

  //OPEN ADDRESS ON GOOGLE MAPS IN A NEW TAB 
  openAddressOnMaps(){
    if(this.userService.isAdmin()){
      window.open('http://maps.google.com/?q='+this.order.address.unitNumber+' '+this.order.address.buildingNumber+' '+this.order.address.streetName+' '+this.order.address.city+' '+this.order.address.state+' '+this.order.address.postalCode+' '+this.order.address.country+' ', '_blank');
    }else{
      window.open('http://maps.google.com/?q='+this.configService.companyAddress.unitNumber+' '+this.configService.companyAddress.buildingNumber+' '+this.configService.companyAddress.streetName+' '+this.configService.companyAddress.city+' '+this.configService.companyAddress.state+' '+this.configService.companyAddress.postalCode+' '+this.configService.companyAddress.country+' ', '_blank');     
    }
  }

  openMap(address){
    window.open('http://maps.google.com/?q='+ address.unitNumber+' '+ address.buildingNumber+' '+ address.streetName+' '+ address.city+' '+ address.state+' '+ address.postalCode+' '+ address.country+' ', '_blank');
  }

  callNumber(phone){
    location.href = "tel:"+ phone;
  }

  call(){
    if(!this.userService.isAdmin()){
      console.log("call restaurant");
      location.href = "tel:"+ this.configService.companyContact.phone;
    }else{
      location.href = "tel:"+ this.order.contact.phone;
      console.log("call client");
    }
    
  }

  callDriver(){
    console.log("call driver");
    location.href = "tel:"+this.order.driver.phone;
  }
}

