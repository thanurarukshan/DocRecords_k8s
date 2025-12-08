import '@testing-library/jest-dom';
import fetchMock from 'jest-fetch-mock';
import { TextEncoder, TextDecoder } from 'util'; // <-- polyfill

fetchMock.enableMocks();

// Polyfill for Jest / jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
