import React from 'react';

const ListItem = ({ onChange, onDelete, name, address, date }) => {
    return (
        <li className="Item-container">
            <div>{name}</div>
            <div>{address}</div>
            <div>{date}</div>
            <button onClick={onDelete}>Editar</button>
            <button onClick={onDelete}>Excluir</button>
        </li>
    );
};

export default ListItem;