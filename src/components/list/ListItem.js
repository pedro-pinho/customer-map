import React, { useState } from 'react';

function ListItem({ onChange, onDelete, onUndo, userName, name, address, date, isOwner, enabled }) {
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

    return (
        <div class="card mt-3" style={{ width: '18rem' }}>
            <div class="card-body">
                <h5 class="card-title">
                    { editName ?
                    <input type="text" value={inputName} onInput={e => setInputName(e.target.value)} onKeyDown={handleKeyDown}/>
                    : <div onDoubleClick={() => isOwner ? setEditName(!editName) : null}>{inputName}</div>
                    }
                </h5>
                <p class="card-text">
                    { editAddress ?
                        <input type="text" value={inputAddress} onInput={e => setInputAddress(e.target.value)} onKeyDown={handleKeyDown}/>
                        : <div onDoubleClick={() => isOwner ? setEditAddress(!editAddress) : null}>{inputAddress}</div>
                    }
                </p>
                <p class="card-text">
                    <small class="text-muted">
                        {date}
                    </small>
                </p>
                { isOwner && inputEnabled ?
                    <div class="text-right">
                        <button class="btn btn-warning" onClick={handleInactive}>Delete</button>
                    </div>
                    : null
                }
                { isOwner && !inputEnabled ?
                    <div class="text-right">
                        <button class="btn btn-secondary" onClick={handleUndo}>Undo Delete</button>
                    </div>
                    : null
                }
            </div>
        </div>
    );
}

export default ListItem;