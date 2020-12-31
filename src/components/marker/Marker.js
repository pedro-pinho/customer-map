import React from 'react'
import { Icon } from '@iconify/react'
import locationIcon from '@iconify/icons-mdi/map-marker'
import './marker.css'

const Marker = ({ title }) => (
    <div className="marker">
        <Icon icon={locationIcon} className="marker-icon" />
        <p className="marker-text">{title}</p>
    </div>
    
);

export default Marker;