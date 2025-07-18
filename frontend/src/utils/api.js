const API_BASE_URL = 'http://localhost:8000/api/v1';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();

// Métodos específicos
export const percapitaApi = {
  getDashboard: () => api.get('/percapita/dashboard'),
  getUsuariosNuevos: () => api.get('/percapita/usuarios-nuevos'),
  getArchivos: () => api.get('/percapita/archivos-procesados'),
  previewFile: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetch(`${API_BASE_URL}/percapita/preview-csv`, {
      method: 'POST',
      body: formData,
    }).then(res => res.json());
  },
  createUsuario: (data) => api.post('/percapita/usuarios-nuevos', data),
  // Métodos agregados para dashboard
  getEstadisticasMes: async () => {
    const dashboard = await api.get('/percapita/dashboard');
    return dashboard.estadisticas_mes || {};
  },
  getAlertasSistema: async () => {
    const dashboard = await api.get('/percapita/dashboard');
    // Simulamos alertas si no existen en backend
    return dashboard.alertas_sistema || [
      { tipo: 'warning', mensaje: 'Corte de Mayo pendiente', tiempo: '2 días' },
      { tipo: 'info', mensaje: 'Backup programado esta noche', tiempo: '8 horas' },
      { tipo: 'success', mensaje: 'Sincronización completada', tiempo: '1 hora' }
    ];
  },
  // Nuevo método para cortes
  getCortes: async () => {
    const res = await api.get('/percapita/archivos-procesados');
    return res.archivos || [];
  }
};