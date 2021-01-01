export const bootstrapURLKeys = 'AIzaSyBhDHMcNUVKGWe3_JSEeNo9VIZNt6Od6wQ';

export const listLocations = `query listLocations {
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
export const updateLocation = `mutation updateLocation($user: String! $lat:String! $lng: String!) {
    updateLocation(input:{
        user:$user
        lat:$lat
        lng:$lng
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
    hideAllDefaults: true,
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
    /* [
        {
            label: 'Username (Unique)',
            key: 'user_name',
            required: true,
            displayOrder: 1,
            type: 'string'
        },
        {
            label: 'First Name',
            key: 'name',
            required: true,
            displayOrder: 2,
            type: 'string'
        },
        {
            label: 'Last name',
            key: 'family_name',
            required: true,
            displayOrder: 3,
            type: 'string'
        },
        {
            label: 'Password',
            key: 'password',
            required: true,
            displayOrder: 4,
            type: 'password'
        },
        {
            label: 'Confirm Password',
            key: 'password',
            required: true,
            displayOrder: 5,
            type: 'password'
        },
        {
            label: 'Email',
            key: 'email',
            required: true,
            displayOrder: 6,
            type: 'email'
        },
        {
            label: 'Address (Street, ZipCode, City, State, Country)',
            key: 'address',
            required: true,
            displayOrder: 7,
            type: 'string'
        }
    ] */
};

export const myTheme = {
    signInButton: { 'color': 'red' },
}