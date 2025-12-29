 
  

  import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_URL;

// Cria uma instância do Axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição (Para injetar o Token automaticamente)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Ou onde você guarda o token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de Resposta (Para pegar o erro 403 dos Termos)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // LÓGICA DO REDIRECIONAMENTO DOS TERMOS
      if (status === 403 && data?.type === 'TERMS_NOT_ACCEPTED') {
        
        // 1. Pega a URL que o backend mandou (https://termo.kronossolutions.tech/)
        const redirectBaseUrl = data.redirect_url;
        
        // 2. Pega a URL atual da plataforma para o usuário voltar depois
        const currentPlatformUrl = window.location.href;

        // 3. Monta a URL final com o parâmetro de retorno
        // Ex: https://termo...?returnUrl=https://plataforma.../dashboard
        const finalRedirectUrl = `${redirectBaseUrl}?returnUrl=${encodeURIComponent(currentPlatformUrl)}`;

        // 4. Força o redirecionamento
        window.location.href = finalRedirectUrl;
        
        return Promise.reject(error); // Interrompe o fluxo para não quebrar a tela
      }

      // Tratamento genérico de sessão expirada (opcional)
      if (status === 403 && !data?.type) {
         // console.log("Acesso negado genérico");
      }
    }
    return Promise.reject(error);
  }
);