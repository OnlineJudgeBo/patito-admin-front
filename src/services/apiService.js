const BASE_URL = 'http://localhost:5043/api';

async function fetchAPI(endpoint, { method = 'GET', body = null, token = null } = {}) {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        //'Authorization': `Bearer ${token}`
    };

    try {
        const response = await fetch(`${BASE_URL}/${endpoint}`, {
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
    fetchProblems: (token) => fetchAPI('problems', { token: token }),
    fetchProblemById: (id, token) => fetchAPI(`problems/${id}`, { method: 'GET', token: token }),
    fetchTopicList: (token) => fetchAPI(`topics`, { method: 'GET', token: token }),
};
