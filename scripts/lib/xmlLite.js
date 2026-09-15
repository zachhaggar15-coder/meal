// A very small, strict XML well-formedness parser.
//
// The repository has no XML dependency and adding one to check our own output
// would be a poor trade. This does what the Pinterest feed checks actually
// need: prove that a document is well formed, that every tag is balanced, that
// no raw `&` or `<` escaped past the writer, and give the tests a tree to
// assert against.
//
// It is not a general-purpose parser. It supports elements, attributes, text,
// CDATA, comments and the XML declaration - which is the whole of RSS 2.0.

const NAME = '[A-Za-z_:][\\w.:-]*';
const TAG_START = new RegExp(`^<(${NAME})`);
const CLOSE_TAG = new RegExp(`^</(${NAME})\\s*>`);
const ATTRIBUTE = new RegExp(`(${NAME})\\s*=\\s*("([^"]*)"|'([^']*)')`, 'g');
const KNOWN_ENTITY = /&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);/g;

export class XmlError extends Error {}

function decode(value) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&');
}

function assertEscapedText(text, where) {
  const stripped = text.replace(KNOWN_ENTITY, '');
  if (stripped.includes('&')) throw new XmlError(`unescaped "&" in ${where}`);
  if (stripped.includes('<')) throw new XmlError(`unescaped "<" in ${where}`);
}

/**
 * Parse a document and return its root element.
 * Throws XmlError on anything that is not well formed.
 */
export function parseXml(source) {
  let rest = String(source);
  const stack = [];
  let root = null;

  const consume = length => { rest = rest.slice(length); };

  // XML declaration and any leading whitespace.
  rest = rest.replace(/^\uFEFF/, '');
  const declaration = /^<\?xml[^?]*\?>/.exec(rest);
  if (declaration) consume(declaration[0].length);

  while (rest.length) {
    if (rest.startsWith('<!--')) {
      const end = rest.indexOf('-->');
      if (end === -1) throw new XmlError('unterminated comment');
      consume(end + 3);
      continue;
    }

    if (rest.startsWith('<![CDATA[')) {
      const end = rest.indexOf(']]>');
      if (end === -1) throw new XmlError('unterminated CDATA section');
      const node = stack[stack.length - 1];
      if (!node) throw new XmlError('CDATA outside the root element');
      node.text += rest.slice(9, end);
      consume(end + 3);
      continue;
    }

    const close = CLOSE_TAG.exec(rest);
    if (close) {
      const open = stack.pop();
      if (!open) throw new XmlError(`closing tag </${close[1]}> with nothing open`);
      if (open.name !== close[1]) throw new XmlError(`</${close[1]}> closes <${open.name}>`);
      consume(close[0].length);
      continue;
    }

    const open = TAG_START.exec(rest);
    if (open) {
      const end = findTagEnd(rest);
      const raw = rest.slice(0, end + 1);
      const selfClosing = raw.endsWith('/>');
      const attributes = {};
      const attributeSource = raw.slice(open[0].length, selfClosing ? -2 : -1);
      // Anything the attribute pattern does not consume is malformed - an
      // unquoted value, a stray name, a missing "=".
      const leftovers = attributeSource.replace(ATTRIBUTE, '').trim();
      if (leftovers) throw new XmlError(`malformed attributes in <${open[1]}>: "${leftovers}"`);
      for (const match of attributeSource.matchAll(ATTRIBUTE)) {
        const value = match[3] ?? match[4] ?? '';
        assertEscapedText(value, `attribute ${match[1]}`);
        if (match[1] in attributes) throw new XmlError(`duplicate attribute ${match[1]}`);
        attributes[match[1]] = decode(value);
      }

      const node = { name: open[1], attributes, children: [], text: '' };
      const parent = stack[stack.length - 1];
      if (parent) parent.children.push(node);
      else if (root) throw new XmlError('more than one root element');
      else root = node;

      if (!selfClosing) stack.push(node);
      consume(raw.length);
      continue;
    }

    if (rest.startsWith('<')) throw new XmlError(`malformed markup at "${rest.slice(0, 40)}"`);

    const next = rest.indexOf('<');
    const text = next === -1 ? rest : rest.slice(0, next);
    const node = stack[stack.length - 1];
    if (node) {
      assertEscapedText(text, `<${node.name}>`);
      node.text += decode(text);
    } else if (text.trim()) {
      throw new XmlError('text outside the root element');
    }
    consume(text.length);
  }

  if (stack.length) throw new XmlError(`unclosed <${stack[stack.length - 1].name}>`);
  if (!root) throw new XmlError('no root element');
  return root;
}

function findTagEnd(source) {
  let quote = null;
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (quote) {
      if (char === quote) quote = null;
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '>') return index;
  }
  throw new XmlError('unterminated tag');
}

/** Direct children with the given name. */
export function childrenNamed(node, name) {
  return node.children.filter(child => child.name === name);
}

/** Text of the first direct child with the given name, or ''. */
export function childText(node, name) {
  return childrenNamed(node, name)[0]?.text ?? '';
}
