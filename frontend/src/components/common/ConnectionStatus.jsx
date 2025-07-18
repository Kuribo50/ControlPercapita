import React, { useState, useEffect } from 'react';

export default function ConnectionStatus() {
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      if (response.ok) {
        setStatus('connected');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('disconnected');
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case 'connected':
        return { icon: '🟢', text: 'Conectado', color: '#10b981' };
      case 'disconnected':
        return { icon: '🔴', text: 'Desconectado', color: '#ef4444' };
      case 'error':
        return { icon: '🟡', text: 'Error', color: '#f59e0b' };
      default:
        return { icon: '⚪', text: 'Verificando...', color: '#6b7280' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div style={{
      position: 'fixed',
      bottom: '1rem',
      right: '1rem',
      background: 'white',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: '0.875rem',
      zIndex: 1000
    }}>
      <span>{statusInfo.icon}</span>
      <span style={{ color: statusInfo.color, fontWeight: '500' }}>
        Backend: {statusInfo.text}
      </span>
    </div>
  );
}