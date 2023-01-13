/** byte转换 */
export const transByte = (byte: number) => {
  const sizeUnit = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  let sizeNum = byte;
  while (sizeNum > 1024) {
    sizeNum /= 1024;
    index++;
  }
  return `${byte.toFixed(1)}${sizeUnit[index]}`;
};
