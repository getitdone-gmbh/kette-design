import { readdirSync, readFileSync, statSync } from 'fs';
import { join, resolve } from 'path';

const root = resolve(__dirname, '../..');
const skip = /\.(stories|test|figma)\.|fixtures|node_modules/;

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : /\.(ts|tsx)$/.test(name) && !skip.test(path) ? [path] : [];
  });

describe('use client directive guard', () => {
  it('marks every module that uses React hooks or context as a client module', () => {
    const missing = walk(root).filter((file) => {
      const source = readFileSync(file, 'utf8');
      const usesHooks = /\buse[A-Z]\w*\(|createContext\(/.test(source);
      return usesHooks && !/^\s*(\/\/[^\n]*\n\s*)*['"]use client['"]/.test(source);
    });
    expect(missing).toEqual([]);
  });
});
