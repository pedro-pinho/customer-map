import { AmplifySignOut } from '@aws-amplify/ui-react';
import React from 'react';

const Navbar = () => (
    <nav className="navbar navbar-light bg-light">
        <span className="navbar-brand mb-0 h1">LawnGuru Code Challenge</span>
        <AmplifySignOut />
    </nav>
);
export default Navbar;