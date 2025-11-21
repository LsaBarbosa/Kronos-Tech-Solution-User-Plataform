// src/components/ui/PaginationComponent.tsx

import React, { useMemo } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'; // Assumindo que seu alias é @/components/ui/pagination

interface PaginationProps {
  totalPages: number;
  currentPage: number;
  totalElements: number;
  onPageChange: (page: number) => void;
}

/**
 * Hook personalizado para calcular os itens da paginação de forma compacta.
 * Exibe a primeira página (se necessário), páginas adjacentes à atual e a última página.
 *
 * @param currentPage A página atual (base 0).
 * @param totalPages O número total de páginas.
 * @param siblingCount O número de páginas adjacentes à página atual a serem mostradas (1 resulta em 3 números no bloco central).
 * @returns Um array de itens a serem renderizados: números de página (base 0) ou 'ellipsis'.
 */
const useCompactPagination = (currentPage: number, totalPages: number, siblingCount: number = 1) => {
  return useMemo(() => {
    const items: (number | 'ellipsis')[] = [];

    if (totalPages <= 1) {
      return [];
    }
    
    // Páginas inicial e final fixas
    const firstPage = 0;
    const lastPage = totalPages - 1;

    // Calcula o bloco de páginas a serem exibidas ao redor da página atual
    const startWindow = Math.max(firstPage + 1, currentPage - siblingCount);
    const endWindow = Math.min(lastPage - 1, currentPage + siblingCount);

    // Adiciona a primeira página (sempre)
    items.push(firstPage);

    // 1. Adiciona Reticências Iniciais
    // Se a primeira página do bloco não for a segunda página do total (1), adiciona '...'
    if (startWindow > firstPage + 1) {
      items.push('ellipsis');
    }

    // 2. Adiciona o Bloco Central/Adjacente
    for (let i = startWindow; i <= endWindow; i++) {
        // Garante que não repete a primeira página (que já foi adicionada)
        if (i !== firstPage && i !== lastPage) {
            items.push(i);
        }
    }
    
    // 3. Adiciona Reticências Finais
    // Se a última página do bloco não for a penúltima página do total (lastPage - 1), adiciona '...'
    if (endWindow < lastPage - 1) {
      items.push('ellipsis');
    }

    // 4. Adiciona a Última Página
    // Adiciona apenas se ela ainda não estiver no array (caso de totalPages baixo)
    if (lastPage !== firstPage && items[items.length - 1] !== lastPage) {
        // Se o último item for reticências, e a última página não foi adicionada, adiciona-a.
        items.push(lastPage);
    }
    
    // Garante que a primeira página não esteja duplicada no caso de totalPages muito pequeno.
    // O filter é necessário pois o loop central pode incluir a página 0 ou N se totalPages for 3 ou 4.
    const uniqueItems = Array.from(new Set(items));
    
    // Se o total de páginas for pequeno (ex: 2, 3 ou 4), o bloco central pode ter incluído a última página,
    // mas a lógica acima garante que ela será adicionada apenas uma vez no final, exceto se for adjacente
    // e for o primeiro item do bloco central.

    return uniqueItems;
    
  }, [currentPage, totalPages, siblingCount]);
};


/**
 * Componente funcional que encapsula a lógica de paginação do shadcn/ui.
 * Lida com a exibição de links de página, navegação anterior/próxima e elipses (formato compacto).
 */
export const PaginationComponent: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  totalElements,
  onPageChange,
}) => {
  // Use o hook para obter a lista compacta de itens de paginação
  const paginationItems = useCompactPagination(currentPage, totalPages, 1); // siblingCount=1 mostra 3 números

  // Não renderiza a paginação se houver apenas uma página
  if (totalPages <= 1) {
    return null;
  }

  const isPreviousDisabled = currentPage === 0;
  const isNextDisabled = currentPage === totalPages - 1;

  return (
    <div className='flex flex-col items-center gap-2'>
        <p className='text-sm text-muted-foreground hidden sm:block'>
            Exibindo página {currentPage + 1} de {totalPages} ({totalElements} resultados no total)
        </p>
        <Pagination>
        <PaginationContent>
            {/* Botão Anterior */}
            <PaginationItem>
                <PaginationPrevious 
                    // Renderiza o onClick apenas se não estiver desabilitado
                    onClick={!isPreviousDisabled ? () => onPageChange(currentPage - 1) : undefined}
                    href={!isPreviousDisabled ? '#' : undefined}
                    // Adiciona uma classe de opacidade e cursor para feedback visual
                    className={isPreviousDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                />
            </PaginationItem>

            {/* Links de Páginas e Elipses */}
            {paginationItems.map((item, index) => (
            <PaginationItem key={index}>
                {item === 'ellipsis' ? (
                <PaginationEllipsis />
                ) : (
                <PaginationLink
                    isActive={item === currentPage}
                    onClick={() => onPageChange(item as number)}
                    href='#'
                >
                    {(item as number) + 1} {/* Exibe como 1-based index */}
                </PaginationLink>
                )}
            </PaginationItem>
            ))}

            {/* Botão Próximo */}
            <PaginationItem>
                <PaginationNext 
                    // Renderiza o onClick apenas se não estiver desabilitado
                    onClick={!isNextDisabled ? () => onPageChange(currentPage + 1) : undefined}
                    href={!isNextDisabled ? '#' : undefined}
                     // Adiciona uma classe de opacidade e cursor para feedback visual
                    className={isNextDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                />
            </PaginationItem>
        </PaginationContent>
        </Pagination>
    </div>
  );
};