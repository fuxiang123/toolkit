export function resetSize(vm: any) {
  let imgWidth;
  let imgHeight;
  let barWidth;
  let barHeight; /** 图片的宽度、高度，移动条的宽度、高度 */
  const parentWidth = vm.$el.parentNode.offsetWidth;
  const parentHeight = vm.$el.parentNode.offsetHeight;
  if (vm.imgSize.width.indexOf('%') !== -1) {
    imgWidth = `${(parseInt(vm.imgSize.width, 10) / 100) * parentWidth}px`;
  } else {
    imgWidth = vm.imgSize.width;
  }

  if (vm.imgSize.height.indexOf('%') !== -1) {
    imgHeight = `${(parseInt(vm.imgSize.height, 10) / 100) * parentHeight}px`;
  } else {
    imgHeight = vm.imgSize.height;
  }

  if (vm.barSize.width.indexOf('%') !== -1) {
    barWidth = `${(parseInt(vm.barSize.width, 10) / 100) * parentWidth}px`;
  } else {
    barWidth = vm.barSize.width;
  }

  if (vm.barSize.height.indexOf('%') !== -1) {
    barHeight = `${(parseInt(vm.barSize.height, 10) / 100) * parentHeight}px`;
  } else {
    barHeight = vm.barSize.height;
  }

  return { imgWidth, imgHeight, barWidth, barHeight };
}

export const codeChars = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
];
export const codeColor1 = ['#fffff0', '#f0ffff', '#f0fff0', '#fff0f0'];
export const codeColor2 = ['#FF0033', '#006699', '#993366', '#FF9900', '#66CC66', '#FF33CC'];

/** 生成随机组件Id */
export function createModelId(len = 36) {
  const s: Array<string> = [];
  const hexDigits = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < len; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 26), 1);
  }
  /** s[8] = s[13] = s[18] = s[23] = "-"; */
  const uuid = s.join('');
  return uuid;
}
