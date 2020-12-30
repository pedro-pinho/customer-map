import React, { Component } from 'react';
import GoogleMap from 'google-map-react';

const mapStyles = {
    width: '100%',
    height: '100%'
}

const markerStyle = {
    height: '50px',
    width: '50px',
    marginTop: '-50px'
}

const imgStyle = {
    height: '100%'
}


const Marker = ({ title }) => (
    <div style={markerStyle}>
        <img style={imgStyle} src="https://res.cloudinary.com/og-tech/image/upload/s--OpSJXuvZ--/v1545236805/map-marker_hfipes.png" alt={title} />
        <h3>{title}</h3>
    </div>
);

class App extends Component {
    render() {
        return (
            <div >
                <GoogleMap
                    style={mapStyles}
                    bootstrapURLKeys={{ key: 'AIzaSyBhDHMcNUVKGWe3_JSEeNo9VIZNt6Od6wQ' }}
                    center={{ lat: -22.335927873554713, lng: -49.0955706317051 }}
                    zoom={14}
                >
                    <Marker
                        title={'Current Location'}
                        lat={-22.335927873554713}
                        lng={-49.0955706317051}
                    >
                    </Marker>
                </GoogleMap>
            </div>
        );
    }
}

export default App;
