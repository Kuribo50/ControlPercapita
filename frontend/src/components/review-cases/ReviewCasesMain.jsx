import React, { useState, useEffect } from 'react';
import { percapitaApi } from '../../utils/api';
import { MdRefresh, MdSearch } from 'react-icons/md';
import ReviewCasesTable from './ReviewCasesTable';

export default function ReviewCasesMain() {
  const [cases, setCases]       = useState([]);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');

  const loadCases = async () => {
    setLoading(true);
    try {
      const { casos_revision = [] } = await percapitaApi.getCasosRevision();
      setCases(casos_revision);
    } catch (err) {
      console.error('Error cargando casos a revisar:', err);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    loadCases();
  }, []);

  // Filtrar por RUN o nombre
  const filtered = cases.filter(c => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.nombre?.toLowerCase().includes(q) ||
      c.run?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header + acciones */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
          <MdSearch className="h-6 w-6"/> Casos a Revisar
        </h1>
        <button
          onClick={loadCases}
          disabled={loading}
          className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          <MdRefresh className={loading ? 'animate-spin' : ''}/> {loading ? 'Cargando…' : 'Actualizar'}
        </button>
      </div>

      {/* Buscador */}
      <div className="w-full max-w-sm">
        <input
          type="text"
          placeholder="🔍 Buscar RUN o nombre…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Tabla */}
      <ReviewCasesTable cases={filtered} />
    </div>
  );
}
