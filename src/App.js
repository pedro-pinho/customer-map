import React, { Component } from 'react';
import GoogleMap from 'google-map-react';

import axios from 'axios';
import Pusher from 'pusher-js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API, Auth, graphqlOperation } from "aws-amplify";
import ListItem from './components/list/ListItem';
import Marker from './components/marker/Marker';
import './index.css';
import * as constants from './constants/constants.js';
import { AmplifyAuthenticator, AmplifySignUp, AmplifySignIn, AmplifySignOut } from '@aws-amplify/ui-react';

toast.configure();
let nextToken;
class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //center fixed to bauru city hall
            center: { lat: -22.330741676472787, lng: -49.07009477316554 },
            locations: {},
            users_online: [],
            users: [],
            current_user_id: '',
            current_user: {},
            current_user_groups: []
        }
    }

    // AWS backend methods
    addLocation = async (locationDetails) => {
        try {
            const newLocation = await API.graphql(graphqlOperation(constants.addLocation, locationDetails));
            console.log(JSON.stringify(newLocation));
        } catch (err) {
            console.error('error: ', err);
        }
    };
    updateLocation = async (locationDetails, filter) => {
        try {
            const updatedLocation = await API.graphql(graphqlOperation(constants.updateLocation, { locationDetails, filter } ));
            console.log(JSON.stringify(updatedLocation));
        } catch (err) {
            console.error('error: ', err);
        }
    }
    listLocations = async (filter = null) => {
        var allLocations;
        try {
            allLocations = await API.graphql(graphqlOperation(constants.listLocations, filter));
        } catch (err) {
            console.error('error: ', err);
        }
        return allLocations;
    };
    listUsers = async (limit) => {
        let apiName = 'AdminQueries';
        let path = '/listUsersInGroup';
        let myInit = {
            queryStringParameters: {
                "groupname": "customers",
                "limit": limit,
                "token": nextToken
            },
            headers: {
                'Content-Type': 'application/json',
                Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
            }
        }
        const { NextToken, ...rest } = await API.get(apiName, path, myInit);
        try {
            nextToken = NextToken;
            return rest?.Users;
        } catch (error) {
            console.error('There as an Error', error);
        }
    }
    addToOwnersGroup = async () => {
        const apiName = 'AdminQueries';
        const path = '/addUserToGroup';
        const userName = this.state.current_user.username;
        const myInit = {
            body: {
                "username" : userName,
                "groupname": 'owners'
            }, 
            headers: {
                'Content-Type' : 'application/json',
                Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
            } 
        }
        const result = await API.post(apiName, path, myInit);
        await this.getCredentials();
        return result;
    }
    getCurrentUserGroups = () => {
        return this.state.current_user.signInUserSession?.accessToken.payload["cognito:groups"];
    };
    isOwner = () => {
        const owner = this.state.current_user_groups.filter(elem => elem === 'owners');
        return owner.length > 0;
    }
    getCredentials = async () => {
        const cred = await Auth.currentAuthenticatedUser();
        this.setState({ current_user: cred });
        const groups = this.getCurrentUserGroups();
        this.setState({ current_user_groups: groups });
    }
    //@todo check if can be deleted
    syncLocation = async () => {
        // Insert user's location to db
        var filter = {
            filter: {
                user: {
                    eq: this.state.current_user?.username
                }
            }
        };
        let old = await this.listLocations(filter);

        const currLoc = this.state.locations[`${this.state.current_user_id}`];
        const locationDetails = {
            user: this.state.current_user?.username,
            lat: currLoc.lat,
            lng: currLoc.lng
        };

        if (old.data.listLocations.items.length > 0) {
            filter = {
                filter: {
                    id: {
                        eq: old.data.listLocations.items[0].id
                    }
                }
            };
            this.updateLocation(locationDetails, filter);
        } else {
            this.addLocation(locationDetails);
        }
    }

    async componentDidMount() {
        var pusher = new Pusher('538f505398eab7878781', {
            authEndpoint: "http://localhost:3128/pusher/auth",
            cluster: 'us2'
        });
        this.presenceChannel = pusher.subscribe('presence-channel');

        this.presenceChannel.bind('pusher:subscription_succeeded', members => {
            this.setState({
                users_online: members.members,
                current_user_id: members.myID
            });
            this.getLocation();
        });

        this.presenceChannel.bind('location-update', body => {
            this.setState((prevState, props) => {
                const newState = { ...prevState }
                newState.locations[`${body.username}`] = body.location;
                newState.current_user.lat = body.location.lat;
                newState.current_user.lng = body.location.lat;
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
        });

        try {
            await this.getCredentials();
            const locations = await this.listLocations();

            //push db's locations to the state
            locations.data.listLocations.items.map((elem, index) => {
                //Current user does not need to be inserted, its already being done
                if (this.state.current_user.username && elem.user !== this.state.current_user.username) {
                    this.setState((prevState, props) => {
                        const newState = { ...prevState }
                        const usersEntry = newState.locations.filter(data => data.location.user === this.state.current_user.username);
                        if (usersEntry) {
                            // Found this user on the array that comes from the node server, update this one
                            newState.locations[`${usersEntry.username}`] = {
                                lat: elem.lat,
                                lng: elem.lat,
                                user: elem.user
                            }
                        } else {
                            // New user, push it to state so its painted on the screen
                            let random_string = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                            newState.locations[`${random_string}`] = {
                                lat: elem.lat,
                                lng: elem.lat,
                                user: elem.user
                            }
                        }
                        return newState;
                    });
                }
                return elem;
            });

            //Show list
            if (this.isOwner()) {
                const users = await this.listUsers(10);
                this.setState({ users: users });
            }
        } catch (err) {
            console.error('error: ', err);
        }
    }

    getLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition(position => {
                //Keep watching user's position as he moves
                let location = { lat: position.coords.latitude, lng: position.coords.longitude, user: this.state.current_user.username };
                this.setState((prevState, props) => {
                    let newState = { ...prevState };
                    newState.center = location;
                    newState.locations[`${prevState.current_user_id}`] = location;
                    return newState;
                });
                axios.post("http://localhost:3128/update-location", {
                    username: this.state.current_user_id,
                    location: location
                });
            })
        } else {
            alert("Sorry, geolocation is not available on your device. You need that to use this app");
        }
    }

    render() {
        let userList = [];
        if (this.state.users) {
            userList = this.state.users.map((elem, i) => {
                const name = elem.Attributes.filter(data => data.Name === 'name');
                const lastName = elem.Attributes.filter(data => data.Name === 'family_name');
                const address = elem.Attributes.filter(data => data.Name === 'address');

                let date = new Date(elem.UserCreateDate);
                date = new Intl.DateTimeFormat('pt-BR').format(date);

                return (
                    <ListItem
                        name={name[0]?.Value + ' ' + lastName[0]?.Value}
                        address={address[0]?.Value}
                        date={date}
                        key={i}
                        //@todo: add those methods
                        //onChange={(event) => updateUser(event, index)}
                        //onDelete={() => deleteUser(index)}
                    />
                );
            });
        }
        let locationMarkers = Object.keys(this.state.locations).map((key, id) => {
            const curr = this.state.locations[key];
            if (typeof curr.user === "undefined") {
                curr.user = this.state.current_user.username;
            }
            return (
                <Marker
                    key={id}
                    title={`${curr.user === this.state.current_user.username ? 'My location' : curr.user + "'s location"}`}
                    lat={curr.lat}
                    lng={curr.lng}
                >
                </Marker>
            );
        });
        return (
            <AmplifyAuthenticator>
                <AmplifySignUp
                    slot="sign-up"
                    headerText={constants.signUpConfig.header}
                    formFields={constants.signUpConfig.signUpFields} 
                />
                <AmplifySignIn slot="sign-in" />
                <AmplifySignOut />
                <div className="App" >
                    { !this.isOwner() ? <button onClick={this.addToOwnersGroup} >I am an Owner!</button> : userList}
                    <div className="App-body">
                        <div style={{ width: '100%', height: '800px', 'paddingTop': '150px' }}>
                            <GoogleMap
                                bootstrapURLKeys={{ key: constants.bootstrapURLKeys }}
                                center={this.state.center}
                                zoom={14}
                            >
                                {locationMarkers}
                            </GoogleMap>
                        </div>
                    </div>
                </div>
            </AmplifyAuthenticator>
        )
    }
}
export default App;