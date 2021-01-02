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
        <div className="Item-container">
            { editName ?
                <input type="text" value={inputName} onInput={e => setInputName(e.target.value)} onKeyDown={handleKeyDown}/>
                : <div onDoubleClick={() => isOwner ? setEditName(!editName) : null}>{inputName}</div>
            }
            { editAddress ?
                <input type="text" value={inputAddress} onInput={e => setInputAddress(e.target.value)} onKeyDown={handleKeyDown}/>
                : <div onDoubleClick={() => isOwner ? setEditAddress(!editAddress) : null}>{inputAddress}</div>
            }
            <div>{date}</div>
            { isOwner && inputEnabled ?
                <div>
                    <button onClick={handleInactive}>Delete</button>
                </div>
                : null
            }
            { isOwner && !inputEnabled ?
                <div>
                    <button onClick={handleUndo}>Undo Delete</button>
                </div>
                : null
            }
        </div>
    );
}

export default ListItem;