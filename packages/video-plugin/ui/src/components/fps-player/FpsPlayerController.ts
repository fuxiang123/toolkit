export default interface FpsPlayerController {
  /** 通过播放进度设置时间  */
  setProgress: (progress: number) => void;
  /** 设置秒 */
  setCurrentTime: (time: number) => void;
  /** 获取当前播进度 秒 */
  getProgress: () => number;
  /** 获取当前播放时间 */
  getCurrentTime: () => number;
}
