import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const originalError = console.error;

console.error = (...args) => {
    const firstArg = args[0];

    if (typeof firstArg === 'string' && /validateDOMNesting|act\(...\)/.test(firstArg)) {
        return;
    }

    if (firstArg && firstArg.includes('Not implemented: navigation')) {
        return;
    }

    originalError.call(console, ...args);
};
