// src/components/usuarios/UsuarioForm.tsx
"use client";

import { useState, useEffect } from 'react';
import { MdClose, MdSave, MdDelete } from 'react-icons/md';

interface Usuario {
  id?: string;
  run: string;
  dv: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  genero: string;
  tramo: string;
  aceptado_rechazado: string;
  motivo: string;
}

interface UsuarioFormProps {
  usuario?: Usuario;
  isOpen: boolean;
  onClose: () => void;
  onSave: (usuario: Usuario) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

// src/components/usuarios/UsuarioForm.tsx (continuación)
export function UsuarioForm({ usuario, isOpen, onClose, onSave, onDelete }: UsuarioFormProps) {
    const [formData, setFormData] = useState<Usuario>({
      run: '',
      dv: '',
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: '',
      genero: '',
      tramo: '',
      aceptado_rechazado: '',
      motivo: ''
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
   
    useEffect(() => {
      if (usuario) {
        setFormData(usuario);
      } else {
        // Reset form for new user
        setFormData({
          run: '',
          dv: '',
          nombres: '',
          apellido_paterno: '',
          apellido_materno: '',
          fecha_nacimiento: '',
          genero: '',
          tramo: '',
          aceptado_rechazado: '',
          motivo: ''
        });
      }
    }, [usuario]);
   
    const validateForm = () => {
      const newErrors: { [key: string]: string } = {};
      
      if (!formData.run.trim()) newErrors.run = 'RUN es requerido';
      if (!formData.dv.trim()) newErrors.dv = 'DV es requerido';
      if (!formData.nombres.trim()) newErrors.nombres = 'Nombres son requeridos';
      if (!formData.apellido_paterno.trim()) newErrors.apellido_paterno = 'Apellido paterno es requerido';
      if (!formData.fecha_nacimiento) newErrors.fecha_nacimiento = 'Fecha de nacimiento es requerida';
      if (!formData.genero) newErrors.genero = 'Género es requerido';
      if (!formData.tramo) newErrors.tramo = 'Tramo es requerido';
      
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
   
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateForm()) return;
      
      setLoading(true);
      try {
        await onSave(formData);
        onClose();
      } catch (error) {
        console.error('Error guardando usuario:', error);
      } finally {
        setLoading(false);
      }
    };
   
    const handleDelete = async () => {
      if (!usuario?.id || !onDelete) return;
      
      if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;
      
      setLoading(true);
      try {
        await onDelete(usuario.id);
        onClose();
      } catch (error) {
        console.error('Error eliminando usuario:', error);
      } finally {
        setLoading(false);
      }
    };
   
    if (!isOpen) return null;
   
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {usuario ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MdClose className="w-5 h-5" />
            </button>
          </div>
   
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* RUN y DV */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  RUN *
                </label>
                <input
                  type="text"
                  value={formData.run}
                  onChange={(e) => setFormData({ ...formData, run: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.run ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="12345678"
                />
                {errors.run && <p className="mt-1 text-sm text-red-600">{errors.run}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  DV *
                </label>
                <input
                  type="text"
                  value={formData.dv}
                  onChange={(e) => setFormData({ ...formData, dv: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.dv ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="9"
                  maxLength={1}
                />
                {errors.dv && <p className="mt-1 text-sm text-red-600">{errors.dv}</p>}
              </div>
            </div>
   
            {/* Nombres */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombres *
              </label>
              <input
                type="text"
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombres ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Juan Carlos"
              />
              {errors.nombres && <p className="mt-1 text-sm text-red-600">{errors.nombres}</p>}
            </div>
   
            {/* Apellidos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido Paterno *
                </label>
                <input
                  type="text"
                  value={formData.apellido_paterno}
                  onChange={(e) => setFormData({ ...formData, apellido_paterno: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.apellido_paterno ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="González"
                />
                {errors.apellido_paterno && <p className="mt-1 text-sm text-red-600">{errors.apellido_paterno}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido Materno
                </label>
                <input
                  type="text"
                  value={formData.apellido_materno}
                  onChange={(e) => setFormData({ ...formData, apellido_materno: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="López"
                />
              </div>
            </div>
   
            {/* Fecha nacimiento y Género */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fecha_nacimiento ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.fecha_nacimiento && <p className="mt-1 text-sm text-red-600">{errors.fecha_nacimiento}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género *
                </label>
                <select
                  value={formData.genero}
                  onChange={(e) => setFormData({ ...formData, genero: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.genero ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
                {errors.genero && <p className="mt-1 text-sm text-red-600">{errors.genero}</p>}
              </div>
            </div>
   
            {/* Tramo y Estado */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tramo FONASA *
                </label>
                <select
                  value={formData.tramo}
                  onChange={(e) => setFormData({ ...formData, tramo: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.tramo ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar tramo</option>
                  <option value="A">Tramo A</option>
                  <option value="B">Tramo B</option>
                  <option value="C">Tramo C</option>
                  <option value="D">Tramo D</option>
                </select>
                {errors.tramo && <p className="mt-1 text-sm text-red-600">{errors.tramo}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.aceptado_rechazado}
                  onChange={(e) => setFormData({ ...formData, aceptado_rechazado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar estado</option>
                  <option value="aceptado">Aceptado</option>
                  <option value="rechazado">Rechazado</option>
                  <option value="pendiente">Pendiente</option>
                </select>
              </div>
            </div>
   
            {/* Motivo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo
              </label>
              <textarea
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción del motivo..."
              />
            </div>
   
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center pt-6 space-y-3 sm:space-y-0">
              {usuario?.id && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <MdDelete className="w-4 h-4" />
                  <span>Eliminar Usuario</span>
                </button>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <MdSave className="w-4 h-4" />
                  <span>{loading ? 'Guardando...' : 'Guardar'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
   }