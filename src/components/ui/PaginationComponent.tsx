import React from 'react';
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
 * Componente funcional que encapsula a lógica de paginação do shadcn/ui.
 * Lida com a exibição de links de página, navegação anterior/próxima e elipses.
 */
export const PaginationComponent: React.FC<PaginationProps> = ({
  totalPages,
  currentPage,
  totalElements,
  onPageChange,
}) => {
  // Limita o número de botões de página visíveis (ex: 1, 2, 3, ..., 10)
  const MAX_PAGE_BUTTONS = 5; 
  const pageNumbers: (number | '...')[] = [];

  // Lógica para gerar os números de página visíveis
  let startPage = Math.max(0, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
  let endPage = Math.min(totalPages - 1, startPage + MAX_PAGE_BUTTONS - 1);

  if (endPage - startPage < MAX_PAGE_BUTTONS - 1) {
    startPage = Math.max(0, endPage - MAX_PAGE_BUTTONS + 1);
  }
  
  // Adiciona o link para a primeira página se houver mais de uma página intermediária pulada.
  if (startPage > 0) {
    pageNumbers.push(0);
    if (startPage > 1) {
      pageNumbers.push('...');
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }

  // Adiciona a elipse e o link para a última página se houver páginas puladas.
  if (endPage < totalPages - 1) {
    if (endPage < totalPages - 2) {
      pageNumbers.push('...');
    }
    pageNumbers.push(totalPages - 1);
  }
  // --- Fim da lógica de geração ---

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
                    // Renderiza o onClick e href apenas se não estiver desabilitado (CORREÇÃO DE TIPAGEM)
                    onClick={!isPreviousDisabled ? () => onPageChange(currentPage - 1) : undefined}
                    href={!isPreviousDisabled ? '#' : undefined}
                    // Adiciona uma classe de opacidade e cursor para feedback visual (Ação recomendada para links)
                    className={isPreviousDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                />
            </PaginationItem>

            {/* Links de Páginas */}
            {pageNumbers.map((pageNumber, index) => (
            <PaginationItem key={index}>
                {pageNumber === '...' ? (
                <PaginationEllipsis />
                ) : (
                <PaginationLink
                    isActive={pageNumber === currentPage}
                    onClick={() => onPageChange(pageNumber as number)}
                    href='#'
                >
                    {(pageNumber as number) + 1}
                </PaginationLink>
                )}
            </PaginationItem>
            ))}

            {/* Botão Próximo */}
            <PaginationItem>
                <PaginationNext 
                    // Renderiza o onClick e href apenas se não estiver desabilitado (CORREÇÃO DE TIPAGEM)
                    onClick={!isNextDisabled ? () => onPageChange(currentPage + 1) : undefined}
                    href={!isNextDisabled ? '#' : undefined}
                     // Adiciona uma classe de opacidade e cursor para feedback visual (Ação recomendada para links)
                    className={isNextDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
                />
            </PaginationItem>
        </PaginationContent>
        </Pagination>
    </div>
  );
};
