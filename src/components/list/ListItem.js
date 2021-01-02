import React, { useState } from 'react';

function ListItem({ onChange, onDelete, userName, name, address, date, isOwner }) {
    const [editName, setEditName] = useState(0);
    const [editAddress, setEditAddress] = useState(0);

    const [inputName, setInputName] = useState(name);
    const [inputAddress, setInputAddress] = useState(address);

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

    const handleInactive = () => {
        onDelete(userName);
    }

    return (
        <div className="Item-container">
            { editName ? <input type="text" value={inputName} onInput={e => setInputName(e.target.value)} onKeyDown={handleKeyDown}/> : <div onDoubleClick={() => isOwner ? setEditName(!editName) : null}>{inputName}</div> }
            { editAddress ? <input type="text" value={inputAddress} onInput={e => setInputAddress(e.target.value)} onKeyDown={handleKeyDown}/> : <div onDoubleClick={() => isOwner ? setEditAddress(!editAddress) : null}>{inputAddress}</div>}
            <div>{date}</div>
            { isOwner ?
                <div>
                    <button onClick={handleInactive}>Excluir</button>
                </div>
                : ''
            }
        </div>
    );
}

export default ListItem;