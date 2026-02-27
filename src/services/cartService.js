import api from './api';

const cartService = {
    getCart: async (userId) => {
        const response = await api.get(`/cart?user_id=${userId}`);
        return response.data;
    },

    addToCart: async (bookId, userId) => {
        const response = await api.post(`/cart/add?book_id=${bookId}&user_id=${userId}`);
        return response.data;
    },

    updateQuantity: async (cartItemId, action) => {
        const response = await api.patch(`/cart/update/${cartItemId}`, null, {
            params: { action },
        });
        return response.data;
    },

    removeFromCart: async (cartItemId) => {
        const response = await api.delete(`/cart/${cartItemId}`);
        return response.data;
    },
};

export default cartService;
