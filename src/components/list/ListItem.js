import React from 'react';

const ListItem = ({ onChange, onDelete, name, address, date }) => {
    return (
        <div className="Item-container">
            <input
                className="Item-field"
                value={name}
                onChange={onChange}
            />
            <input
                className="Item-field"
                value={address}
                onChange={onChange}
            />
            <input
                className="Item-field"
                value={date}
                onChange={onChange}
            />
            <button onClick={onDelete}>Editar</button>
            <button onClick={onDelete}>Excluir</button>
        </div>
    );
};

export default ListItem;