import React from 'react';

const ListItem = ({ onChange, onDelete, name, address, date }) => {
    return (
        <div className="Item-container">
            <div>{name}</div>
            <div>{address}</div>
            <div>{date}</div>
            <button onClick={onChange}>Editar</button>
            <button onClick={onDelete}>Excluir</button>
        </div>
    );
};

export default ListItem;