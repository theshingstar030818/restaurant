import {NgModule} from '@angular/core';
import {IonicApp, IonicModule} from 'ionic-angular';
import {MyApp} from './app.component';

// import services
import {MenuService} from '../services/menu-service';
import {CategoryService} from '../services/category-service';
import {UserService} from "../services/user-service"
import {ItemService} from '../services/item-service';
import {CartService} from '../services/cart-service';
import {ConfigService} from '../services/config-service';
import {PostService} from '../services/post-service';
import {ChatService} from '../services/chat-service';
// end import services
// end import services

// import pages
import {AboutPage} from '../pages/about/about';
import {AddCategoryModal} from '../pages/addCategoryModal/modal-content';
import {AddItemModal} from '../pages/addItemModal/modal-content';
import {AddAddressModal} from '../pages/addAddressModal/modal-content';
import {AddressPage} from '../pages/address/address';
import {CartPage} from '../pages/cart/cart';
import {EmployeePage} from '../pages/employee/employee';
// import {CategoriesPage} from '../pages/categories/categories';
import {CategoryPage} from '../pages/category/category';
// import {ChatDetailPage} from '../pages/chat-detail/chat-detail';
// import {ChatsPage} from '../pages/chats/chats';
import {CheckoutPage} from '../pages/checkout/checkout';
// import {FavoritePage} from '../pages/favorite/favorite';
import {OrdersPage} from '../pages/orders/orders';
import {OrdersAdminPage} from '../pages/orders-admin/orders-admin';
import {OrderPage} from '../pages/order/order';
import {HomePage} from '../pages/home/home';
import {ItemPage} from '../pages/item/item';
import {LoginPage} from '../pages/login/login';
import {LogoutPage} from '../pages/logout/logout';
// import {NewsPage} from '../pages/news/news';
// import {OfferPage} from '../pages/offer/offer';
import {RegisterPage} from '../pages/register/register';
import {SettingPage} from '../pages/setting/setting';
import {UserPage} from '../pages/user/user';
// end import pages

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    AddCategoryModal,
    AddAddressModal,
    AddItemModal,
    AddressPage,
    CartPage,
    EmployeePage,
    // CategoriesPage,
    CategoryPage,
    // ChatDetailPage,
    // ChatsPage,
    CheckoutPage,
    // FavoritePage,
    OrdersAdminPage,
    OrdersPage,
    OrderPage,
    HomePage,
    ItemPage,
    LoginPage,
    LogoutPage,
    // NewsPage,
    // OfferPage,
    RegisterPage,
    SettingPage,
    UserPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    AddCategoryModal,
    AddAddressModal,
    AddItemModal,
    AddressPage,
    CartPage,
    EmployeePage,
    // CategoriesPage,
    CategoryPage,
    // ChatDetailPage,
    // ChatsPage,
    CheckoutPage,
    // FavoritePage,
    OrdersAdminPage,
    OrdersPage,
    OrderPage,
    HomePage,
    ItemPage,
    LoginPage,
    LogoutPage,
    // NewsPage,
    // OfferPage,
    RegisterPage,
    SettingPage,
    UserPage
  ],
  providers: [
    MenuService,
    CategoryService,
    ItemService,
    CartService,
    ConfigService,
    PostService,
    ChatService,
    UserService
    /* import services */
  ]
})

export class AppModule {
    constructor(
        
    ){
        
    }
}
