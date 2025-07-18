// src/components/new-users/NewUsersMain.jsx
import React, { useState, useEffect } from 'react';
import HeaderStats       from './HeaderStats';
import TabNav            from './TabNav';
import CreateUserForm    from './CreateUserForm';
import UsersTable        from './UsersTable';
import NewUsersAnalytics from './NewUsersAnalytics';
import { percapitaApi }  from '../../utils/api';
import {
  MdPersonAdd,
  MdList,
  MdAssessment
} from 'react-icons/md';

export default function NewUsersMain() {
  const [activeTab, setActiveTab] = useState('create');
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(false);
  const [stats, setStats]         = useState({ total:0, validated:0, pending:0, not_found:0 });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { usuarios=[] } = await percapitaApi.getUsuariosNuevos();
      setUsers(usuarios);
      const total     = usuarios.length;
      const validated = usuarios.filter(u=>u.estado_validacion?.encontrado_en_corte).length;
      const pending   = usuarios.filter(u=>!u.estado_validacion).length;
      const not_found = usuarios.filter(u=>u.estado_validacion && !u.estado_validacion.encontrado_en_corte).length;
      setStats({ total, validated, pending, not_found });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (activeTab!=='create') loadUsers(); }, [activeTab]);

  const tabs = [
    { id:'create',    name:'Crear Usuario', icon:<MdPersonAdd/>, description:'Registrar nuevo' },
    { id:'list',      name:'Lista',          icon:<MdList/>,      description:`${stats.total} usuarios`, badge: stats.pending>0?stats.pending:null },
    { id:'analytics', name:'Análisis',       icon:<MdAssessment/>,description:'Estadísticas y gráficos' }
  ];

  const handleCreated = () => {
    setActiveTab('list');
    loadUsers();
  };

  return (
    <div>
      <HeaderStats stats={stats}/>
      <TabNav tabs={tabs} activeTab={activeTab} onChange={setActiveTab}/>

      {activeTab==='create' && <CreateUserForm onUserCreated={handleCreated}/>}
      {activeTab==='list'   && <UsersTable users={users} loading={loading} onReload={loadUsers}/>}
      {activeTab==='analytics' && <NewUsersAnalytics users={users} stats={stats} loading={loading}/>}
    </div>
  );
}
