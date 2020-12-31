export const mapStyles = {
    width: '100%',
    height: '100%'
}

export const markerStyle = {
    height: '50px',
    width: '50px',
    marginTop: '-50px'
}

export const imgStyle = {
    height: '100%'
}

export const Marker = ({ title }) => (
    <div style={markerStyle}>
        <img style={imgStyle} src="https://res.cloudinary.com/og-tech/image/upload/s--OpSJXuvZ--/v1545236805/map-marker_hfipes.png" alt={title} />
        <h3>{title}</h3>
    </div>
);

export const initialFormState = {
    username: '', password: '', email: '', authCode: '', formType: 'signUp'
} 

export const listLocations = `query listLocations {
    listLocations{
        items{
            id
            latitude
            longitude
        }
    }
}`;
export const addLocation = `mutation createLocation($latitude:String! $longitude: String!) {
    createLocation(input:{
        latitude:$latitude
        longitude:$longitude
    }){
        id
        latitude
        longitude
    }
}`;