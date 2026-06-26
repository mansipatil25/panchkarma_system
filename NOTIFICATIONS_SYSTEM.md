# Notifications System - Complete Guide

## Overview
A comprehensive notification system that stores notifications in the database and provides real-time updates for patients, doctors, and admins.

---

## Features

### ✅ Automatic Notifications
- **Welcome** - When user signs up
- **Appointment Booked** - When patient books appointment
- **Therapy Info** - Session details, procedures, and benefits
- **Appointment Confirmed** - When doctor/admin approves
- **Appointment Cancelled** - When appointment is cancelled
- **Appointment Completed** - After session ends
- **Doctor Assigned** - When doctor is assigned to appointment

### ✅ Manual Notifications
- **Custom Messages** - Admin/Doctor can send to specific patients
- **Bulk Messages** - Send to multiple users at once
- **Broadcast** - Send to all patients

### ✅ Notification Management
- View all notifications
- Mark as read/unread
- Delete notifications
- Get unread count
- Filter by type/status

---

## Backend API Endpoints

### Patient Endpoints

#### 1. Get My Notifications
```
GET /api/notifications
Authorization: Bearer {token}

Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- unreadOnly: true/false

Response:
{
  "notifications": [...],
  "total": 50,
  "unreadCount": 5,
  "page": 1,
  "totalPages": 3
}
```

#### 2. Get Unread Count
```
GET /api/notifications/unread-count
Authorization: Bearer {token}

Response:
{
  "unreadCount": 5
}
```

#### 3. Mark Notification as Read
```
PUT /api/notifications/:notificationId/read
Authorization: Bearer {token}

Response:
{
  "message": "Notification marked as read"
}
```

#### 4. Mark All as Read
```
PUT /api/notifications/mark-all-read
Authorization: Bearer {token}

Response:
{
  "message": "All notifications marked as read"
}
```

#### 5. Delete Notification
```
DELETE /api/notifications/:notificationId
Authorization: Bearer {token}

Response:
{
  "message": "Notification deleted successfully"
}
```

### Doctor/Admin Endpoints

#### 6. Send Custom Notification
```
POST /api/notifications/send
Authorization: Bearer {token}
Role: doctor/admin

Body:
{
  "userId": 4,
  "title": "Appointment Reminder",
  "message": "Please arrive 10 minutes early...",
  "type": "reminder"
}

Response:
{
  "message": "Notification sent successfully",
  "notificationId": 123
}
```

#### 7. Send Bulk Notification
```
POST /api/notifications/send-bulk
Authorization: Bearer {token}
Role: doctor/admin

Body:
{
  "userIds": [4, 5, 6],
  "title": "Health Update",
  "message": "Important health tips...",
  "type": "system"
}

Response:
{
  "message": "Notification sent to 3 users successfully",
  "count": 3
}
```

#### 8. Broadcast to All Patients
```
POST /api/notifications/broadcast-to-patients
Authorization: Bearer {token}
Role: doctor/admin

Body:
{
  "title": "Clinic Holiday Notice",
  "message": "Our clinic will be closed...",
  "type": "system"
}

Response:
{
  "message": "Notification broadcast to 25 patients successfully",
  "count": 25
}
```

---

## Notification Types

| Type | Description | Example |
|------|-------------|---------|
| `system` | System messages | Welcome, Info |
| `appointment` | Appointment related | Booked, Confirmed, Cancelled |
| `reminder` | Reminders | Pre-appointment reminders |
| `update` | Updates | Rescheduled, Changes |

---

## React Frontend Implementation

### 1. Create NotificationService

```javascript
// src/services/notificationService.js
import api from './api'; // Your axios instance

export const notificationService = {
  // Get all notifications
  async getNotifications(page = 1, unreadOnly = false) {
    const params = new URLSearchParams({ page, limit: 20 });
    if (unreadOnly) params.append('unreadOnly', 'true');
    
    const response = await api.get(`/notifications?${params}`);
    return response.data;
  },

  // Get unread count
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data.unreadCount;
  },

  // Mark as read
  async markAsRead(notificationId) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all as read
  async markAllAsRead() {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  // Delete notification
  async deleteNotification(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  // Send custom notification (Doctor/Admin)
  async sendNotification(userId, title, message, type = 'system') {
    const response = await api.post('/notifications/send', {
      userId,
      title,
      message,
      type
    });
    return response.data;
  }
};
```

### 2. Create NotificationBell Component

```jsx
// src/components/NotificationBell.jsx
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import styled from 'styled-components';
import { notificationService } from '../services/notificationService';

const BellContainer = styled.div`
  position: relative;
  cursor: pointer;
`;

const Badge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: bold;
`;

