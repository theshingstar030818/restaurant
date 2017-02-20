import {Component} from '@angular/core';
import {NavController, AlertController} from 'ionic-angular';
import {MenuService} from '../../services/menu-service';
import {ConfigService} from '../../services/config-service';
import {CategoryService} from '../../services/category-service';
import {UserService} from '../../services/user-service';
import {ModalController} from 'ionic-angular';
import {LoadingController} from 'ionic-angular';
import {OrderPage} from '../../pages/order/order';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-orders-admin',
  templateUrl: 'orders-admin.html'
})
export class OrdersAdminPage {

  // list of categories
  public user: any;
  public now: Date;
  public showOlder: boolean;
  public showLists: any;
  public dateOptions: any;
  public loader: any;

  constructor(
    public modalCtrl: ModalController, 
    public nav: NavController,
    public alertController: AlertController,
    public loadingCtrl: LoadingController,
    public configService: ConfigService,
    public userService: UserService
    ) {

    this.showLists = {};
    //weekday: "long",
    this.dateOptions = {
        year: "numeric", month: "short",
        day: "numeric", hour: "2-digit", minute: "2-digit"
    };

    // set data for categories
    this.now = new Date();
    this.user = this.userService.getUser();
    this.showOlder = false;
    this.presentLoading();
    console.log("....");
  }

  // view a category
  viewOrder(orderId, index) {
    console.log("view order : " + orderId);
    this.nav.push(OrderPage, {id: orderId, index: index});
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

  flipList(listName){
    this.showLists[listName] = !this.showLists[listName];
  }

  getDate(date){
    var d = new Date(date);
    return d.toLocaleTimeString("en-us", this.dateOptions);
  }

  ordersFilterDateChange(event){
    console.log("date change event : " + event);
    this.presentLoading();
    this.userService.fetchAllOrders();
  }

  // ADMIN ORDER MANIPULATION FUNCTIONS
  declineOrder(orderId, index, which){
    var me = this;
    this.presentLoading();
    this.userService.declineOrder(orderId,index,which).then((response) => {
        return response;
      }).then((order) => {
        me.dismissLoading();
      }).catch((ex) => {
        console.error('Error : ', ex);
      });
  }

  approveOrder(orderId, index, which){
    var me = this;
    this.presentLoading();
    this.userService.approveOrder(orderId,index,which).then((response) => {
        return response;
      }).then((order) => {
        me.dismissLoading();
      }).catch((ex) => {
        console.error('Error : ', ex);
      });
  }

  orderOutForDelivery(orderId, index, driver){
    var me = this;
    this.presentLoading();
    this.userService.orderOutForDelivery(orderId,index,driver).then((response) => {
        return response;
      }).then((order) => {
        me.dismissLoading();
      }).catch((ex) => {
        console.error('Error : ', ex);
      });
  }

  completeOrder(orderId, index){
    var me = this;
    this.presentLoading();
    this.userService.completeOrder(orderId,index).then((response) => {
        return response;
      }).then((order) => {
        me.dismissLoading();
      }).catch((ex) => {
        console.error('Error : ', ex);
      });
  }

  // CLIENT CANCEL ORDER
  cancelOrder(orderId, index,which){
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
            me.userService.cancelOrder(orderId,index,which).then((response) => {
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

  //OPEN ADDRESS ON GOOGLE MAPS IN A NEW TAB 
  openAddressOnMaps(address, order){
    if(order.type=="delivery")
    window.open('http://maps.google.com/?q='+address.unitNumber+' '+address.buildingNumber+' '+address.streetName+' '+address.city+' '+address.state+' '+address.postalCode+' '+address.country+' ', '_blank');
  }
}

