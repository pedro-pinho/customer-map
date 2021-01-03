import React, { useState } from 'react';

function ListItem({ onChange, onDelete, onUndo, onCardClick, userName, name, address, date, isOwner, enabled }) {
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

    const handleDelete = async () => {
        if (!isLoading) {
            setIsLoading(1);
            const success = await onDelete(userName);
            setIsLoading(0);
            if (success) {
                setInputEnabled(!inputEnabled);
            }
        }
    }

    const handleUndo = async () => {
        if (!isLoading) {
            setIsLoading(1);
            await onUndo(userName);
            setInputEnabled(!inputEnabled);
            setIsLoading(0);
        }
    }

    const handleClick = async () => {
        onCardClick(userName);
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

export default ListItem;