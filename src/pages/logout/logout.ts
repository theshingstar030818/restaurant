import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {UserService} from "../../services/user-service";

import {LoginPage} from "../login/login";

import Parse from 'parse';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-logout',
  templateUrl: 'logout.html'
})
export class LogoutPage {
  constructor(
  	public nav: NavController, 
  	public userService: UserService
  ) {
  	userService.logout().then((response) => {
        return response;
      }).then((user) => {
        this.nav.setRoot(LoginPage);
      }).catch((ex) => {
        console.error('Error : ', ex);
      });
  	
  }
}
