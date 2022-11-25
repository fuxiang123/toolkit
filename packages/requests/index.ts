import { setRequestConfig, requests, request, get, post, put, del, setToken, download } from './src/defaultRequests';
import { create } from './src/create';

export type { RequestsConfig } from './src/initRequests';
export { create, request, get, post, put, del, download, setRequestConfig, setToken };
export default requests;
