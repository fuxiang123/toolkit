import { setRequestConfig, requests, request, get, post, put, del, download } from './src/defaultRequests';
import { create } from './src/create';

export type { RequestsConfig } from './src/initRequests';
export * from 'axios';
export { default as axios } from 'axios';
export { create, request, get, post, put, del, download, setRequestConfig };
export default requests;
