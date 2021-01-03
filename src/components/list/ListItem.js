import React, { useState } from 'react';

function ListItem({ onChange, onDelete, onUndo, onCardClick, userName, name, address, date, isOwner, enabled }) {
    const [editName, setEditName] = useState(0);
    const [editAddress, setEditAddress] = useState(0);

    const [inputName, setInputName] = useState(name);
    const [inputAddress, setInputAddress] = useState(address);

    const [inputEnabled, setInputEnabled] = useState(enabled);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            let names = inputName.split(/ (.+)/);
            onChange(userName,[                                                                                                                                                                                     
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

    const handleInactive = async () => {
        await onDelete(userName);
        setInputEnabled(!inputEnabled);
    }

    const handleUndo = async () => {
        await onUndo(userName);
        setInputEnabled(!inputEnabled);
    }

    const handleClick = async () => {
        onCardClick(userName);
    }

    return (
        <tr onClick={handleClick}>
            <td data-title="Full Name">
                { editName ?
                <input type="text" value={inputName} onInput={e => setInputName(e.target.value)} onKeyDown={handleKeyDown}/>
                : <div data-toggle="tooltip" data-placement="top" title="Double click to edit" onDoubleClick={() => isOwner ? setEditName(!editName) : null}>{inputName}</div>
                }
            </td>
            <td data-title="Address">
                { editAddress ?
                    <input type="text" value={inputAddress} onInput={e => setInputAddress(e.target.value)} onKeyDown={handleKeyDown}/>
                    : <p data-toggle="tooltip" data-placement="top" title="Double click to edit" onDoubleClick={() => isOwner ? setEditAddress(!editAddress) : null}>{inputAddress}</p>
                }
            </td>
            <td data-title="Address">
                <small className="text-muted">
                    {date}
                </small>
            </td>
            <td data-title="Actions">
                { isOwner && inputEnabled ?
                    <button className="btn btn-warning mt-auto align-self-end" onClick={handleInactive}>Delete</button>
                    : null
                }
                { isOwner && !inputEnabled ?
                    <button className="btn btn-secondary mt-auto align-self-end" onClick={handleUndo}>Undo Delete</button>
                    : null
                }
            </td>
        </tr>
        
    );
}

export default ListItem;