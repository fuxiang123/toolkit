import { create, RequestsConfig } from '../index';

describe('request库测试', () => {
  const { requests } = create();

  test('测试setRequestConfig配置初始化是否设置成功', () => {
    const handleAuthError = jest.fn();
    const handleNetworkError = jest.fn();
    const handleRequest = jest.fn();
    const handleResponse = jest.fn();
    const handleToken = () => 'testtoken';
    const successAuthCode = ['testcode'];
    const testConfig: RequestsConfig = {
      baseURL: 'http://localhost:3000',
      handleAuthError,
      handleNetworkError,
      handleRequest,
      handleResponse,
      handleToken,
      successAuthCode,
    };
    requests.setRequestConfig(testConfig);
    expect(requests.instance.defaults.baseURL).toBe(testConfig.baseURL);
    expect(requests.requestConfig.handleAuthError).toBe(handleAuthError);
    expect(requests.requestConfig.handleNetworkError).toBe(handleNetworkError);
    expect(requests.requestConfig.handleRequest).toBe(handleRequest);
    expect(requests.requestConfig.handleResponse).toBe(handleResponse);
    expect(requests.requestConfig.handleToken).toBe(handleToken);
    expect(requests.requestConfig.successAuthCode).toBe(successAuthCode);
  });

  test('测试setRequestConfig修改配置是否成功', () => {
    const successCode = ['123456'];
    requests.setRequestConfig({
      successAuthCode: successCode,
    });

    expect(requests.requestConfig.successAuthCode).toBe(successCode);

    requests.setRequestConfig({
      successAuthCode: undefined,
    });

    expect(requests.requestConfig.successAuthCode).toBe(undefined);
  });

  requests.setRequestConfig({
    successAuthCode: undefined,
  });
});
