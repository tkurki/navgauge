function Map() {
  this.lastLat = 0;
  this.lastLon = 0;
  this.markersBuffers = [[],[],[],[]];
  this.shiftedMarkersBuffers = [this.markersBuffers[0], this.markersBuffers[2], this.markersBuffers[3], this.markersBuffers[1]];
  this.markerCounter = 0;
  this.pointIcon = L.icon({
    iconUrl: '/images/point.png',
    shadowUrl: '/images/point.png',

    iconSize: [10, 10], // size of the icon
    shadowSize: [1, 1], // size of the shadow
    iconAnchor: [5, 5], // point of the icon which will correspond to marker's location
    shadowAnchor: [0, 0],  // the same for the shadow
    popupAnchor: [0, 0] // point from which the popup should open relative to the iconAnchor
  });
  this.visible = false;
  this.center = [60.1, 24.8];
}

Map.prototype = {
  init: function (id) {
    this.map = L.map(id).setView([60.1, 24.8], 13);

    this.map.dragging.disable();
    this.map.touchZoom.disable();
    this.map.doubleClickZoom.disable();
    this.map.scrollWheelZoom.disable();
    this.map.boxZoom.disable();
    this.map.keyboard.disable();

    L.tileLayer.wms("http://kartta.liikennevirasto.fi/meriliikenne//dgds/wms_ip/merikartta", {
      layers: 'cells',
      styles: 'style-id-203',
      format: 'image/png',
      transparent: true
    }).addTo(this.map);
  },
  setVisible: function(flag) {
    this.visible = flag;
    if (this.visible) {
      this.map.panTo(this.center);
    }
  },
  onData: function (data) {
    if (this.lastLat - data.lat != 0 || this.lastLon - data.lon != 0) {
      this.center = [data.lat, data.lon];
      if (this.visible) {
        this.map.panTo(this.center);
      }
      var theMarker = L.marker(this.center, {icon: this.pointIcon});
      theMarker.addTo(this.map);
      theMarker.myid = this.markerCounter +1;

      this.markersBuffers[this.markerCounter++ % this.markersBuffers.length].push(theMarker);
      for (i = 0; i < this.markersBuffers.length; i++) {
        if (this.shiftedMarkersBuffers[i].length > Math.pow(5,i+i)) {
          var markerToRemove = this.shiftedMarkersBuffers[i].shift();
          this.map.removeLayer(markerToRemove);
        }
      }
    }
    this.lastLat = data.lat;
    this.lastLon = data.lon;
  }
}