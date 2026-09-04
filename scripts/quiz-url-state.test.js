import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const resultsSource = fs.readFileSync(path.join(root, 'src/pages/QuizResults.jsx'), 'utf8');
const quizSource = fs.readFileSync(path.join(root, 'src/pages/Quiz.jsx'), 'utf8');
const prerenderSource = fs.readFileSync(path.join(root, 'prerender.js'), 'utf8');

test('/quiz/results is prerendered, so its first client render must not depend on the query string', () => {
  assert.match(prerenderSource, /'\/quiz\/results'/, 'route is prerendered; this test exists because of that');
  assert.match(
    resultsSource,
    /const \[answers, setAnswers\] = useState\(\{\}\)/,
    'answers must start empty: seeding from parsedParams makes a shared ?q= link '
    + 'hydrate against markup built without one',
  );
});

test('answers are read from the URL in an effect, with a saved-answers fallback', () => {
  assert.match(resultsSource, /useEffect\(\(\) => \{[\s\S]*?parsedParams\.answers/);
  assert.match(resultsSource, /readSavedAnswers\(\)/, 'a reload without params still restores this device\'s answers');
});

test('finishing the quiz encodes answers into the results URL so it can be shared or reloaded', () => {
  assert.match(quizSource, /navigate\(`\/quiz\/results\?q=\$\{encoded\}`\)/);
});

test('an unreadable quiz link recovers instead of rendering a broken page', () => {
  assert.match(resultsSource, /parsedParams\.invalid/);
  assert.match(resultsSource, /quizInvalidStateRecovered/);
});
