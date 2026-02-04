export const ITEMS_PER_PAGE = 5;

export function nextPage(currentPage) {
    return currentPage + 1;
}

export function prevPage(currentPage) {
    return currentPage > 1 ? currentPage - 1 : 1;
}

export function goToPage(pageNumber) {
    return pageNumber >= 1 ? pageNumber : 1;
}

export const TOTAL_PAGES = (totalItems, itemsPerPage) => {
    return Math.ceil(totalItems / itemsPerPage);
};

export const getOffset = (currentPage, itemsPerPage) => {
    return (currentPage - 1) * itemsPerPage;
}

export const getLimit = (itemsPerPage) => {
    return itemsPerPage;
}

export const getPaginatedItems = (items, currentPage, itemsPerPage) => {
    const offset = getOffset(currentPage, itemsPerPage);
    return items.slice(offset, offset + itemsPerPage);
};

export const getPageInfo = (currentPage, totalItems, itemsPerPage) => {
    const totalPages = TOTAL_PAGES(totalItems, itemsPerPage);
    return `Page ${currentPage} sur ${totalPages}`;
};

export const isFirstPage = (currentPage) => {
    return currentPage === 1;
};

export const isLastPage = (currentPage, totalItems, itemsPerPage) => {
    const totalPages = TOTAL_PAGES(totalItems, itemsPerPage);
    return currentPage >= totalPages;
};

export const disableButton = (button) => {
    button.setAttribute('disabled', 'true');
};

export const enableButton = (button) => {
    button.removeAttribute('disabled');
};

export const allFunctions = {
    nextPage,
    prevPage,
    goToPage,
    getPageInfo,
    isFirstPage,
    isLastPage,
    getPaginatedItems,
    disableButton,
    enableButton
}; 