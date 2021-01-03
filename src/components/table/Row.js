import React, { useState } from 'react';
import { listLocations, updateLocation } from '../../api/Location';
import { disableUser, enableUser, updateUser } from '../../api/User';
import Notify from '../toast/Toast';

const ChangeListItem = async (username, attrs) => {
    const res = await updateUser(username, attrs);
    if (res) {
        Notify('Updated successfully!', 'info');
    }
}

const DeleteListItem = async (username, current, dispatch) => {    
    if (username !== current) {
        //disable user
        const res = await disableUser(username);
        if (res) {
            // disable its location
            var filter = {
                filter: {
                    user: {
                        eq: username
                    }
                }
            };
            let data = await listLocations(filter);
            if (data.data?.listLocations?.items?.length > 0) {
                data = data.data.listLocations.items[0];
                filter = {
                    filter: {
                        id: {
                            eq: data?.id
                        }
                    }
                };
                const locationDetails = {
                    id: data?.id,
                    user: username,
                    lat: data?.lat,
                    lng: data?.lng,
                    deleted: true
                }
                await updateLocation(locationDetails, filter);
                //remove from state
                dispatch({type: 'locations/locationDeletedByUser', payload: username})
                Notify('Deleted successfully!', 'info');
                return true;
            }
        }
        Notify('Something bad happened! Please try again later.', 'error');
    } else {
        Notify('You can\'t delete yourself!', 'error');
    }
    return false;
}

const UndoDeleteListItem = async (username, dispatch) => {
    //enable user
    const res = await enableUser(username);
    if (res) {
        // enable its location
        var filter = {
            filter: {
                user: {
                    eq: username
                }
            }
        };
        let data = await listLocations(filter);
        if (data.data.listLocations.items.length > 0) {
            data = data.data.listLocations.items[0];
            const newLocation = {
                lat: data.lat,
                lng: data.lng,
                user: username,
                deleted: false,
            }
            const locationDetails = {
                id: data.id,
                condition: {
                    user: {
                        eq: username
                    }
                }
            }
            await updateLocation({...newLocation, ...locationDetails });
            dispatch({type: 'locations/locationAdded', payload: newLocation});
            Notify('Undid successfully!', 'info');
        }
    }
}

const RowClick = (username, locations, dispatch) => {
    let key = Object.keys(locations).filter(e => locations[e].user === username);
    if (key && locations[key]) {
        const center = { lat: parseFloat(locations[key].lat), lng: parseFloat(this.state.locations[key].lng) };
        dispatch({type: 'locations/centedChanged', payload: center})
    }
}

function Row({ userName, name, address, date, isOwner, enabled, dispatch, state }) {
    const [editName, setEditName] = useState(0);
    const [editAddress, setEditAddress] = useState(0);

    const [isLoading, setIsLoading] = useState(0);

    const [inputName, setInputName] = useState(name);
    const [inputOldName, setInputOldName] = useState(name);

    const [inputAddress, setInputAddress] = useState(address);
    const [inputOldAddress, setInputOldAddress] = useState(address);

    const [inputEnabled, setInputEnabled] = useState(enabled);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            let names = inputName.split(/ (.+)/);
            ChangeListItem(userName,[                                                                                                                                                                                     
                {                                                                                                                                                                                                 
                    Name: 'name',                                                                                                                                                             
                    Value: names[0]                                                                                                                                                           
                },                                                                                                                                                                                                
                {                                                                                                                                                                                                 
                    Name: 'family_name',                                                                                                                                                                          
                    Value: names[1]                                                                                                                                                                        
                },                                                                                                                                                                                             
                {                                                                                                                                                                                                 
                    Name: 'address',                                                                                                                                                                          
                    Value: inputAddress                                                                                                                                                                      
                },                                                                                                                                                                          
            ]);
            if (editName) {
                setEditName(!editName);
            }
            if (editAddress) {
                setEditAddress(!editAddress);
            }
        }
    }

    const handleDelete = async () => {
        if (!isLoading) {
            setIsLoading(1);
            const success = await DeleteListItem(userName, state.current_user?.username, dispatch);
            setIsLoading(0);
            if (success) {
                setInputEnabled(!inputEnabled);
            }
        }
    }

    const handleUndo = async () => {
        if (!isLoading) {
            setIsLoading(1);
            await UndoDeleteListItem(userName, dispatch);
            setInputEnabled(!inputEnabled);
            setIsLoading(0);
        }
    }

    const handleClick = async () => {
        RowClick(userName, state.locations, dispatch);
    }

    const handleNameOnBlur = () => {
        setEditName(!editName);
        setInputName(inputOldName);
    }

    const handleAddressOnBlur = () => {
        setEditAddress(!editAddress);
        setInputAddress(inputOldAddress);
    }

    return (
        <tr>
            <td onClick={handleClick} data-title="Full Name">
                { editName ?
                <input type="text" value={inputName} onInput={e => setInputName(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleNameOnBlur}/>
                : <div data-toggle="tooltip" data-placement="top" title="Double click to edit" onDoubleClick={() => isOwner ? setEditName(!editName) : null}>{inputName}</div>
                }
            </td>
            <td onClick={handleClick} data-title="Address">
                { editAddress ?
                    <input type="text" value={inputAddress} onInput={e => setInputAddress(e.target.value)} onKeyDown={handleKeyDown} onBlur={handleAddressOnBlur}/>
                    : <p data-toggle="tooltip" data-placement="top" title="Double click to edit" onDoubleClick={() => isOwner ? setEditAddress(!editAddress) : null}>{inputAddress}</p>
                }
            </td>
            <td onClick={handleClick} data-title="Address">
                <small className="text-muted">
                    {date}
                </small>
            </td>
            <td data-title="Actions">
                { isOwner && inputEnabled ?
                    <div onClick={handleDelete}>
                        <button className="btn btn-warning mt-auto align-self-end">
                            { isLoading ?
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                : <span className="title">Delete</span>}
                        </button>
                    </div>
                    : null
                }
                { isOwner && !inputEnabled ?
                    <div onClick={handleUndo}>
                        <button className="btn btn-secondary mt-auto align-self-end">
                            { isLoading ?
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                : <span className="title">Undo</span> }
                        </button>
                    </div>
                    : null
                }
            </td>
        </tr>
        
    );
}

export default Row;