import React, { useEffect, useReducer } from 'react';

import GoogleMap from 'google-map-react';
import axios from 'axios';
import Pusher from 'pusher-js';

import 'react-toastify/dist/ReactToastify.css';
import { Auth } from "aws-amplify";
import Marker from './components/marker/Marker';
import './index.css';
import './App.css';
import * as constants from './constants/constants.js';
import { listUsers } from './api/User.js';
import { addLocation, updateLocation, listLocations } from './api/Location.js';
import { AmplifyAuthenticator, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react';
import Table from './components/table/Table';
import Navbar from './components/navbar/Navbar';

import RootReducer from './reducer';

const initial = {
    users_online: [],
    users: [],
    current_user_id: '',
    current_user: {},
    current_user_groups: [],
    center: {
        lat: -22.330741676472787,
        lng: -49.07009477316554
    },
    locations: {},
}

function init(initialState) {
    return initialState;
}

async function syncLocation(state) {
    // Insert user's location to db
    var filter = {
        filter: {
            user: {
                eq: state.current_user?.username
            }
        }
    };
    let old = await listLocations(filter);

    const currLoc = state.locations[`${state.current_user_id}`];
    if (currLoc && old) {
        var locationDetails = {
            user: state.current_user?.username,
            lat: currLoc.lat,
            lng: currLoc.lng
        };
        
        if (old.data.listLocations.items.length > 0) {
            const data = old.data.listLocations.items[0];
            //avoid updating the location when he didnt move from last time he opened the app
            if ((currLoc.lat !== data.lat || currLoc.lng !== data.lng) && data.id) {
                locationDetails = {
                    id: data.id,
                    user: state.current_user?.username,
                    lat: currLoc.lat,
                    lng: currLoc.lng,
                    deleted: false,
                    condition: {
                        user: {
                            eq: state.current_user?.username
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

function isOwner(state) {
    const owner = state.current_user?.signInUserSession?.accessToken?.payload["cognito:groups"].filter(elem => elem === 'owners');
    return owner && owner.length > 0;
}

async function load(state, dispatch) {
    try {
        const locations = await listLocations();
        //push db's locations to this.state
        locations.data.listLocations.items.map((elem, index) => {
            //Current user does not need to be inserted, its already being done
            if (state.current_user.username && elem.user !== state.current_user.username) {
                var old = null;
                if (Object.keys(state.locations).length > 0) {
                    Object.keys(state.locations).map((keyName, i) => {
                        if (state.locations[keyName].user === elem.user) {
                            old = state.locations[keyName];
                        }
                        return null;
                    });
                }
                const newLocation = {
                    lat: elem.lat,
                    lng: elem.lng,
                    user: elem.user,
                    deleted: elem.deleted,
                }
                if (old && typeof old === 'object' && old.username !== 'undefined') {
                    // Found this user on the array that comes from the node server, update this one
                    dispatch({type: 'locations/locationUpdated', name: old.username, payload: newLocation})
                } else {
                    // New user, push it to state so its painted on the screen
                    dispatch({type: 'locations/locationAdded', payload: newLocation})
                }
            }
            return elem;
        });
    } catch (err) {
        console.error('error: ', err);
    }
}

async function getCredentials(state, dispatch) {
    const cred = await Auth.currentAuthenticatedUser();
    dispatch({type:'users/userLogged', payload: cred});
}

function getLocation(users, dispatch) {
    if ("geolocation" in navigator) {
        navigator.geolocation.watchPosition(position => {
            //Keep watching user's position as he moves
            let location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                user: users.current_user.username
            };
            dispatch({type: 'locations/locationUpdated', name: users.current_user_id, payload: location});
            axios.post("http://localhost:3128/update-location", {
                username: users.current_user_id,
                location: location
            });
        })
    } else {
        alert("Sorry, geolocation is not available on your device. You need that to use this app");
    }
}

function App() {
    const [state, dispatch] = useReducer(RootReducer,initial, init);

    useEffect(() => {
        var pusher = new Pusher('538f505398eab7878781', {
            authEndpoint: "http://localhost:3128/pusher/auth",
            cluster: 'us2'
        });
        const presenceChannel = pusher.subscribe('presence-channel');
    
        presenceChannel.bind('pusher:subscription_succeeded', members => {
            dispatch({type: 'users/userIdEntered', payload: members.myID});
            getLocation(state.users, dispatch);
        });
    
        presenceChannel.bind('location-update', async body => {
            //dispatch({type: 'locations/locationUpdated', name: body.username, payload: body.location});
            //await syncLocation(state);
        });
    
        presenceChannel.bind('pusher:member_removed', member => {
            dispatch({type: 'locations/locationDeleted', payload: member.id})
            
        });

        (async function loading() {
            await getCredentials(state, dispatch);
            await load(state, dispatch);
            //Show list
            const users = await listUsers(10);
            dispatch({type: 'users/userList', payload: users});
        })();

    }, [state]);

    let locationMarkers = Object.keys(state.locations).map((key, id) => {
        const curr = state.locations[key];
        if (typeof curr.user === "undefined" && state.current_user) {
            curr.user = state.current_user.username;
        }
        if (!curr.deleted && state.current_user) {
            return (
                <Marker
                    key={id}
                    title={`${curr.user === state.current_user.username ? 'My location' : curr.user + "'s location"}`}
                    lat={curr.lat}
                    lng={curr.lng}
                >
                </Marker>
            );
        }
        return null;
    });

    return (
        <AmplifyAuthenticator>
            <AmplifySignUp
                slot="sign-up"
                headerText={constants.signUpConfig.header}
                formFields={constants.signUpConfig.signUpFields} 
            />
            <AmplifySignIn slot="sign-in" />
            <div className="App" >
                <div className="App-body">
                    <Navbar />
                    <Table
                        state={state}
                        dispatch={dispatch}
                        users={state.users}
                        isOwner={isOwner(state)}
                    />
                    <div className="row pt-3">
                        <div className="col">
                            <div className="card">
                                <GoogleMap
                                    bootstrapURLKeys={{ key: constants.bootstrapURLKeys }}
                                    center={state.center}
                                    zoom={14}
                                    style={{ width: '100%', height: '50vh' }}
                                >
                                    {locationMarkers}
                                </GoogleMap>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AmplifyAuthenticator>
    )
}
export default App;