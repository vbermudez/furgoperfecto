import { Component, ElementRef, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Http, Response } from '@angular/http';
import { PopoverController } from 'ionic-angular';
import { FiltrosPopover } from '../filtros/filtros';

declare var google;
declare var MarkerClusterer;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  
  @ViewChild('map') mapElement: ElementRef;
  private map: any;
  private cluster: any;
  private infoWin: any;

  gratuito: boolean;
  agua: boolean;
  wc: boolean;
  todas: boolean;
  private markers: Array<any>;
  private icons: Array<string>;

  constructor(
    public navCtrl: NavController
    , public geoLocation: Geolocation
    , private http: Http
    , public popoverCtrl: PopoverController
  ) { 
    this.todas = true;
    this.gratuito = false;
    this.agua = false;
    this.wc = false;
    this.markers = [];
    this.cluster = null;
    this.infoWin = new google.maps.InfoWindow({
      content: ''
    });
    this.icons = [
      'https://www.furgovw.org/mapa_imagenes/furgonetikaiconozo2.png',
      'https://www.furgovw.org/mapa_imagenes/balonrojodu6.png',
      'https://www.furgovw.org/mapa_imagenes/balonverdese8.png',
      '',
      'https://www.furgovw.org/mapa_imagenes/campingnh4.png',
      'https://www.furgovw.org/mapa_imagenes/centrocomercialdo4.jpg',
      'https://www.furgovw.org/mapa_imagenes/campingtp.jpg'
    ];
  }

  ionViewDidLoad() {
    this.loadMap()
      .then(_ => this.reloadMarkers());
  }

  showFilters(ev?: Event) {
    let popover = this.popoverCtrl.create(FiltrosPopover, {
      reload: (todas, gratuito, agua, wc) => {
        this.todas = todas;
        this.gratuito = gratuito;
        this.agua = agua;
        this.wc = wc;
        this.reloadMarkers();
      },
      todas: this.todas,
      gratuito: this.gratuito,
      agua: this.agua,
      wc: this.wc
    });

    popover.present({
      ev: ev
    });
  }

  reloadMarkers(): void {
    if (this.todas) {
      this.gratuito = false;
      this.agua = false;
      this.wc = false;
    }

    this.loadFurgoPerfecto().then(data => {
      this.removeMarkers();

      if (this.todas) {
        this.addMarkers(data);
      } else {
        let filtered: Array<any> = data.filter(item => {
          if (item.destomtom == null || item.destomtom.trim() == '') return true;
  
          let reText: string = (this.gratuito ? 'gratuito' : '') + ';\s{0,}agua:\s{0,}' +
                  (this.agua ? 'si' : 'no') + ';\s{0,}wc:\s{0,}' + 
                  (this.wc ? 'si': 'no');
          let re: RegExp = new RegExp(reText, 'i');
  
          return re.test(item.destomtom);
        });

        if (filtered.length) {
          this.addMarkers(filtered);
        }
      }
    });
  }

  loadMap(): Promise<Geoposition> {
    return this.geoLocation.getCurrentPosition().then((position: Geoposition) => {
      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      let mapOptions = {
        center: latLng,
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      return position;
    });
  }

  loadFurgoPerfecto(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get('https://www.furgovw.org/api.php?getEverything=&withoutBody=')
        .subscribe((res: Response) => {
          resolve(res.json());
        }, err => {
          reject(err);
        });
    });
  }

  addMarker(item: any): void {
    let latLng = new google.maps.LatLng(item.lng, item.lat);
    let marker = new google.maps.Marker({
      // map: this.map,
      // animation: google.maps.Animation.DROP,
      position: latLng,
      title: item.nombre,
      link: item.link,
      imagen: item.imagen,
      autor: item.autor,
      icon: this.icons[item.icon],
      objeto: item
    });
    let me = this;
    google.maps.event.addListener(marker, 'click', function(e) {
      console.log('click', this, e);
      me.getMarkerContent(this.objeto).then(cnt => {
        me.infoWin.setContent(cnt);
        me.infoWin.open(me.map, this);
      });
      
    });

    this.markers.push(marker);
  }

  addMarkers(items: Array<any>): void {
    for(const item of items) {
      this.addMarker(item);
    }

    this.cluster = new MarkerClusterer(this.map, this.markers, {
      gridSize: 50,
      maxZoom: 15,
      imagePath: 'assets/imgs/m'
    });
  }

  removeMarkers(): void {
    this.markers.forEach(marker => {
      marker.setMap(null);
      google.maps.event.clearInstanceListeners(marker);
    });

    if (this.cluster != null) this.cluster.removeMarkers(this.markers);
    
    this.markers = [];
    this.cluster = null;
  }

  getMarkerContent(item: any): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      this.http.get(item.link).subscribe((res: Response) => {
        let span: HTMLSpanElement = document.createElement('span');

        span.innerHTML = res.text();
        
        let post: Element = span.querySelectorAll('div.post > div.inner')[0];
        
        resolve(post.innerHTML);
      }, err => {
        reject(err);
      });
    });
  }
}
