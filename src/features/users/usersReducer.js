export default function usersReducer(state, action) {
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

        case 'users/userGroupsLogged': {
            return {
                ...state,
                current_user_groups: action.payload
            }
        }

        case 'users/userList': {
            return {
                ...state,
                users: action.payload
            }
        }

        default:
            return state
    }
}