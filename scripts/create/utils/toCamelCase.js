module.exports = function (str) {
  str = str.toLocaleLowerCase();
  if (str.indexOf('-') === -1 && str.indexOf('_') === -1) {
    return str;
  } else {
    let camelcase = '';
    let nextChrUpper = false;
    const leadingHyphens = str.match(/^-+/);
    for (let i = leadingHyphens ? leadingHyphens[0].length : 0; i < str.length; i++) {
      let chr = str.charAt(i);
      if (nextChrUpper) {
        nextChrUpper = false;
        chr = chr.toLocaleUpperCase();
      }
      if (i !== 0 && (chr === '-' || chr === '_')) {
        nextChrUpper = true;
        continue;
      } else if (chr !== '-' && chr !== '_') {
        camelcase += chr;
      }
    }
    return camelcase;
  }
};
