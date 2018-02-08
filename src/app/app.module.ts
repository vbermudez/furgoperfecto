import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { HttpModule } from '@angular/http';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { FiltrosPopover } from '../pages/filtros/filtros';
import { Geolocation } from '@ionic-native/geolocation';

@NgModule({
  declarations: [
    MyApp
    , HomePage
    , FiltrosPopover
  ],
  imports: [
    BrowserModule
    , HttpModule
    , IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
    , HomePage 
    , FiltrosPopover   
  ],
  providers: [
    StatusBar
    , SplashScreen
    , {provide: ErrorHandler, useClass: IonicErrorHandler}
    , Geolocation
  ]
})
export class AppModule {}
