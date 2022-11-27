import { create } from './create';

const { requests, request, get, post, put, del, download } = create({
  successAuthCode: ['00000'],
});

const setRequestConfig = requests.setRequestConfig.bind(requests);

export { setRequestConfig, requests, request, get, post, put, del, download };

export default requests;
