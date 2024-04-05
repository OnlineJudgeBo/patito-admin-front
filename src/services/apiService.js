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
        let queryString = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');
        let url = `${BASE_URL}/${endpoint}${method === 'GET' && queryString ? `?${queryString}` : ''}`;

        let response = await fetch(url, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!response.ok) {
            console.log(`API call failed: ${response.status}`);
        }
        let data = await response.json();
        return data;
    } catch (error) {
        console.error("Error en la llamada a la API:", error);
    }
}

export const apiService = {
    fetchContestsList: () => fetchAPI('contests', {}),
    fetchProblems: () => fetchAPI('problems', {}),
    fetchProblemById: (id, token) => fetchAPI(`problems/${id}`, { method: 'GET' }),
    fetchTopicList: () => fetchAPI(`topics`, { method: 'GET' }),
    fetchUserProfileList: (searchQuery) => fetchAPI(`users`, { method: 'GET', params: searchQuery }),
    checkUsernameAvailability: (userId) => fetchAPI(`users/UsernameIsAvailable`, { method: 'POST', body: userId }),
    checkUserEmailAvailability: (email) => fetchAPI(`users/UserEmailIsAvailable`, { method: 'POST', body: email }),
    fetchRoles: () => fetchAPI(`Roles`),

    create: (endpoint, body) => fetchAPI(endpoint, { method: 'POST', body: body }),
};
