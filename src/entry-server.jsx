import { PassThrough } from 'node:stream';
import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';

export function render(url) {
  const helmetContext = {};

  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(() => {
      if (settled) return;
      settled = true;
      stream.abort();
      reject(new Error(`SSR render timed out for ${url}`));
    }, 30000);

    const stream = renderToPipeableStream(
      <HelmetProvider context={helmetContext}>
        <StaticRouter location={url}>
          <App />
        </StaticRouter>
      </HelmetProvider>,
      {
        onAllReady() {
          const body = new PassThrough();
          const chunks = [];

          body.on('data', chunk => {
            chunks.push(Buffer.from(chunk));
          });
          body.on('end', () => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            // React 18.3's Node stream pads a chunk with NUL bytes when a
            // multi-byte character does not fit at its end; NUL is never valid HTML text.
            const html = Buffer.concat(chunks).toString('utf8').replace(/\u0000/g, '');
            resolve({ html, helmet: helmetContext.helmet });
          });
          body.on('error', err => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
            reject(err);
          });

          stream.pipe(body);
        },
        onError(err) {
          console.error(err);
        },
        onShellError(err) {
          if (settled) return;
          settled = true;
          clearTimeout(timeout);
          reject(err);
        },
      },
    );
  });
}
