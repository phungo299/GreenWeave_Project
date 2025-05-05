import React from 'react';
import PersonalSidebar from '../personalsidebar/PersonalSidebar';
import './PersonalLayout.css';

const PersonalLayout = ({ children }) => {
    return (
        <div className="personal-layout-container">
            <div className="personal-layout-header">
                <h1 className="personal-layout-title">Cá nhân</h1>
            </div>
            <div className="personal-layout-content">
                <div className="personal-layout-sidebar">
                    <PersonalSidebar />
                </div>
                <div className="personal-layout-main">
                    {children}
                </div>
            </div>
        </div>
    );
};
export default PersonalLayout;