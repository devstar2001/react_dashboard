import React, {Component} from 'react'
import {Map, TileLayer, Marker, Popup} from 'react-leaflet'

class MapWidget extends Component {
  render() {
    const {positions, zoom} = this.props;
    if (!positions || positions.length === 0)
      return null;
    const p1 = [positions[0].Latitude, positions[0].Longitude];
    return (
        <Map center={p1} zoom={zoom}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {
            positions && positions.length &&
            positions.map((p, index) => {
              return (
                <Marker position={[p.Latitude, p.Longitude]} key={index}>
                  <Popup>
                    <div><b>{p.Store}</b></div>
                    <div>Lat: {p.Latitude}</div>
                    <div>Long: {p.Longitude}</div>
                  </Popup>
                </Marker>
              )
            })
          }
        </Map>
    )
  }
}

MapWidget.defaultProps = {
  positions: [],
  zoom: 5,
};

export default MapWidget;
