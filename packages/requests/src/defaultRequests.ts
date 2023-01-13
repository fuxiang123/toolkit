import { create } from './create';

const { requests, request, get, post, put, del } = create();

const setRequestConfig = requests.setRequestConfig.bind(requests);

export { setRequestConfig, requests, request, get, post, put, del };

export default requests;
