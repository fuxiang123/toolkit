import { setRequestConfig, requests, request, get, post, put, del } from './src/defaultRequests';
import { create } from './src/create';

export type { RequestsConfig } from './src/initRequests';
export * from 'axios';
export { default as axios } from 'axios';
export { create, request, get, post, put, del, setRequestConfig };
export default requests;
