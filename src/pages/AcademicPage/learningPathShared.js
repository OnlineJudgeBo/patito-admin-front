export const emptyPath = {
    key: '',
    title: '',
    description: '',
    version: 1,
    languagePrimary: 'cpp',
    category: 'competitive-programming',
    slug: ''
};
export const emptyStage = { key: '', name: '', order: 1, unlockedByDefault: false };
export const emptyTopic = {
    key: '',
    title: '',
    summary: '',
    theory: '',
    learningObjectives: '',
    difficulty: 'basic',
    order: 1,
    problemIds: ''
};
export const inputClass = 'w-full rounded border border-gray-300 px-3 py-2';
export const buttonClass = 'rounded px-3 py-2 text-sm font-medium';

export function errorMessage(error) {
    return error?.response?.data?.message || error?.response?.data || error?.message || 'Ocurrió un error inesperado.';
}

export function parseList(value) {
    return String(value).split(/[\n,]/).map(item => item.trim()).filter(Boolean);
}

export function slugify(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function buildProblemOption(problem) {
    return {
        value: Number(problem.problemId),
        label: `${problem.problemId} - ${problem.title}`,
        title: problem.title
    };
}
