import axios from 'axios';

const BASE_URL = 'http://localhost:5043/api';

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

async function fetchAPI(endpoint, { method = 'GET', body = null, params = {} } = {}) {
    console.log(getCookie('accessToken'));
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getCookie('accessToken')}`
    };

    try {
        const options = {
            method: method,
            headers: headers,
            url: `${BASE_URL}/${endpoint}`,
            data: body ? body : undefined,
            params: params
        };

        let response = await axios(options);
        console.log(response);
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
    checkUsernameAvailability: (userId) => fetchAPI(`users/UsernameIsAvailable`, { method: 'POST', body: userId }),
    checkUserEmailAvailability: (email) => fetchAPI(`users/UserEmailIsAvailable`, { method: 'POST', body: email }),
    fetchRoles: () => fetchAPI(`Roles`),

    create: (endpoint, body) => fetchAPI(endpoint, { method: 'POST', body: body }),
    update: (endpoint, id, body) => fetchAPI(`${endpoint}/${id}`, { method: 'PUT', body: body }),
};
