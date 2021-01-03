export default function rootReducer(state = {}, action = '') {
    switch (action.type) {
        case 'users/userLogged': {
            return {
                ...state,
                current_user: action.payload
            }
        }

        case 'users/userIdEntered': {
            return {
                ...state,
                current_user_id: action.payload
            }
        }

        case 'users/userList': {
            return {
                ...state,
                users: action.payload
            }
        }

        case 'locations/locationDeleted': {
            return {
                ...state,
                locations: state.locations.map(loc => {
                    if (loc.id !== action.payload) {
                        return loc
                    }
                    return null;
                })
            }
        }

        case 'locations/locationDeletedByUser': {
            return {
                ...state,
                locations: state.locations.map(loc => {
                    if (loc.user !== action.payload) {
                        return loc
                    }
                    return null;
                })
            }
        }

        case 'locations/locationAdded': {
            let random_string = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
            return {
                ...state,
                locations: {
                    ...state.locations,
                    [random_string]: action.payload
                }
            }
        }

        case 'locations/locationUpdated': {
            return {
                ...state,
                locations: {
                    ...state.locations,
                    [action.name]: action.payload
                }
            }
        }

        case 'locations/centedChanged': {
            return {
                ...state,
                center: action.payload
            }
        }

        default:
            return state
    }
}