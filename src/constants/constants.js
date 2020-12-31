export const bootstrapURLKeys = 'AIzaSyBhDHMcNUVKGWe3_JSEeNo9VIZNt6Od6wQ';

export const mapStyles = {
    width: '100%',
    height: '100%'
}

export const mapContainerStyles = {
    height: '80%'
}

export const listLocations = `query listLocations {
    listLocations{
        items{
            id
            user
            lat
            lng
            createdAt
            updatedAt
        }
    }
}`;
export const addLocation = `mutation createLocation($user: String! $lat:String! $lng: String!) {
    createLocation(input:{
        user:$user
        lat:$lat
        lng:$lng
    }){
        id
        user
        lat
        lng
    }
}`;