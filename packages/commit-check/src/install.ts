import { addCommitLint } from './actions/addCommitLint.js';
import { initHusky } from './actions/initHusky.js';

export const install = async () => {
  initHusky();
  addCommitLint();
};
