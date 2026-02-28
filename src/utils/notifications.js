const showNotification = (message, type = 'info') => {
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    }

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerText = message;

    container.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
};

export const showSuccess = (message) => showNotification(message, 'success');
export const showError = (message) => showNotification(message, 'error');

export default showNotification;
