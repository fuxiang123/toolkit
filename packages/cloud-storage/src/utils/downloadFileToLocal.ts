function fakeClick(obj: any) {
  const ev = document.createEvent('MouseEvents');
  ev.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  obj.dispatchEvent(ev);
}

/** 下载文件 */
export function downloadFileToLocal(name: string, data: string | Blob) {
  const urlObject = window.URL || window.webkitURL || window;
  let exportBlob;
  if (typeof data === 'string') {
    exportBlob = new Blob([data]);
  } else {
    exportBlob = data;
  }
  const saveLink = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
  saveLink.setAttribute('href', urlObject.createObjectURL(exportBlob));
  saveLink.setAttribute('download', name);
  fakeClick(saveLink);
}
