const BASE_URL = 'http://localhost:5043/api';

async function fetchAPI(endpoint, { method = 'GET', body = null, params = {}, token = null } = {}) {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        //'Authorization': `Bearer ${token}`
    };

    try {
        const queryString = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');

        const url = `${BASE_URL}/${endpoint}${method === 'GET' && queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: method,
            headers: headers,
            body: body ? JSON.stringify(body) : null
        });

        if (!response.ok) {
            console.log(`API call failed: ${response.status}`);
        }
        const data = await response.json();
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
};
