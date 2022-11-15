import debounce from 'lodash/debounce';

export interface DebounceOptions {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

/**
 * 对函数进行防抖处理
 * @param fn 需要防抖的函数
 * @param options.wait 等待时间，单位为毫秒
 * @param options.leading 是否在延迟开始前调用函数
 * @param options.trailing 是否在延迟开始后调用函数
 * @param options.maxWait 最大等待时间，单位为毫秒
 * @returns run 触发执行 fn，函数参数将会传递给 fn
 * @returns cancel 取消防抖
 * @returns flush 立即调用当前防抖函数
 */
export const useDebounceFn = <T extends (...args: any) => any>(fn: T, options?: DebounceOptions) => {
  const wait = options?.wait ?? 500;
  const debounced = debounce(fn, wait, options);
  return {
    run: debounced,
    cancel: debounced.cancel,
    flush: debounced.flush,
  };
};

export default useDebounceFn;
