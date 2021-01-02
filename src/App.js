import React, { Component } from 'react';
import GoogleMap from 'google-map-react';

import axios from 'axios';
import Pusher from 'pusher-js';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Auth } from "aws-amplify";
import ListItem from './components/list/ListItem';
import Marker from './components/marker/Marker';
import './index.css';
import * as constants from './constants/constants.js';
import { listUsers, updateUser, disableUser, enableUser } from './functions/aws-user.js';
import { addLocation, updateLocation, listLocations } from './functions/aws-location.js';
import { AmplifyAuthenticator, AmplifySignUp, AmplifySignIn, AmplifySignOut } from '@aws-amplify/ui-react';

toast.configure();
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

    getCurrentUserGroups = () => {
        return this.state.current_user.signInUserSession?.accessToken.payload["cognito:groups"];
    }

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

    onChangeListItem = async (username, attrs) => {
        const res = await updateUser(username, attrs);
        if (res) {
            this.notify('Updated');
        }
    }

    onDeleteListItem = async (username) => {
        //disable user
        const res = await disableUser(username);
        if (res) {
            // disable its location
            var filter = {
                filter: {
                    user: {
                        eq: username
                    }
                }
            };
            let data = await listLocations(filter);
            if (data.data?.listLocations?.items?.length > 0) {
                data = data.data.listLocations.items[0];
                filter = {
                    filter: {
                        id: {
                            eq: data?.id
                        }
                    }
                };
                const locationDetails = {
                    id: data?.id,
                    user: username,
                    lat: data?.lat,
                    lng: data?.lng,
                    deleted: true
                }
                await updateLocation(locationDetails, filter);
                this.notify('Deleted');
            }
        }
    }

    onUndoDeleteListItem = async (username) => {
        //enable user
        const res = await enableUser(username);
        if (res) {
            // disable its location
            var filter = {
                filter: {
                    user: {
                        eq: username
                    }
                }
            };
            let data = await listLocations(filter);
            if (data.data.listLocations.items.length > 0) {
                data = data.data.listLocations.items[0];
                const locationDetails = {
                    id: data.id,
                    user: username,
                    lat: data.lat,
                    lng: data.lng,
                    deleted: false,
                    condition: {
                        user: {
                            eq: username
                        }
                    }
                }
                await updateLocation(locationDetails);
                this.notify('Undoing');
            }
        }
    }

    syncLocation = async () => {
        // Insert user's location to db
        var filter = {
            filter: {
                user: {
                    eq: this.state.current_user?.username
                }
            }
        };
        let old = await listLocations(filter);

        const currLoc = this.state.locations[`${this.state.current_user_id}`];
        if (currLoc) {
            var locationDetails = {
                user: this.state.current_user?.username,
                lat: currLoc.lat,
                lng: currLoc.lng
            };
            
            if (old.data.listLocations.items.length > 0) {
                const data = old.data.listLocations.items[0];
                //avoid updating the location when he didnt move from last time he opened the app
                if ((currLoc.lat !== data.lat || currLoc.lng !== data.lng) && data.id) {
                    locationDetails = {
                        id: data.id,
                        user: this.state.current_user?.username,
                        lat: currLoc.lat,
                        lng: currLoc.lng,
                        deleted: false,
                        condition: {
                            user: {
                                eq: this.state.current_user?.username
                            }
                        }
                    };
                    await updateLocation(locationDetails);
                }

            } else {
                await addLocation(locationDetails);
            }
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
            this.setState(async (prevState, props) => {
                const newState = { ...prevState }
                if (
                    newState.current_user.lat === body.location.lat
                    && newState.current_user.lng === body.location.lng
                ) {
                    //avoid updating the user if he didnt move
                    return newState;
                }
                newState.locations[`${body.username}`] = body.location;
                newState.current_user.lat = body.location.lat;
                newState.current_user.lng = body.location.lng;
                await this.syncLocation();
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
            const locations = await listLocations();

            //push db's locations to this.state
            locations.data.listLocations.items.map((elem, index) => {
                //Current user does not need to be inserted, its already being done
                if (this.state.current_user.username && elem.user !== this.state.current_user.username) {
                    this.setState((prevState, props) => {
                        const newState = { ...prevState }
                        var old = null;
                        if (Object.keys(newState.locations).length > 0) {
                            Object.keys(newState.locations).map((keyName, i) => {
                                if (newState.locations[keyName].user === elem.user) {
                                    old = newState.locations[keyName];
                                }
                            });
                        }
                        if (old) {
                            // Found this user on the array that comes from the node server, update this one
                            newState.locations[`${old.username}`] = {
                                lat: elem.lat,
                                lng: elem.lng,
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
            const users = await listUsers(10);
            this.setState({ users: users });
        } catch (err) {
            console.error('error: ', err);
        }
    }

    notify = (value) => toast(`${value} successfully!`, {
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
                if (!date) {
                    date = new Date();
                }
                date = new Intl.DateTimeFormat('pt-BR').format(date);

                return (
                    <ListItem
                        userName={elem.Username}
                        name={name[0]?.Value + ' ' + lastName[0]?.Value}
                        address={address[0]?.Value}
                        date={date}
                        key={i}
                        enabled={elem.Enabled}
                        isOwner={this.isOwner()}
                        onUndo={this.onUndoDeleteListItem}
                        onChange={this.onChangeListItem}
                        onDelete={this.onDeleteListItem}
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
                    {userList}
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