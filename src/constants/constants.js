export const bootstrapURLKeys = 'AIzaSyBhDHMcNUVKGWe3_JSEeNo9VIZNt6Od6wQ';

export const listLocations = `query listLocations($filter: ModelLocationFilterInput $limit: Int $nextToken: String) {
    listLocations(filter: $filter, limit: $limit, nextToken: $nextToken) {
        items{
            id
            user
            lat
            lng
            deleted
            createdAt
            updatedAt
        }
        nextToken
    }
}`;
export const getLocation = `query getLocation(id: $id) {
    listLocations{
        items{
            id
            user
            lat
            lng
            deleted
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
export const updateLocation = `mutation updateLocation($id: ID! $user: String! $lat:String! $lng: String! $deleted: Boolean $condition: ModelLocationConditionInput) {
    updateLocation(input:{
        id: $id
        user:$user
        lat:$lat
        lng:$lng
        deleted:$deleted
    }, condition: $condition){
        id
        user
        lat
        lng
        deleted
    }
}`;

export const signUpConfig = {
    header: 'Register',
    signUpFields: [
        {
            type: "username",
            label: "Username (unique)",
            placeholder: '',
            required: true,
        },
        {
            type: "name",
            label: "First Name",
            placeholder: '',
            required: true,
        },
        {
            type: 'family_name',
            label: 'Last name',
            placeholder: '',
            required: true,
        },
        {
            type: "email",
            label: "Email",
            placeholder: '',
            required: true,
        },
        {
            type: "password",
            label: "Password",
            placeholder: '',
            required: true,
        },
        {
            type: "password",
            label: "Confirm Password",
            placeholder: '',
            required: true,
        },
        {
            type: 'address',
            label: 'Address (Street, ZipCode, City, State, Country)',
            placeholder: '',
            required: true,
        }
    ]
};

export const myTheme = {
    signInButton: { 'color': 'red' },
}