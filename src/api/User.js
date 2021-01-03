import { API, Auth } from "aws-amplify";
// AWS backend methods
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
    return result;
}
export async function disableUser(userName) {
    const apiName = 'AdminQueries';
    const path = '/disableUser';
    const myInit = {
        body: {
            "username" : userName
        }, 
        headers: {
            'Content-Type' : 'application/json',
            Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
        } 
    }
    const result = await API.post(apiName, path, myInit);
    return result;
}
export async function enableUser(userName) {
    const apiName = 'AdminQueries';
    const path = '/enableUser';
    const myInit = {
        body: {
            "username" : userName
        }, 
        headers: {
            'Content-Type' : 'application/json',
            Authorization: `${(await Auth.currentSession()).getAccessToken().getJwtToken()}`
        } 
    }
    const result = await API.post(apiName, path, myInit);
    return result;
}