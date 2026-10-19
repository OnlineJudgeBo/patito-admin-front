// Values of the `defunct` column, shared by problems and contests (see DefunctStates in the API).
export const DEFUNCT = {
    VISIBLE: 'N',
    HIDDEN: 'Y', // not listed, still opens by link (or inside its contest)
    OFFICIAL: 'O',
    DELETED: 'D', // soft delete, contests only
};
