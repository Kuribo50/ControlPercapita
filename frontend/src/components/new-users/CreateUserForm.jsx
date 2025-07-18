// src/components/new-users/CreateUserForm.jsx
import React, { useState } from 'react';
import Select from 'react-select';
import { percapitaApi } from '../../utils/api';
import {
  MdDateRange, MdPermIdentity, MdPerson, MdPublic,
  MdGroup, MdLocationOn, MdSubdirectoryArrowRight,
  MdConfirmationNumber, MdCheckCircle, MdLocalHospital,
  MdNote, MdRefresh, MdErrorOutline,
} from 'react-icons/md';
import { NACIONALIDADES, ETNIAS, SECTORES, ESTABLECIMIENTOS } from '../../utils/constants';

const initialState = {
  fecha: new Date().toISOString().slice(0, 10),
  run: '', nombre: '',
  nacionalidad: 'Chile', etnia: '99 Ninguna',
  sector: '', subsector: '',
  cod_percapita: '', validado_en_siis: 'NO',
  establecimiento: 'CESAFAM DR. ALBERTO REYES', observacion: ''
};

export default function CreateUserForm({ onUserCreated }) {
  const [formData, setFormData]   = useState(initialState);
  const [loading, setLoading]     = useState(false);
  const [errors, setErrors]       = useState({});

  const handleChange = (name, value) => {
    setFormData(fd => ({ ...fd, [name]: value }));
    setErrors(e => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!/^\d{7,8}-[0-9kK]$/.test(formData.run)) e.run = 'RUN inválido';
    if (!formData.nombre.trim()) e.nombre = 'Nombre requerido';
    if (!formData.sector) e.sector = 'Sector requerido';
    if (!formData.cod_percapita.trim()) e.cod_percapita = 'Código requerido';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async ev => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      setLoading(true);
      await percapitaApi.createUsuario(formData);
      onUserCreated();
      setFormData(initialState);
    } catch {
      setErrors({ submit: 'Error al crear usuario' });
    } finally {
      setLoading(false);
    }
  };

  const makeOptions = arr => arr.map(v => ({ value: v, label: v }));

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-6">
      {errors.submit && (
        <div className="w-full p-4 bg-red-50 text-red-700 rounded flex items-center gap-2">
          <MdErrorOutline/> {errors.submit}
        </div>
      )}

      {/* Fecha */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-1 flex items-center gap-1">
          <MdDateRange/> Fecha *
        </label>
        <input
          type="date"
          value={formData.fecha}
          onChange={e => handleChange('fecha', e.target.value)}
          className="w-full border rounded px-3 py-2 focus:ring-blue-500"
        />
      </div>

      {/* RUN */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-1 flex items-center gap-1">
          <MdPermIdentity/> RUN *
        </label>
        <input
          type="text"
          value={formData.run}
          onChange={e => handleChange('run', e.target.value)}
          className={`w-full border rounded px-3 py-2 focus:ring-blue-500 ${errors.run ? 'border-red-500' : ''}`}
        />
        {errors.run && <p className="text-red-600 text-xs mt-1">{errors.run}</p>}
      </div>

      {/* Nombre */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-1 flex items-center gap-1">
          <MdPerson/> Nombre *
        </label>
        <input
          type="text"
          value={formData.nombre}
          onChange={e => handleChange('nombre', e.target.value)}
          className={`w-full border rounded px-3 py-2 focus:ring-blue-500 ${errors.nombre ? 'border-red-500' : ''}`}
        />
        {errors.nombre && <p className="text-red-600 text-xs mt-1">{errors.nombre}</p>}
      </div>

      {/* Nacionalidad */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-1 flex items-center gap-1">
          <MdPublic/> Nacionalidad
        </label>
        <Select
          options={makeOptions(NACIONALIDADES)}
          value={{ value: formData.nacionalidad, label: formData.nacionalidad }}
          onChange={opt => handleChange('nacionalidad', opt.value)}
          classNamePrefix="react-select"
        />
      </div>

      {/* Etnia */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-1 flex items-center gap-1">
          <MdGroup/> Etnia
        </label>
        <Select
          options={makeOptions(ETNIAS)}
          value={{ value: formData.etnia, label: formData.etnia }}
          onChange={opt => handleChange('etnia', opt.value)}
          classNamePrefix="react-select"
        />
      </div>

      {/* Sector */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-1 flex items-center gap-1">
          <MdLocationOn/> Sector *
        </label>
        <Select
          options={makeOptions(SECTORES)}
          value={formData.sector ? { value: formData.sector, label: formData.sector } : null}
          onChange={opt => handleChange('sector', opt.value)}
          classNamePrefix="react-select"
        />
        {errors.sector && <p className="text-red-600 text-xs mt-1">{errors.sector}</p>}
      </div>

      {/* Subsector */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-1 flex items-center gap-1">
          <MdSubdirectoryArrowRight/> Subsector
        </label>
        <input
          type="text"
          value={formData.subsector}
          onChange={e => handleChange('subsector', e.target.value)}
          className="w-full border rounded px-3 py-2 focus:ring-blue-500"
          placeholder="Opcional"
        />
      </div>

      {/* Código Percápita */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-1 flex items-center gap-1">
          <MdConfirmationNumber/> Código Percápita *
        </label>
        <input
          type="text"
          value={formData.cod_percapita}
          onChange={e => handleChange('cod_percapita', e.target.value)}
          className={`w-full border rounded px-3 py-2 focus:ring-blue-500 ${errors.cod_percapita ? 'border-red-500' : ''}`}
        />
        {errors.cod_percapita && <p className="text-red-600 text-xs mt-1">{errors.cod_percapita}</p>}
      </div>

      {/* Validado en SIIS */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-1 flex items-center gap-1">
          <MdCheckCircle/> Validado en SIIS
        </label>
        <Select
          options={[{ value: 'SI', label: 'SI' }, { value: 'NO', label: 'NO' }]}
          value={{ value: formData.validado_en_siis, label: formData.validado_en_siis }}
          onChange={o => handleChange('validado_en_siis', o.value)}
          classNamePrefix="react-select"
          isSearchable={false}
        />
      </div>

      {/* Establecimiento */}
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm font-medium mb-1 flex items-center gap-1">
          <MdLocalHospital/> Establecimiento
        </label>
        <Select
          options={makeOptions(ESTABLECIMIENTOS)}
          value={{ value: formData.establecimiento, label: formData.establecimiento }}
          onChange={o => handleChange('establecimiento', o.value)}
          classNamePrefix="react-select"
        />
      </div>

      {/* Observación */}
      <div className="w-full">
        <label className="text-sm font-medium mb-1 flex items-center gap-1">
          <MdNote/> Observación
        </label>
        <textarea
          rows={2}
          value={formData.observacion}
          onChange={e => handleChange('observacion', e.target.value)}
          className="w-full border rounded px-3 py-2 focus:ring-blue-500"
        />
      </div>

      {/* Botones */}
      <div className="w-full flex justify-end gap-4 mt-4">
        <button
          type="button"
          onClick={() => setFormData(initialState)}
          className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-1"
        >
          <MdErrorOutline/> Limpiar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
        >
          {loading ? <MdRefresh className="animate-spin"/> : <><MdCheckCircle/> Registrar</>}
        </button>
      </div>
    </form>
  );
}
