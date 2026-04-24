//ici on gère la pagination, les fonctions de navigation, les calculs pour les offsets et limites, et les vérifications pour les pages

// Configuration
export const ITEMS_PER_PAGE = 5;

// Fonctions de navigation
export function nextPage(currentPage) {
    return currentPage + 1;
}

export function prevPage(currentPage) {
    return currentPage > 1 ? currentPage - 1 : 1;
}

export function goToPage(pageNumber) {
    return pageNumber >= 1 ? pageNumber : 1;
}

// Calculs
export const TOTAL_PAGES = (totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
};

export const getOffset = (currentPage, itemsPerPage) => {
    return (currentPage - 1) * itemsPerPage;
};

export const getLimit = (itemsPerPage) => {
    return itemsPerPage;
};

// Récupérer les éléments paginés
export const getPaginatedItems = (items, currentPage, itemsPerPage) => {
    const offset = getOffset(currentPage, itemsPerPage);
    return items.slice(offset, offset + itemsPerPage);
};

// Informations de page
export const getPageInfo = (currentPage, totalItems, itemsPerPage) => {
    const totalPages = TOTAL_PAGES(totalItems, itemsPerPage);
    return `Page ${currentPage} sur ${totalPages}`;
};

// Vérifications
export const isFirstPage = (currentPage) => {
    return currentPage === 1;
};

export const isLastPage = (currentPage, totalItems, itemsPerPage) => {
    const totalPages = TOTAL_PAGES(totalItems, itemsPerPage);
    return currentPage >= totalPages;
};

// Gestion des boutons
export const disableButton = (button) => {
    if (button) {
        button.setAttribute('disabled', 'true');
        button.classList.add('disabled');
    }
};

export const enableButton = (button) => {
    if (button) {
        button.removeAttribute('disabled');
        button.classList.remove('disabled');
    }
};

// Export groupé (optionnel, pour compatibilité)
export const allFunctions = {
    nextPage,
    prevPage,
    goToPage,
    getPageInfo,
    isFirstPage,
    isLastPage,
    getPaginatedItems,
    disableButton,
    enableButton,
    TOTAL_PAGES
};