import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {UserService} from '../../services/user-service';

import Parse from 'parse';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'page-setting',
  templateUrl: 'setting.html'
})
export class SettingPage {

	private user: any;

  public fileDetailObject: any;

	constructor(
		public nav: NavController,
		public userService: UserService
	) {
		this.user = this.userService.getUser();
		console.log(this.user);
	}

	uploadPic(){
		document.getElementById("profile_upload").click();
	}

	doUploadProfilePic(fileInput: any){
		var me = this;

	    if (fileInput.target.files && fileInput.target.files[0]) {
	      var reader = new FileReader();
	      
	      reader.onload = function (e : any) {
	          var parseFile = new Parse.File( fileInput.target.files[0].name, { base64: e.target.result });

	          var user = Parse.User.current();
	          user.set("profileImg",parseFile);
	          user.save(null,{
	          	success: function(user){
	          		console.log("uploaed profile pic successfully");
	          		me.userService.setUser(user);
	          		me.user = me.userService.getUser();
	          	},
	          	error: function(user,error){
	          		console.log("Error : " + error.message);
	          	}
	          });

	      }
	      reader.readAsDataURL(fileInput.target.files[0]);
	    }
	}

	saveProfile(){
		var me = this;
		this.user.parseUserObject.set("name",this.user.fullName);
		this.user.parseUserObject.set("email",this.user.email);
		this.user.parseUserObject.save(null,{
	      	success: function(user){
	      		me.userService.setUser(user);
	      		me.user = me.userService.getUser();
	      	},
	      	error: function(user,error){
	      		console.log("Error : " + error.message);
	      	}
	    });
	}
}
