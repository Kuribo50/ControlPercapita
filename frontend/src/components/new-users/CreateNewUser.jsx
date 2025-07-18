// src/components/new-users/CreateNewUser.jsx
import React, { useState } from 'react';
import { percapitaApi } from '../../utils/api';
import {
  MdPersonAdd,
  MdDateRange,
  MdPermIdentity,
  MdPerson,
  MdPublic,
  MdGroup,
  MdLocationOn,
  MdSubdirectoryArrowRight,
  MdConfirmationNumber,
  MdCheckCircle,
  MdLocalHospital,
  MdNote,
  MdErrorOutline,
  MdWarning,
} from 'react-icons/md';

import { NACIONALIDADES, ETNIAS, SECTORES, ESTABLECIMIENTOS } from '../../utils/constants';

export default function CreateNewUser({ onUserCreated }) {
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    run: '',
    nombre: '',
    nacionalidad: 'Chile',
    etnia: '99 Ninguna',
    sector: '',
    subsector: '',
    cod_percapita: '',
    validado_en_siis: 'NO',
    establecimiento: 'CESAFAM DR. ALBERTO REYES',
    observacion: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(fd => ({ ...fd, [name]: value }));
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }));
  };

  const validateRun = run => /^\d{7,8}-[0-9kK]$/.test(run);

  const validateForm = () => {
    const e = {};
    if (!formData.run) e.run = 'RUN es requerido';
    else if (!validateRun(formData.run)) e.run = 'Formato RUN inválido';
    if (!formData.nombre) e.nombre = 'Nombre es requerido';
    if (!formData.cod_percapita) e.cod_percapita = 'Código es requerido';
    if (!formData.sector) e.sector = 'Sector es requerido';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      setErrors({});
      setSuccessMessage('');
      await percapitaApi.createUsuario(formData);
      setSuccessMessage(`Usuario ${formData.nombre} registrado ✅`);
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        run: '',
        nombre: '',
        nacionalidad: 'Chile',
        etnia: '99 Ninguna',
        sector: '',
        subsector: '',
        cod_percapita: '',
        validado_en_siis: 'NO',
        establecimiento: 'CESAFAM DR. ALBERTO REYES',
        observacion: ''
      });
      onUserCreated?.();
    } catch {
      setErrors({ submit: 'Error al registrar usuario.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fecha: new Date().toISOString().split('T')[0],
      run: '',
      nombre: '',
      nacionalidad: 'Chile',
      etnia: '99 Ninguna',
      sector: '',
      subsector: '',
      cod_percapita: '',
      validado_en_siis: 'NO',
      establecimiento: 'CESAFAM DR. ALBERTO REYES',
      observacion: ''
    });
    setErrors({});
    setSuccessMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-gray-900">
          <MdPersonAdd className="h-6 w-6 text-blue-600"/> Registrar Nuevo Usuario
        </h2>
        <p className="text-gray-600">
          Complete la información del usuario que no aparece en el corte FONASA
        </p>
      </div>

      {/* Success / Error */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <MdCheckCircle className="h-5 w-5 text-green-500"/>
          <span className="text-green-800">{successMessage}</span>
        </div>
      )}
      {errors.submit && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <MdErrorOutline className="h-5 w-5 text-red-500"/>
          <span className="text-red-800">{errors.submit}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Información del Usuario</h3>
          <p className="text-sm text-gray-500">* campos obligatorios</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Fecha */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MdDateRange/> Fecha de Registro *
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* RUN */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MdPermIdentity/> RUN *
            </label>
            <input
              type="text"
              name="run"
              value={formData.run}
              onChange={handleChange}
              placeholder="12345678-9"
              className={`w-full px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.run ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.run && (
              <p className="mt-1 text-red-600 flex items-center gap-1 text-sm">
                <MdWarning/> {errors.run}
              </p>
            )}
          </div>

          {/* Nombre */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MdPerson/> Nombre Completo *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre completo"
              className={`w-full px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.nombre ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.nombre && (
              <p className="mt-1 text-red-600 flex items-center gap-1 text-sm">
                <MdWarning/> {errors.nombre}
              </p>
            )}
          </div>

          {/* Nacionalidad */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MdPublic/> Nacionalidad
            </label>
            <select
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {NACIONALIDADES.map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          {/* Etnia */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MdGroup/> Etnia
            </label>
            <select
              name="etnia"
              value={formData.etnia}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ETNIAS.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MdLocationOn/> Sector *
            </label>
            <select
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              className={`w-full px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.sector ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Seleccionar sector</option>
              {SECTORES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.sector && (
              <p className="mt-1 text-red-600 flex items-center gap-1 text-sm">
                <MdWarning/> {errors.sector}
              </p>
            )}
          </div>

          {/* Subsector */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MdSubdirectoryArrowRight/> Subsector
            </label>
            <input
              type="text"
              name="subsector"
              value={formData.subsector}
              onChange={handleChange}
              placeholder="Opcional"
              className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Código Percápita */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MdConfirmationNumber/> Código Percápita *
            </label>
            <input
              type="text"
              name="cod_percapita"
              value={formData.cod_percapita}
              onChange={handleChange}
              placeholder="Código"
              className={`w-full px-3 py-2 rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                errors.cod_percapita ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.cod_percapita && (
              <p className="mt-1 text-red-600 flex items-center gap-1 text-sm">
                <MdWarning/> {errors.cod_percapita}
              </p>
            )}
          </div>

          {/* Validado en SIIS */}
          <div>
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MdCheckCircle/> Validado en SIIS
            </label>
            <select
              name="validado_en_siis"
              value={formData.validado_en_siis}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="SI">SI</option>
              <option value="NO">NO</option>
            </select>
          </div>

          {/* Establecimiento */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MdLocalHospital/> Establecimiento
            </label>
            <select
              name="establecimiento"
              value={formData.establecimiento}
              onChange={handleChange}
              className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ESTABLECIMIENTOS.map(e => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          {/* Observación */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
              <MdNote/> Observación
            </label>
            <textarea
              name="observacion"
              value={formData.observacion}
              onChange={handleChange}
              rows={3}
              placeholder="Opcional"
              className="w-full border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </form>

        {/* Botones */}
        <div className="px-6 py-4 flex justify-end gap-3">
          <button
            onClick={resetForm}
            className="flex items-center gap-1 px-6 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            <MdWarning/> Limpiar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading
              ? <MdDateRange className="animate-spin"/>
              : <><MdPersonAdd/> Registrar Usuario</>
            }
          </button>
        </div>
      </div>
    </div>
);
}
