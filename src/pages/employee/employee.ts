import {Component} from '@angular/core';
import {AlertController} from 'ionic-angular';
import {LoadingController} from 'ionic-angular';
import {UserService} from '../../services/user-service';


import {CartPage} from "../cart/cart";

import Parse from 'parse';

/*
 Generated class for the LoginPage page.

 See http://ionicframework.com/docs/v2/components/#navigation for more info on
 Ionic pages and navigation.
 */
@Component({
  selector: 'employee',
  templateUrl: 'employee.html'
})
export class EmployeePage {
  public employees: any;

  constructor(
    public alertController: AlertController, 
    public loadingCtrl: LoadingController,
    public userService: UserService
  ) {
  	var employee = new Parse.Query("Employee");
  	employee.equalTo("isDeleted",false);
  	var me= this;
  	this.presentLoading();
    employee.find({
      success: function(employees) {
      	me.employees = employees;
      },
      error: function(error){
      	console.error(error);
      }
  	})
  }

  presentLoading() {
    let loader = this.loadingCtrl.create({
      content: "Please wait...",
      dismissOnPageChange: true
    });
    loader.present();
  }


  addEmployee(){
  	var me = this;
    this.presentAlert("Add Employee","Please enter all fields to a an employee",function(data){
    	var Employee = Parse.Object.extend("Employee");
		var employee = new Employee();
		employee.set("name",data.name);
		employee.set("email", data.email);
		employee.set("phone",data.phone);
		employee.set("isDeleted",false);
		employee.save(null, {
			success: function(employee){
				me.employees.push(employee);
        me.userService.addEmpoyee(employee);
			},
			error: function(employee,error){
				console.error(error.message);
			}
		})
    });
  }

  presentAlert(title,message,call) {
    let alert = this.alertController.create({
      title: title,
      subTitle: message,
      inputs: [
        {
          name: 'name',
          value: '',
          type: "name",
          placeholder: 'Name',
          label: 'Name'
        },
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
          text: 'OK',
          handler: data => {
            if(call){
              call(data);
            }
          }
        },
        {
          text: 'Cancel',
          handler: data => {
            
          }
        }
      ]
    });
    alert.present();
  } 
  
}
