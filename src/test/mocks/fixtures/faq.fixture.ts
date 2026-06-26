import type { FaqItem, FaqSearchResponse, FaqContextualResponse } from "@/types/faq";

const faqItemDashboard: FaqItem = {
  id: "faq-1",
  title: "Como registrar meu ponto?",
  shortAnswer: "Acesse o painel e clique em Registrar Ponto.",
  fullAnswer: "Para registrar seu ponto, acesse o dashboard e clique no botão Registrar Ponto. O sistema solicitará confirmação biométrica.",
  category: { id: "cat-1", name: "Ponto" },
  relatedScreens: ["DASHBOARD", "TIME_RECORDS"],
  tags: ["ponto", "registro"],
  priority: 1,
};

const faqItemDocuments: FaqItem = {
  id: "faq-2",
  title: "Como enviar um documento?",
  shortAnswer: "Use a tela de Documentos para enviar arquivos.",
  fullAnswer: "Na tela de Documentos, clique em Enviar Documento e selecione o arquivo desejado.",
  category: { id: "cat-2", name: "Documentos" },
  relatedScreens: ["DOCUMENTS"],
  tags: ["documento", "upload"],
  priority: 2,
};

const searchResponse: FaqSearchResponse = {
  items: [faqItemDashboard, faqItemDocuments],
  totalElements: 2,
  totalPages: 1,
  page: 0,
  size: 10,
};

const contextualResponse: FaqContextualResponse = {
  items: [faqItemDashboard],
  screen: "DASHBOARD",
};

const emptySearchResponse: FaqSearchResponse = {
  items: [],
  totalElements: 0,
  totalPages: 0,
  page: 0,
  size: 10,
};

export const faqFixture = {
  item: faqItemDashboard,
  itemDocuments: faqItemDocuments,
  searchResponse,
  contextualResponse,
  emptySearchResponse,
};
