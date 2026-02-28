import showNotification, { showSuccess, showError } from './notifications';

describe('notifications utility Coverage 100%', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.clearAllTimers();
        jest.useRealTimers();
    });

    test('має створювати контейнер, якщо його не існує', () => {
        showNotification('Привіт');
        const container = document.getElementById('notification-container');
        expect(container).toBeInTheDocument();
        expect(container.tagName).toBe('DIV');
    });

    test('має використовувати існуючий контейнер', () => {
        const existing = document.createElement('div');
        existing.id = 'notification-container';
        document.body.appendChild(existing);

        showNotification('Друге повідомлення');

        const containers = document.querySelectorAll('#notification-container');
        expect(containers.length).toBe(1);
        expect(existing.children.length).toBe(1);
    });

    test('має створювати елемент з правильним текстом та класом', () => {
        showNotification('Помилка', 'error');

        const notification = document.querySelector('.notification.error');
        expect(notification).toBeInTheDocument();
        expect(notification.innerText).toBe('Помилка');
    });

    test('експортні функції мають викликати showNotification з правильними типами', () => {
        showSuccess('Успіх!');
        expect(document.querySelector('.notification.success')).toBeInTheDocument();

        showError('Караул!');
        expect(document.querySelector('.notification.error')).toBeInTheDocument();
    });

    test('має видаляти повідомлення через певний час (таймери)', () => {
        showNotification('Зникну через 3.5 секунди');
        const container = document.getElementById('notification-container');
        const notification = container.firstChild;

        expect(notification).toBeInTheDocument();

        jest.advanceTimersByTime(3000);
        expect(notification.classList.contains('fade-out')).toBe(true);

        jest.advanceTimersByTime(500);
        expect(notification).not.toBeInTheDocument();
    });
});
