import HttpClient from '@/helpers/httpClient';

const empresaService = {
  async obtenerPerfil(empresaId) {
    const res = await HttpClient.get(`/empresa/perfil?empresa_id=${empresaId}`);
    return res.data;
  },

  async actualizarPerfil(datos, empresaId) {
    const res = await HttpClient.patch(`/empresa/perfil?empresa_id=${empresaId}`, datos);
    return res.data;
  },
};

export default empresaService;
