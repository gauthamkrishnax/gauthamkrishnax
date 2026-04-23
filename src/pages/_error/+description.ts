import type { PageContextServer } from 'vike/types';
import { errorSeoDescription } from './errorCopy';

export default function description(pageContext: PageContextServer) {
  return errorSeoDescription(pageContext);
}
