import { API, graphqlOperation } from "aws-amplify";
import * as constants from '../constants/constants.js';
// AWS backend methods
export async function addLocation(locationDetails) {
    var newLocation = null;
    try {
        newLocation = await API.graphql(graphqlOperation(constants.addLocation, locationDetails));
    } catch (err) {
        console.error('error: ', err);
    }
    return newLocation;
}
export async function updateLocation(locationDetails) {
    var updatedLocation = null;
    try {
        updatedLocation = await API.graphql(graphqlOperation(constants.updateLocation, locationDetails ));
    } catch (err) {
        console.error('error: ', err);
    }
    return updatedLocation;
}
export async function listLocations(filter = null) {
    var allLocations = null;
    try {
        allLocations = await API.graphql(graphqlOperation(constants.listLocations, filter));
    } catch (err) {
        console.error('error: ', err);
    }
    return allLocations;
}