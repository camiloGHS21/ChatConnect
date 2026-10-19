import HttpClient from '@/helpers/httpClient';

const consecutivoService = {
  async listar(empresaId) {
    const res = await HttpClient.get(`/consecutivos?empresa_id=${empresaId}`);
    return res.data;
  },

  async actualizar(id, datos, empresaId) {
    const res = await HttpClient.patch(`/consecutivos/${id}?empresa_id=${empresaId}`, datos);
    return res.data;
  },
};

export default consecutivoService;