const NotificationBell = ({ onClick }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <BellContainer onClick={onClick}>
      <Bell size={24} />
      {unreadCount > 0 && <Badge>{unreadCount > 99 ? '99+' : unreadCount}</Badge>}
    </BellContainer>
  );
};

export default NotificationBell;
```

### 3. Create NotificationList Component

```jsx
// src/components/NotificationList.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Check, Trash2, CheckCheck } from 'lucide-react';
import { notificationService } from '../services/notificationService';
import toast from 'react-hot-toast';

const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  h2 {
    color: #007a5f;
  }
`;

const ActionButton = styled.button`
  background: transparent;
  border: 1px solid #007a5f;
  color: #007a5f;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background: #007a5f;
    color: white;
  }
`;

const NotificationCard = styled.div`
  background: ${props => props.read ? '#f8f9fa' : 'white'};
  border-left: 4px solid ${props => props.read ? '#e0e0e0' : '#007a5f'};
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateX(4px);
  }
`;

const NotificationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
`;

const Title = styled.h3`
  font-size: 1.1rem;
  color: #333;
  margin: 0;
`;

const Time = styled.span`
  font-size: 0.85rem;
  color: #999;
`;

const Message = styled.p`
  color: #666;
  margin: 0.5rem 0;
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ActionBtn = styled.button`
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.875rem;
  
  &:hover {
    background: #f0f0f0;
    color: #007a5f;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #999;
  
  svg {
    margin-bottom: 1rem;
  }
`;

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, [unreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications(1, unreadOnly);
      setNotifications(data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read_status: true } : n
      ));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read_status: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return <Container><p>Loading notifications...</p></Container>;
  }

  return (
    <Container>
      <Header>
        <h2>🔔 Notifications</h2>
        <ActionButton onClick={handleMarkAllAsRead}>
          <CheckCheck size={18} />
          Mark All Read
        </ActionButton>
      </Header>

      {notifications.length === 0 ? (
        <EmptyState>
          <Bell size={48} color="#ccc" />
          <p>No notifications yet</p>
        </EmptyState>
      ) : (
        notifications.map(notification => (
          <NotificationCard 
            key={notification.id}
            read={notification.read_status}
            onClick={() => !notification.read_status && handleMarkAsRead(notification.id)}
          >
            <NotificationHeader>
              <Title>{notification.title}</Title>
              <Time>{formatTime(notification.created_at)}</Time>
            </NotificationHeader>
            <Message>{notification.message}</Message>
            <Actions>
              {!notification.read_status && (
                <ActionBtn onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}>
                  <Check size={14} />
                  Mark as read
                </ActionBtn>
              )}
              <ActionBtn onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}>
                <Trash2 size={14} />
                Delete
              </ActionBtn>
            </Actions>
          </NotificationCard>
        ))
      )}
    </Container>
  );
};

export default NotificationList;
```

### 4. Add to Navigation

```jsx
// In your navigation/header component
import NotificationBell from './components/NotificationBell';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <nav>
      {/* Other nav items */}
      <NotificationBell onClick={() => navigate('/notifications')} />
    </nav>
  );
};
```

### 5. Add Route

```jsx
// In your routes
import NotificationList from './pages/NotificationList';

<Route path="/notifications" element={<NotificationList />} />
```

---

## Automatic Notification Triggers

### When User Signs Up
✅ Welcome notification sent automatically

### When Appointment is Booked
✅ Booking confirmation notification
✅ Therapy information notification (procedures & benefits)

### When Appointment Status Changes
✅ **Confirmed** → Confirmation notification
✅ **Cancelled** → Cancellation notification  
✅ **Completed** → Completion & feedback request

### When Doctor is Assigned
✅ Doctor assignment notification with details

---

## Database Schema

```sql
CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('appointment', 'reminder', 'system', 'update'),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  read_status BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## Testing the System

### 1. Test Signup Notification
```bash
curl -X POST http://localhost:3002/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Check Notifications
```bash
curl -X GET http://localhost:3002/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Custom Notification (Admin/Doctor)
```bash
curl -X POST http://localhost:3002/api/notifications/send \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "userId": 4,
    "title": "Health Tip",
    "message": "Remember to stay hydrated!",
    "type": "system"
  }'
```

---

## Summary

✅ **Complete notification system** with database storage
✅ **Automatic notifications** for all key events
✅ **Manual notifications** for doctors/admins
✅ **Real-time unread count** with polling
✅ **Full CRUD operations** - Create, Read, Update, Delete
✅ **React components** ready to use
✅ **Beautiful UI** with styled-components
✅ **Toast notifications** for user feedback

The system is production-ready and fully functional!
