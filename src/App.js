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
        /* const locationDetails = {
            user: 'yuri',
            lat: '-22.326088810418575',
            lng: '-49.08957188032611'
        }; */
        try {
            const newLocation = await API.graphql(graphqlOperation(constants.addLocation, locationDetails));
            console.log(JSON.stringify(newLocation));
        } catch (err) {
            console.error('error: ', err);
        }
    };
    listLocations = async () => {
        var allLocations;
        try {
            allLocations = await API.graphql(graphqlOperation(constants.listLocations));
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
            //console.log(`Users online : ${Object.keys(this.state.users_online).length}`);
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
        });

        /* this.presenceChannel.bind('pusher:member_added', member => {
            console.log(`Users online : ${Object.keys(this.state.users_online).length}`);
        }); */

        try {
            const locations = await this.listLocations();
            this.setState({ locations: locations.data.listLocations.items });
            await this.getCredentials();
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
        let userList = [];
        if (this.state.users) {
            userList = this.state.users.map((elem) => {
                const name = elem.Attributes.filter(data => data.Name === 'name');
                const lastName = elem.Attributes.filter(data => data.Name === 'family_name');
                const address = elem.Attributes.filter(data => data.Name === 'address');
                console.log(name[0].Value);
                return (
                    <ListItem
                        name={name[0]?.Value + ' ' + lastName[0]?.Value}
                        address={address[0]?.Value}
                        date={elem.UserCreateDate}
                        //onChange={(event) => updateTask(event, index)}
                        //onDelete={() => deleteTask(index)}
                    />
                );
            });
        }
        console.log(userList);
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
                        <div style={{ width: '100%', height: '800px', 'padding-top': '150px' }}>
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