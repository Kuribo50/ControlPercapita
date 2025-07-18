// src/components/new-users/NewUsersList.jsx
import React, { useState } from 'react';
import { percapitaApi } from '../../utils/api';

export default function NewUsersList({ users, loading, onReload }) {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all', // all, validated, pending, not_found
    sortBy: 'date_desc'
  });
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [revalidating, setRevalidating] = useState(false);

  // Filtrar usuarios
  const filteredUsers = users.filter(user => {
    // Filtro de búsqueda
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchName = user.nombre?.toLowerCase().includes(search);
      const matchRun = user.run?.toLowerCase().includes(search);
      if (!matchName && !matchRun) return false;
    }

    // Filtro de estado
    if (filters.status !== 'all') {
      if (filters.status === 'validated' && !user.estado_validacion?.encontrado_en_corte) return false;
      if (filters.status === 'not_found' && user.estado_validacion?.encontrado_en_corte) return false;
      if (filters.status === 'pending' && user.estado_validacion) return false;
    }

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'name_asc':
        return (a.nombre || '').localeCompare(b.nombre || '');
      case 'name_desc':
        return (b.nombre || '').localeCompare(a.nombre || '');
      case 'date_asc':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'date_desc':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const getStatusBadge = (user) => {
    if (!user.estado_validacion) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          🕒 Pendiente validación
        </span>
      );
    }

    if (user.estado_validacion.encontrado_en_corte) {
      const specialStatus = user.estado_validacion.detalles?.estado_especial;
      let icon = '✅';
      let bgColor = 'bg-green-100';
      let textColor = 'text-green-800';
      let statusText = 'Validado en FONASA';
      
      if (specialStatus === 'TRASLADO_NEGATIVO') {
        icon = '🔄';
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        statusText = 'Traslado Negativo';
      } else if (specialStatus === 'RECHAZADO_PREVISIONAL') {
        icon = '❌';
        bgColor = 'bg-red-100';
        textColor = 'text-red-800';
        statusText = 'Rechazado Previsional';
      } else if (specialStatus === 'NUEVO_INSCRITO') {
        icon = '✨';
        bgColor = 'bg-blue-100';
        textColor = 'text-blue-800';
        statusText = 'Nuevo Inscrito';
      }

      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
          {icon} {statusText}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        ❌ No encontrado
      </span>
    );
  };

  const getValidationDetails = (user) => {
    if (!user.estado_validacion?.detalles) return null;

    const details = user.estado_validacion.detalles;
    return (
      <div className="mt-2 text-xs text-gray-500">
        {details.centro_asignado && (
          <div>🏥 Centro: {details.centro_asignado}</div>
        )}
        {details.fecha_corte && (
          <div>📅 Corte: {new Date(details.fecha_corte).toLocaleDateString()}</div>
        )}
        {details.similitud_nombre && (
          <div>👤 Similitud nombre: {(details.similitud_nombre * 100).toFixed(1)}%</div>
        )}
      </div>
    );
  };

  const handleDelete = async (user) => {
    try {
      await percapitaApi.deleteUsuario(user.id);
      setShowDeleteModal(null);
      onReload();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error eliminando usuario');
    }
  };

  const handleRevalidateAll = async () => {
    try {
      setRevalidating(true);
      await percapitaApi.revalidarUsuarios();
      onReload();
      alert('✅ Revalidación completada exitosamente');
    } catch (error) {
      console.error('Error revalidating:', error);
      alert('❌ Error en la revalidación');
    } finally {
      setRevalidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
         <p className="mt-4 text-gray-600">Cargando usuarios...</p>
       </div>
     </div>
   );
 }

 return (
   <div>
     {/* Header con controles */}
     <div className="mb-6">
       <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
         <div>
           <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
             📋 Lista de Usuarios Registrados
           </h2>
           <p className="text-gray-600">
             {filteredUsers.length} de {users.length} usuarios
           </p>
         </div>
         
         <div className="flex flex-col sm:flex-row gap-3">
           <button
             onClick={onReload}
             disabled={loading}
             className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
           >
             🔄 Actualizar
           </button>
           
           <button
             onClick={handleRevalidateAll}
             disabled={revalidating || users.length === 0}
             className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
           >
             {revalidating ? (
               <>
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Revalidando...
               </>
             ) : (
               <>🔍 Revalidar contra FONASA</>
             )}
           </button>
         </div>
       </div>
     </div>

     {/* Filtros */}
     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {/* Búsqueda */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             🔍 Buscar
           </label>
           <input
             type="text"
             placeholder="Buscar por nombre o RUN..."
             value={filters.search}
             onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
           />
         </div>

         {/* Estado */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             📊 Estado
           </label>
           <select
             value={filters.status}
             onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
           >
             <option value="all">Todos los estados</option>
             <option value="validated">✅ Validados</option>
             <option value="pending">🕒 Pendientes</option>
             <option value="not_found">❌ No encontrados</option>
           </select>
         </div>

         {/* Ordenar */}
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             📋 Ordenar por
           </label>
           <select
             value={filters.sortBy}
             onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
           >
             <option value="date_desc">Fecha (más reciente)</option>
             <option value="date_asc">Fecha (más antiguo)</option>
             <option value="name_asc">Nombre (A-Z)</option>
             <option value="name_desc">Nombre (Z-A)</option>
           </select>
         </div>
       </div>
     </div>

     {/* Lista de usuarios */}
     {filteredUsers.length === 0 ? (
       <div className="text-center py-12">
         <div className="text-6xl mb-4">📋</div>
         <h3 className="text-lg font-medium text-gray-900 mb-2">
           {users.length === 0 ? 'No hay usuarios registrados' : 'No se encontraron usuarios'}
         </h3>
         <p className="text-gray-500">
           {users.length === 0 
             ? 'Comience registrando el primer usuario nuevo'
             : 'Intente cambiar los filtros de búsqueda'
           }
         </p>
       </div>
     ) : (
       <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
         <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Usuario
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Información
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Estado Validación
                 </th>
                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Fecha Registro
                 </th>
                 <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                   Acciones
                 </th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
               {filteredUsers.map((user) => (
                 <tr key={user.id} className="hover:bg-gray-50">
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="flex items-center">
                       <div className="flex-shrink-0 h-10 w-10">
                         <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                           <span className="text-sm font-medium text-blue-800">
                             {user.nombre?.charAt(0)?.toUpperCase() || '?'}
                           </span>
                         </div>
                       </div>
                       <div className="ml-4">
                         <div className="text-sm font-medium text-gray-900">
                           {user.nombre}
                         </div>
                         <div className="text-sm text-gray-500">
                           RUN: {user.run}
                         </div>
                       </div>
                     </div>
                   </td>
                   
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div className="text-sm text-gray-900">
                       <div>🌍 {user.nacionalidad}</div>
                       <div>📍 {user.sector}</div>
                       <div>🔢 {user.cod_percapita}</div>
                     </div>
                   </td>
                   
                   <td className="px-6 py-4 whitespace-nowrap">
                     <div>
                       {getStatusBadge(user)}
                       {getValidationDetails(user)}
                     </div>
                   </td>
                   
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                     <div>
                       📅 {new Date(user.fecha).toLocaleDateString()}
                     </div>
                     <div className="text-xs text-gray-400">
                       Creado: {new Date(user.created_at).toLocaleDateString()}
                     </div>
                   </td>
                   
                   <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                     <div className="flex justify-end space-x-2">
                       <button
                         onClick={() => {
                           // Aquí podrías agregar funcionalidad de edición
                           console.log('Edit user:', user);
                         }}
                         className="text-blue-600 hover:text-blue-900"
                         title="Editar usuario"
                       >
                         ✏️
                       </button>
                       
                       <button
                         onClick={() => setShowDeleteModal(user)}
                         className="text-red-600 hover:text-red-900"
                         title="Eliminar usuario"
                       >
                         🗑️
                       </button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
       </div>
     )}

     {/* Modal de confirmación de eliminación */}
     {showDeleteModal && (
       <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
         <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
           <div className="mt-3 text-center">
             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
               <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5C2.962 18.333 3.924 20 5.464 20z"></path>
               </svg>
             </div>
             <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">
               Confirmar Eliminación
             </h3>
             <div className="mt-2 px-7 py-3">
               <p className="text-sm text-gray-500">
                 ¿Está seguro que desea eliminar al usuario <strong>{showDeleteModal.nombre}</strong>?
               </p>
               <p className="text-xs text-gray-400 mt-1">
                 Esta acción no se puede deshacer.
               </p>
             </div>
             <div className="items-center px-4 py-3">
               <div className="flex space-x-3">
                 <button
                   onClick={() => setShowDeleteModal(null)}
                   className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300"
                 >
                   Cancelar
                 </button>
                 <button
                   onClick={() => handleDelete(showDeleteModal)}
                   className="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                 >
                   Eliminar
                 </button>
               </div>
             </div>
           </div>
         </div>
       </div>
     )}
   </div>
 );
}