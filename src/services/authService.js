import api from './api';

const authService = {
    login: async (credentials) => {
        const response = await api.post('/login_json', credentials);

        if (response.data) {
            localStorage.setItem('user', JSON.stringify({
                ...response.data,
                isLoggedIn: true,
            }));
        }
        return response.data;
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    logout: () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    },
};

export default authService;
