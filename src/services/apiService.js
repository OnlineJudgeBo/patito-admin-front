import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { getRuntimeNumber, getRuntimeValue } from '../utils/runtimeConfig';

const BASE_URL = String(getRuntimeValue('API_URL', import.meta.env.VITE_API_URL ?? '/api')).replace(/\/+$/, '');
const DEFAULT_SITE_ID = getRuntimeNumber('SITE_ID', import.meta.env.VITE_SITE_ID ?? 1);

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function getTokenSiteId() {
    const token = getCookie('accessToken');

    if (!token) {
        return null;
    }

    try {
        const decoded = jwtDecode(token);
        const rawSiteId = decoded?.site_id ?? decoded?.siteId;
        const siteId = Number(rawSiteId);
        return Number.isInteger(siteId) && siteId > 0 ? siteId : null;
    } catch {
        return null;
    }
}

function getAcademicSiteId(siteId) {
    const explicitSiteId = Number(siteId);

    if (Number.isInteger(explicitSiteId) && explicitSiteId > 0) {
        return explicitSiteId;
    }

    return getTokenSiteId() ?? DEFAULT_SITE_ID;
}

async function fetchAPI(endpoint, { method = 'GET', body = null, params = {} } = {}) {
    const token = getCookie('accessToken');
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const options = {
            method: method,
            headers: headers,
            url: `${BASE_URL}/${String(endpoint).replace(/^\/+/, '')}`,
            data: body ? body : "",
            params: params
        };

        let response = await axios(options);
        return response.data;
    } catch (error) {
        console.error("Error en la llamada a la API:", error);
        throw error;
    }
}

async function postApiFile(endpoint, { method = 'GET', body = null, params = {} } = {}) {
    const token = getCookie('accessToken');
    const headers = {
        'Accept': 'application/json',
        "Content-Type": "multipart/form-data",
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        const options = {
            method: method,
            headers: headers,
            url: `${BASE_URL}/${String(endpoint).replace(/^\/+/, '')}`,
            data: body ? body : undefined,
            params: params
        };

        let response = await axios(options);
        return response.data;
    } catch (error) {
        console.error("Error en la llamada a la API:", error);
        throw error;
    }
}

export const apiService = {
    fetchContestsList: () => fetchAPI('contests', {}),
    fetchProblems: () => fetchAPI('problems', {}),
    fetchProblemById: (id) => fetchAPI(`problems/${id}`, { method: 'GET' }),
    fetchTopicList: () => fetchAPI(`topics`, { method: 'GET' }),
    fetchUserProfileList: (searchQuery) => fetchAPI(`users`, { method: 'GET', params: searchQuery }),
    fetchProblemList: (searchQuery) => fetchAPI(`problems`, { method: 'GET', params: searchQuery }),
    checkUsernameAvailability: (userId) => fetchAPI(`users/UsernameIsAvailable`, { method: 'POST', body: userId }),
    checkUserEmailAvailability: (email) => fetchAPI(`users/UserEmailIsAvailable`, { method: 'POST', body: email }),
    fetchRoles: () => fetchAPI(`Roles`),
    fetchManageableAcademicCourses: (siteId) => fetchAPI(`academic/sites/${getAcademicSiteId(siteId)}/courses/manageable`, { method: 'GET' }),
    fetchAcademicCourse: (courseId, siteId) => fetchAPI(`academic/sites/${getAcademicSiteId(siteId)}/courses/${courseId}`, { method: 'GET' }),
    createAcademicCourse: (body, siteId) => fetchAPI(`academic/sites/${getAcademicSiteId(siteId)}/courses`, { method: 'POST', body }),
    fetchAcademicCourseMembers: (courseId, siteId) => fetchAPI(`academic/sites/${getAcademicSiteId(siteId)}/courses/${courseId}/members`, { method: 'GET' }),
    addAcademicCourseMember: (courseId, body, siteId) => fetchAPI(`academic/sites/${getAcademicSiteId(siteId)}/courses/${courseId}/members`, { method: 'POST', body }),
    removeAcademicCourseMember: (courseId, userId, siteId) =>
        fetchAPI(`academic/sites/${getAcademicSiteId(siteId)}/courses/${courseId}/members/${encodeURIComponent(userId)}`, { method: 'DELETE' }),
    createAcademicCourseAssignment: (courseId, body, siteId) =>
        fetchAPI(`academic/sites/${getAcademicSiteId(siteId)}/courses/${courseId}/assignments`, { method: 'POST', body }),
    updateAcademicCourseAssignment: (courseId, assignmentId, body, siteId) =>
        fetchAPI(`academic/sites/${getAcademicSiteId(siteId)}/courses/${courseId}/assignments/${assignmentId}`, { method: 'PUT', body }),
    fetchAcademicCourseReport: (courseId, siteId) => fetchAPI(`academic/sites/${getAcademicSiteId(siteId)}/courses/${courseId}/report`, { method: 'GET' }),
    downloadAcademicCourseReportCsv: async (courseId, siteId) => {
        const token = getCookie('accessToken');
        const academicSiteId = getAcademicSiteId(siteId);
        const response = await axios({
            method: 'GET',
            url: `${BASE_URL}/academic/sites/${academicSiteId}/courses/${courseId}/report.csv`,
            headers: token
                ? {
                    'Accept': 'text/csv',
                    'Authorization': `Bearer ${token}`
                }
                : {
                    'Accept': 'text/csv'
                },
            responseType: 'blob'
        });

        return response.data;
    },

    create: (endpoint, body) => fetchAPI(endpoint, { method: 'POST', body: body }),
    update: (endpoint, id, body) => fetchAPI(`${endpoint}/${id}`, { method: 'PUT', body: body ? body : "" }),
    get: (endpoint) => fetchAPI(`${endpoint}`, { method: 'GET' }),
    delete: (endpoint) => fetchAPI(`${endpoint}`, { method: 'DELETE' }),
    postFile: (endpoint, formData) => postApiFile(`${endpoint}`, { method: 'POST', body: formData }),
};
