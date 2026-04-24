import type { PageContext } from 'vike/types';
import { errorSeoTitle } from './errorCopy';

export default function title(pageContext: PageContext) {
  return errorSeoTitle(pageContext);
}
