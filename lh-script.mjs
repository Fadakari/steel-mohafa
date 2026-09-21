import { execSync } from 'child_process';
import fs from 'fs';

const urls = [
  '/',
  '/about',
  '/blog',
  '/products'
];
const scores = {};

console.log('Running Lighthouse tests...');

for (const url of urls) {
  console.log('Testing ' + url);
  try {
    execSync(`npx lighthouse http://127.0.0.1:3000${url} --output=json --output-path=./lh-temp.json --chrome-flags="--headless"`, { stdio: 'inherit' });
    const data = JSON.parse(fs.readFileSync('./lh-temp.json', 'utf8'));
    scores[url] = {
      performance: data.categories.performance.score * 100,
      accessibility: data.categories.accessibility.score * 100,
      bestPractices: data.categories['best-practices'].score * 100,
      seo: data.categories.seo.score * 100
    };
  } catch (e) {
    console.error('Failed on ' + url);
    scores[url] = { error: true };
  }
}
console.log(JSON.stringify(scores, null, 2));
fs.writeFileSync('./lh-results.json', JSON.stringify(scores, null, 2));
