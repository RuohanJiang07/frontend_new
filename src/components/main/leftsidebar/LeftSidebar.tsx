import React from 'react';
import { FolderKanban, Users, GraduationCap, Settings, CreditCard, UserCircle } from 'lucide-react';
import './LeftSidebar.css';

function LeftSidebar() {
  return (
    <nav className="sidebar">
      <div className="user-info">
        <div className="user-avatar">
          <UserCircle size={32} />
        </div>
        <div className="user-details">
          <div className="user-name">Sample User</div>
          <div className="user-email">new@hyperknow.io</div>
        </div>
      </div>
      
      <ul className="nav-items">
        <li className="nav-item active">
          <FolderKanban size={20} />
          <span>My Workspace</span>
        </li>
        <li className="nav-item">
          <Users size={20} />
          <span>Community</span>
        </li>
        <li className="nav-item">
          <GraduationCap size={20} />
          <span>Tutorials</span>
        </li>
      </ul>

      <div className="bottom-nav">
        <div className="nav-item">
          <Settings size={20} />
          <span>Settings</span>
        </div>
        <div className="nav-item">
          <CreditCard size={20} />
          <span>Subscription</span>
        </div>
        <div className="nav-item">
          <UserCircle size={20} />
          <span>Account Settings</span>
        </div>
      </div>
    </nav>
  );
}

export default LeftSidebar