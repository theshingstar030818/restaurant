import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ConfigService} from '../../services/config-service';
import {UserService} from '../../services/user-service';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-about',
  templateUrl: 'about.html'
})
export class AboutPage {

  private edit: boolean;

  constructor(
    public nav: NavController,
    public configService: ConfigService,
    public userService: UserService
  ) {
      
  }

  emailUs(){
    window.open('mailto:'+this.configService.companyEmailAddress);
  }

  callUs(){
    console.log("call us");
    location.href = "tel:"+this.configService.companyContact.phone;
  }

  openAddressOnMaps(address){
    window.open('http://maps.google.com/?q='+this.configService.companyAddress.unitNumber+' '+this.configService.companyAddress.buildingNumber+' '+this.configService.companyAddress.streetName+' '+this.configService.companyAddress.city+' '+this.configService.companyAddress.state+' '+this.configService.companyAddress.postalCode+' '+this.configService.companyAddress.country+' ', '_blank');
  }

  //start editing
  startEditing(){
    this.edit = true;
  }

  //save config changes done by admin 
  saveChanges(){
    
  }
}
