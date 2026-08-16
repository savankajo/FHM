import Script from 'next/script';
import BibleReader from './reader';

export default function BiblePage() {
  return <><Script src="https://pkg.api.bible/fumsV3.min.js" strategy="afterInteractive" /><BibleReader /></>;
}
