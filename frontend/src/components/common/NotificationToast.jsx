import React, { useState, useEffect } from 'react';

let notifications = [];
let listeners = [];

export const showNotification = (message, type = 'success', duration = 5000) => {
  const id = Date.now() + Math.random();
  const notification = { id, message, type, duration };
  
  notifications.push(notification);
  listeners.forEach(listener => listener([...notifications]));

  // Auto remove
  setTimeout(() => {
    removeNotification(id);
  }, duration);
};

export const removeNotification = (id) => {
  notifications = notifications.filter(n => n.id !== id);
  listeners.forEach(listener => listener([...notifications]));
};

export default function NotificationToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter(l => l !== setToasts);
    };
  }, []);

  const getToastStyle = (type) => {
    const baseStyle = {
      padding: '1rem',
      borderRadius: '0.5rem',
      marginBottom: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      animation: 'slideIn 0.3s ease-out'
    };

    switch (type) {
      case 'success':
        return { ...baseStyle, background: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' };
      case 'error':
        return { ...baseStyle, background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5' };
      case 'warning':
        return { ...baseStyle, background: '#fffbeb', color: '#92400e', border: '1px solid #fcd34d' };
      case 'info':
        return { ...baseStyle, background: '#eff6ff', color: '#1e40af', border: '1px solid #93c5fd' };
      default:
        return { ...baseStyle, background: '#f9fafb', color: '#374151', border: '1px solid #d1d5db' };
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📝';
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: 10000,
      maxWidth: '400px',
      width: '100%'
    }}>
      <style>
        {`
          @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        `}
      </style>
      {toasts.map(toast => (
        <div key={toast.id} style={getToastStyle(toast.type)}>
          <span style={{ fontSize: '1.25rem' }}>{getIcon(toast.type)}</span>
          <span style={{ flex: 1, fontWeight: '500' }}>{toast.message}</span>
          <button
            onClick={() => removeNotification(toast.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              opacity: 0.7,
              padding: 0
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}