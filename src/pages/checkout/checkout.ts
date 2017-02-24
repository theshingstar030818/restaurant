import {Component} from '@angular/core';
import {NavController, AlertController, NavParams} from 'ionic-angular';
import {OrdersPage} from '../orders/orders'
import {OrdersAdminPage} from '../orders-admin/orders-admin';
import {ModalController} from 'ionic-angular';
import {Events} from 'ionic-angular';

import {CartService} from "../../providers/cart-service";
import {ConfigService} from "../../providers/config-service";
import {CloudService} from "../../providers/cloud-service";

import {AddAddressModal} from "../addAddressModal/modal-content";

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-checkout',
  templateUrl: 'checkout.html'
})
export class CheckoutPage {

  private paymentOptionSelected: any;
  private paymentTypeSelected: any;
  private addressSelected: any;
  private takoutOrDeliverySelected: any;
  private contactSelected: any;
  private specialOrderInstructions: any;
  private searchSelected: any;
  private user: any;
  private showAddressList: any;
  public search: any;
  public cart: any;

  addresses;

  constructor(
    public nav: NavController, 
    public alertController: AlertController,
    public cartService: CartService,
    public params: NavParams,
    public configService: ConfigService,
    public cloudService: CloudService,
    public events: Events,
    public modalCtrl: ModalController
  ) {

    this.cart = params.get('cart');

    events.subscribe('user:update', user => {
        //console.log("user update event from modal");
        this.user = cloudService.user;
    })

    this.search = {ngModel:"",showCancel:false,placeholder:"Search Phone/Address",contacts:this.cloudService.contacts,addresses:this.cloudService.addresses};
    this.takoutOrDeliverySelected = '0';
    this.showAddressList = false;
    this.initializeAddresses();
    this.user = this.cloudService.getUser();
    this.paymentOptionSelected ={};
    for(var i=0; i<configService.payment.payment_options.length; i++){
      this.paymentOptionSelected[configService.payment.payment_options.type] = false;
    }
  }

  onSearchFocus(event){
    //console.log("ionFocus : " + event);
  }

  onSearchBlur(event){
    //this.search.ngModel ="";
  }

