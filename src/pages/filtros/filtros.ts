import { Component } from '@angular/core';
import { ViewController, NavParams } from 'ionic-angular';

@Component({
    selector: 'popover-filtros',
    templateUrl: 'filtros.html'
})
export class FiltrosPopover {
    gratuito: boolean;
    agua: boolean;
    wc: boolean;
    todas: boolean;

    constructor(public viewCtrl: ViewController, public params: NavParams) {
        this.todas = this.params.get('todas');
        this.gratuito = this.params.get('gratuito');
        this.agua = this.params.get('agua');
        this.wc = this.params.get('wc');
    }
  
    close() {
        this.params.get('reload')(this.todas, this.gratuito, this.agua, this.wc); 
        this.viewCtrl.dismiss();
    }
}