import React from 'react';
import Row from './Row';

const Table = ({ dispatch, state, users, isOwner }) => {
    let rows = [];
    if (users) {
        rows = users.map((elem, i) => {
            const name = elem.Attributes.filter(data => data.Name === 'name');
            const lastName = elem.Attributes.filter(data => data.Name === 'family_name');
            const address = elem.Attributes.filter(data => data.Name === 'address');

            let date = new Date(elem.UserCreateDate);
            if (!date) {
                date = new Date();
            }
            date = new Intl.DateTimeFormat('pt-BR').format(date);

            return (
                <Row
                    userName={elem.Username}
                    name={name[0]?.Value + ' ' + lastName[0]?.Value}
                    address={address[0]?.Value}
                    date={date}
                    key={i}
                    enabled={elem.Enabled}
                    isOwner={isOwner}
                    dispatch={dispatch}
                    state={state}
                />
            );
        });
    }

    return (<div className="container">
        <div className="row">
            <div className="col">
                <div className="table-wrapper">
                    <table className="table-responsive card-list-table">
                        <thead>
                            <tr>
                                <th scope="col">Name</th>
                                <th scope="col">Address</th>
                                <th scope="col">Date Creation</th>
                                <th scope="col"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>);

};

export default Table;