  onSearchInput(event){
    console.log(event);
    // Reset items back to all of the items
    this.search.contacts = this.cloudService.contacts;
    this.search.addresses = this.cloudService.addresses;

    // set val to the value of the ev target
    var val = event.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      
      this.search.contacts = this.search.contacts.filter((item) => {
        return (
          (item.get("phone").toLowerCase().indexOf(val.toLowerCase()) > -1) 
          || (item.get("email").toLowerCase().indexOf(val.toLowerCase()) > -1)
        );
      })

      this.search.addresses = this.search.addresses.filter((item) => {
        var valLowerCase = val.toLowerCase();
        return (
          (item.get("unitNumber").toLowerCase().indexOf(valLowerCase) > -1) 
          || (item.get("buildingNumber").toLowerCase().indexOf(valLowerCase) > -1)
          || (item.get("streetName").toLowerCase().indexOf(valLowerCase) > -1)
          || (item.get("city").toLowerCase().indexOf(valLowerCase) > -1)
          || (item.get("postalCode").toLowerCase().indexOf(valLowerCase) > -1)
          || (item.get("country").toLowerCase().indexOf(valLowerCase) > -1)
          || (item.get("state").toLowerCase().indexOf(valLowerCase) > -1)
        );
      })
    }
  }
  // onSearchCancel(event){
  //   //console.log(event);
  // }

  initializeAddresses(){
    this.addresses = this.cloudService.addresses;
  }

  getItems(ev) {
    // Reset items back to all of the items
    this.initializeAddresses();

    // set val to the value of the ev target
    var val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.addresses = this.addresses.filter((item) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }


  // add address
  addContact(){
    var me=this;
    let prompt = this.alertController.create({
      title: 'Contact Info',
      message: "",
      inputs: [
        {
          name: 'email',
          value: '',
          type: "email",
          placeholder: 'Email',
          label: 'Email'
        },
        {
          name: 'phone',
          value: '',
          type: "tel",
          placeholder: 'phone #',
          label: 'phone #'
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            // console.log('Cancel clicked');
          }
        },
        {
          text: 'Save',
          handler: data => {
            if(data.phone){
              if(data.email == undefined){
                data.email = "";
              }
              // if(!me.userService.validateEmail(data.email)){
              //   return false;
              // }else if(!me.userService.validateEmail(data.email)){
              //   return false;
              // }else{
                me.cloudService.addContact(data).then((response) => {
                  return response;
                }).then((itemObject) => {
                  me.user = me.cloudService.user;
                  //console.log(me.user);
                  return true;
                }).catch((ex) => {
                  // console.error('Error : ', ex);
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

  addAddress() {
    let modal = this.modalCtrl.create(AddAddressModal);
    modal.present();
  }

  // add address
  //addAddress() {
    //var me=this;
    // let prompt = this.alertController.create({
    //   title: 'Address',
    //   message: "",
    //   inputs: [
    //     {
    //       name: 'unitNumber',
    //       value: '',
    //       type: 'String',
    //       placeholder: 'Apt/Unit #',
    //       label: 'Apt/Unit #'
    //     },
    //     {
    //       name: 'buildingNumber',
    //       value: '',
    //       type: 'String',
    //       placeholder: 'Building/House #',
    //       label: 'Building/House #'
    //     },
    //     {
    //       name: 'streetName',
    //       value: '',
    //       type: 'String',
    //       placeholder: 'Street',
    //       label: 'Street'
    //     },
    //     {
    //       name: 'city',
    //       value: '',
    //       type: 'String',
    //       placeholder: 'City',
    //       label: 'City'
    //     },
    //     {
    //       name: 'state',
    //       value: '',
    //       type: 'String',
    //       placeholder: 'State',
    //       label: 'State'
    //     },
    //     {
    //       name: 'postalCode',
    //       value: '',
    //       type: 'String',
    //       placeholder: 'Postal Code',
    //       label: 'Postal Code'
    //     },
    //     {
    //       name: 'country',
    //       value: '',
    //       type: 'String',
    //       placeholder: 'Country',
    //       label: 'Country'
    //     },
    //   ],
    //   buttons: [
    //     {
    //       text: 'Cancel',
    //       handler: data => {
    //         console.log('Cancel clicked');
    //       }
    //     },
    //     {
    //       text: 'Save',
    //       handler: data => {
    //         me.userService.addAddress(data).then((response) => {
    //           return response;
    //         }).then((itemObject) => {
    //           me.user = me.userService.getUser();
    //         }).catch((ex) => {
    //           console.error('Error : ', ex);
    //         });
    //       }
    //     }
    //   ]
    // });
    // prompt.present();
  //}

  // place order button click
  buy() {
    var me = this;
    if(this.paymentTypeSelected == undefined){
      this.presentAlert("Error","Please select a payment method.",null);
    }else if(this.contactSelected == undefined){
      // console.log("please select a contact info");
      this.presentAlert("Error","Please select an contact info or add one.",null);
    }else if(this.takoutOrDeliverySelected!='0' && this.addressSelected == undefined){
      // console.log("please select address");
      this.presentAlert("Error","Please select an address or add one.",null);
    }else{
      this.presentAlert("Order Placed","Chef\'s notified",function(){
        var orderObject = {
          address: me.addressSelected,
          contact: me.contactSelected,
          paymentType: me.paymentTypeSelected,
          paymentOption: me.paymentOptionSelected,
          specialOrderInstructions: me.specialOrderInstructions
        };

        if(me.takoutOrDeliverySelected=='0'){
          orderObject.address = "TAKEOUT";
        }

        me.cloudService.addOrder(orderObject).then((response) => {
          return response;
        }).then((itemObject) => {
          me.user = me.cloudService.getUser();
          if(me.user.isAdmin){
            me.nav.setRoot(OrdersAdminPage);
          }else{
            me.nav.setRoot(OrdersPage);
          }
          
        }).catch((ex) => {
          //console.error('Error : ', ex);
        });
      });
    }
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

  paymentOptionOnChange(newValue) {    
    if(this.paymentOptionSelected[newValue]){
      this.paymentOptionSelected[newValue] = false;
    }else{
      this.paymentTypeSelected = undefined;
      var key;
      for (key in this.paymentOptionSelected){
        if(key != newValue){
          this.paymentOptionSelected[key] = false;
        }
      }
      this.paymentOptionSelected[newValue] = true;
    }
  }

  onPaymentTypeChange(newValue){
    this.paymentTypeSelected = newValue;
  }

  onAddressSelect(addressIndex){
    //this.addressSelected = this.userService.getUser().addresses[addressIndex];
    this.addressSelected = addressIndex;
  }

  onTakoutOrDeliverySelect(tackoutOrDelivery){
    this.takoutOrDeliverySelected = tackoutOrDelivery;
  }

  onContactSelect(contactIndex){
    this.contactSelected = contactIndex;
  }

  onSearchSelect(searchSelectVal){
    var me = this;
    console.log(searchSelectVal);
    this.searchSelected = searchSelectVal;
    if(searchSelectVal.includes("contact_")){
      //if contact
      var id = searchSelectVal.replace("contact_", '');
      var contact = this.cloudService.contactsMap[id];
      var relation = contact.relation("addresses");
      this.contactSelected = 0;
      this.user = this.cloudService.setUserContact(contact);
      relation.query().find({
        success: function(list) {
          // list contains the posts that the current user likes.
          //console.log("found the following linke data : " + list);
          me.user = me.cloudService.setUserAddresses(list);
          me.search.ngModel = "";
        }
      });

    }else{
      //if address
      var id = searchSelectVal.replace("address_", '');
      var address = this.cloudService.addressesMap[id];
      var relation = address.relation("contacts");
      this.addressSelected = 0;
      this.user = this.cloudService.setUserAddress(address);
      relation.query().find({
        success: function(list) {
          // list contains the posts that the current user likes.
          //console.log("found the following linke data : " + list);
          me.user = me.cloudService.setUserContacts(list);
          me.takoutOrDeliverySelected = "1";
          me.search.ngModel = "";
        }
      });
    }

  }
}
