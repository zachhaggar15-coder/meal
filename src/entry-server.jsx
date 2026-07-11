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
          let html = '';

          body.on('data', chunk => {
            html += chunk.toString();
          });
          body.on('end', () => {
            if (settled) return;
            settled = true;
            clearTimeout(timeout);
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
