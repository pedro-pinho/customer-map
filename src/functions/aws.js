import { API, Auth, graphqlOperation } from "aws-amplify";
import * as constants from '../constants/constants.js';
// AWS backend methods
export async function addLocation(locationDetails) {
    try {
        const newLocation = await API.graphql(graphqlOperation(constants.addLocation, locationDetails));
        console.log(JSON.stringify(newLocation));
    } catch (err) {
        console.error('error: ', err);
    }
}
export async function updateLocation(locationDetails, filter) {
    try {
        const updatedLocation = await API.graphql(graphqlOperation(constants.updateLocation, { locationDetails, filter } ));
        console.log(JSON.stringify(updatedLocation));
    } catch (err) {
        console.error('error: ', err);
    }
}
export async function listLocations(filter = null) {
    var allLocations;
    try {
        allLocations = await API.graphql(graphqlOperation(constants.listLocations, filter));
    } catch (err) {
        console.error('error: ', err);
    }
    return allLocations;
}
export async function listUsers(limit) {
    let apiName = 'AdminQueries';
    let path = '/listUsersInGroup';
    let myInit = {
        queryStringParameters: {
            "groupname": "customers",
            "limit": limit,
        },
        headers: {
            'Content-Type': 'application/json',
            Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
        }
    }
    const { NextToken, ...rest } = await API.get(apiName, path, myInit);
    try {
        return rest?.Users;
    } catch (error) {
        console.error('There as an Error', error);
    }
}
/* export async function addToOwnersGroup() {
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
} */

export async function updateUser(userName, attrs) {
    const apiName = 'AdminQueries';
    const path = '/updateUser';
    const myInit = {
        body: {
            "username" : userName,
            "attributes": attrs
        }, 
        headers: {
            'Content-Type' : 'application/json',
            Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
        } 
    }
    const result = await API.post(apiName, path, myInit);
    console.log(result);
    return result;
}