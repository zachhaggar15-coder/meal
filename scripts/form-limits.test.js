// api/waitlist.js silently truncates firstName at 80 characters. A limit the
// server enforces and the form does not is a limit the person only discovers
// after their name has already been cut.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const api = fs.readFileSync(path.join(root, 'api/waitlist.js'), 'utf8');
const form = fs.readFileSync(path.join(root, 'src/components/WaitlistSection.jsx'), 'utf8');

test('the form enforces the same first-name limit the API applies', () => {
  const serverLimit = api.match(/body\.first_name \|\| ''\)\.slice\(0, (\d+)\)/);
  assert.ok(serverLimit, 'expected api/waitlist.js to slice firstName to a fixed length');

  const clientLimit = form.match(/WAITLIST_FIRST_NAME_MAX = (\d+)/);
  assert.ok(clientLimit, 'the form must declare the limit rather than hardcode it inline');

  assert.equal(
    clientLimit[1],
    serverLimit[1],
    'client and server first-name limits have drifted apart',
  );
  assert.match(form, /maxLength=\{WAITLIST_FIRST_NAME_MAX\}/);
});
