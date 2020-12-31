export const bootstrapURLKeys = 'AIzaSyBhDHMcNUVKGWe3_JSEeNo9VIZNt6Od6wQ';

export const mapStyles = {
    width: '100%',
    height: '100%'
}

export const mapContainerStyles = {
    height: '80%'
}

export const markerStyle = {
    height: '50px',
    width: '50px',
    marginTop: '-50px'
}

export const imgStyle = {
    height: '80%'
}

export const Marker = ({ title }) => (
    <div style={markerStyle}>
        <img style={imgStyle} src="https://res.cloudinary.com/og-tech/image/upload/s--OpSJXuvZ--/v1545236805/map-marker_hfipes.png" alt={title} />
        <h3>{title}</h3>
    </div>
);

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