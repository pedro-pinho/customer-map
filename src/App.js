import React, { Component } from 'react';
import GoogleMap from 'google-map-react';

import axios from 'axios';
import Pusher from 'pusher-js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API, graphqlOperation } from "aws-amplify";
import ReactDOM from 'react-dom';
import ListItem from './components/ListItem';
import './index.css';
import * as constants from './constants/constants.js';

import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";

toast.configure();
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //center fixed to bauru city hall
            center: { lat: -22.330741676472787, lng: -49.07009477316554 },
            locations: {},
            users_online: [],
            current_user: ''
        }
    }

    // AWS backend methods
    locationMutation = async () => {
        //Adding a fake location for testing purposes.
        const locationDetails = {
            user: 'pedropinho37@gmail.com',
            latitude: '-22.334507132639327',
            longitude: '-49.09722013324578'
        };
        console.log(locationDetails);
        try {
            const newLocation = await API.graphql(graphqlOperation(constants.addLocation, locationDetails));
            console.log('awaited, printing result');
            console.log(JSON.stringify(newLocation));
        } catch (err) {
            console.log('error: ', err);
        }
    };
    listQuery = async () => {
        console.log('listing locations');
        var allLocations;
        try {
            allLocations = await API.graphql(graphqlOperation(constants.listLocations));
        } catch (err) {
            allLocations = '';
            console.log('error: ', err);
        }
        console.log(JSON.stringify(allLocations));
        return allLocations;
    };

    async componentDidMount() {
        var pusher = new Pusher('538f505398eab7878781', {
            authEndpoint: "http://localhost:3128/pusher/auth",
            cluster: 'us2'
        });
        this.presenceChannel = pusher.subscribe('presence-channel');

        this.presenceChannel.bind('pusher:subscription_succeeded', members => {
            this.setState({
                users_online: members.members,
                current_user: members.myID
            });
            this.getLocation();
            //this.notify();
        });

        this.presenceChannel.bind('location-update', body => {
            this.setState((prevState, props) => {
                const newState = { ...prevState }
                newState.locations[`${body.username}`] = body.location;
                return newState;
            });
        });

        this.presenceChannel.bind('pusher:member_removed', member => {
            this.setState((prevState, props) => {
                const newState = { ...prevState };
                // remove member location once they go offline
                delete newState.locations[`${member.id}`];
                // delete member from the list of online users
                delete newState.users_online[`${member.id}`];
                return newState;
            })
            //this.notify()
        });

        this.presenceChannel.bind('pusher:member_added', member => {
            //this.notify();
        });

        try {
            this.locationMutation();
            const locations = await this.listQuery();
            console.log('locations: ', locations);
            //this.setState({ locations: books.data.listBooks.items });
        } catch (err) {
            console.log('error: ', err);
        }
    }

    notify = () => toast(`Users online : ${Object.keys(this.state.users_online).length}`, {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        type: 'info'
    });

    getLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition(position => {
                //Keep watching user's position as he moves
                let location = { lat: position.coords.latitude, lng: position.coords.longitude };
                this.setState((prevState, props) => {
                    let newState = { ...prevState };
                    newState.center = location;
                    newState.locations[`${prevState.current_user}`] = location;
                    return newState;
                });
                axios.post("http://localhost:3128/update-location", {
                    username: this.state.current_user,
                    location: location
                }).then(res => {
                    if (res.status === 200) {
                        console.log("new location updated successfully");
                    }
                });
            })
        } else {
            alert("Sorry, geolocation is not available on your device. You need that to use this app");
        }
    }

    render() {
        let locationMarkers = Object.keys(this.state.locations).map((username, id) => {
            return (
                <constants.Marker
                    key={id}
                    title={`${username === this.state.current_user ? 'My location' : username + "'s location"}`}
                    lat={this.state.locations[`${username}`].lat}
                    lng={this.state.locations[`${username}`].lng}
                >
                </constants.Marker>
            );
        });
        return (
            <div className="App" >
                <AmplifySignOut />
                <GoogleMap
                    style={constants.mapStyles}
                    bootstrapURLKeys={{ key: 'AIzaSyBhDHMcNUVKGWe3_JSEeNo9VIZNt6Od6wQ' }}
                    center={this.state.center}
                    zoom={14}
                >
                    {locationMarkers}
                </GoogleMap>
            </div>
        )
    }
}

export default withAuthenticator(App, true);
