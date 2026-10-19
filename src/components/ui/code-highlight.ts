export type CodeLanguage = 'ts' | 'js' | 'json' | 'css' | 'html' | 'bash' | 'python';
export type CodeTokenType =
  | 'comment'
  | 'string'
  | 'number'
  | 'keyword'
  | 'function'
  | 'property'
  | 'tag'
  | 'variable'
  | 'punctuation'
  | 'text';

export interface CodeToken {
  type: CodeTokenType;
  text: string;
}

type Rule = [CodeTokenType, RegExp];

const jsKeywords =
  'abstract|as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|private|protected|public|readonly|return|set|static|super|switch|this|throw|true|false|try|type|typeof|undefined|var|void|while|with|yield';

const bashKeywords =
  'if|then|else|elif|fi|for|while|until|do|done|case|esac|in|function|export|local|return|exit|source|alias|unset|set';

const pythonKeywords =
  'and|as|assert|async|await|break|class|continue|def|del|elif|else|except|finally|for|from|global|if|import|in|is|lambda|nonlocal|not|or|pass|raise|return|try|while|with|yield|True|False|None';

const strings = String.raw`"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'`;

// Sticky rules tried in order at each position; the first match wins, anything else becomes plain text.
const rules: Record<CodeLanguage, Rule[]> = {
  js: [
    ['comment', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ['string', new RegExp(`${strings}|\`(?:[^\`\\\\]|\\\\.)*\``, 'y')],
    ['number', /\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/iy],
    ['keyword', new RegExp(`\\b(?:${jsKeywords})\\b`, 'y')],
    ['function', /[A-Za-z_$][\w$]*(?=\s*\()/y],
    ['punctuation', /[{}()[\];,.<>:=+\-*/!?&|%^~]/y],
  ],
  ts: [],
  json: [
    ['property', new RegExp(`(?:${strings})(?=\\s*:)`, 'y')],
    ['string', new RegExp(strings, 'y')],
    ['number', /-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b/iy],
    ['keyword', /\b(?:true|false|null)\b/y],
    ['punctuation', /[{}[\],:]/y],
  ],
  css: [
    ['comment', /\/\*[\s\S]*?\*\//y],
    ['string', new RegExp(strings, 'y')],
    ['keyword', /@[\w-]+/y],
    ['property', /-{0,2}[a-zA-Z][\w-]*(?=\s*:)/y],
    ['number', /#[0-9a-fA-F]{3,8}\b|-?\b\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw|s|ms|deg)?/y],
    ['function', /[a-zA-Z-]+(?=\()/y],
    ['punctuation', /[{}()[\];,:>+~*]/y],
  ],
  html: [
    ['comment', /<!--[\s\S]*?-->/y],
    ['tag', /<\/?[A-Za-z][\w:-]*/y],
    ['string', new RegExp(strings, 'y')],
    ['property', /[A-Za-z_:@][\w:.-]*(?=\s*=)/y],
    ['punctuation', /\/?>|=/y],
  ],
  python: [
    ['comment', /#[^\n]*/y],
    // Triple quoted strings (docstrings) first, then single line strings, both with an optional r, b, f or u prefix.
    ['string', /[rRbBfFuU]{0,2}(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$))/y],
    ['string', new RegExp(`[rRbBfFuU]{0,2}(?:${strings})`, 'y')],
    ['function', /@[A-Za-z_][\w.]*/y],
    ['number', /\b(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|\d[\d_]*(?:\.[\d_]+)?(?:[eE][+-]?\d+)?j?)\b/y],
    ['keyword', new RegExp(`\\b(?:${pythonKeywords})\\b`, 'y')],
    ['function', /[A-Za-z_]\w*(?=\s*\()/y],
    ['punctuation', /[{}()[\];,.:=+\-*/<>!&|%^~@]/y],
  ],
  bash: [
    ['comment', /#[^\n]*/y],
    ['string', new RegExp(strings, 'y')],
    ['variable', /\$\{[^}]*\}|\$[A-Za-z_]\w*|\$[0-9?#@!*]/y],
    ['keyword', new RegExp(`\\b(?:${bashKeywords})\\b`, 'y')],
    ['property', /--?[A-Za-z][\w-]*/y],
    ['number', /\b\d+\b/y],
    ['punctuation', /[|&;<>()[\]{}=]/y],
  ],
};
rules.ts = rules.js;

export const tokenizeCode = (code: string, language: CodeLanguage): CodeToken[] => {
  const list = rules[language] ?? [];
  const tokens: CodeToken[] = [];
  const push = (type: CodeTokenType, text: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.type === type) last.text += text;
    else tokens.push({ type, text });
  };
  let index = 0;
  while (index < code.length) {
    let matched = false;
    for (const [type, pattern] of list) {
      pattern.lastIndex = index;
      const result = pattern.exec(code);
      if (result && result[0].length > 0) {
        push(type, result[0]);
        index += result[0].length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Consume a whole identifier or whitespace run as plain text so keywords inside words do not match.
      const word = /^(?:[\w$-]+|\s+|[\s\S])/.exec(code.slice(index));
      const text = word ? word[0] : code[index];
      push('text', text);
      index += text.length;
    }
  }
  return tokens;
};

// Colour roles by token. Default tone uses AA text roles; the inverse tone keeps one hue and varies emphasis.
export const codeTokenClasses = {
  default: {
    comment: 'italic text-text-subtle-on-muted',
    string: 'text-text-success',
    number: 'text-text-warning',
    keyword: 'text-text-brand-on-subtle',
    function: 'text-text-info-on-subtle',
    property: 'text-text-info-on-subtle',
    tag: 'text-text-brand-on-subtle',
    variable: 'text-text-warning',
    punctuation: 'text-text-subtle-on-muted',
    text: '',
  },
  inverse: {
    comment: 'italic text-background/60',
    string: 'text-background',
    number: 'text-background/80',
    keyword: 'font-semibold text-background',
    function: 'text-background',
    property: 'text-background/80',
    tag: 'font-semibold text-background',
    variable: 'text-background/80',
    punctuation: 'text-background/60',
    text: '',
  },
} as const;
