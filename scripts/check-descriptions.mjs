import fs from 'fs';
import path from 'path';

function extractSeoDesc(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return '';
  const fm = fmMatch[1];

  // Try quoted
  let m = fm.match(/seoDescription:\s*["'](.*?)["']/);
  if (m) return m[1];

  // Try multiline >- or >
  m = fm.match(/seoDescription:\s*>-?\s*\n((?:\s+.+\n?)+)/);
  if (m) return m[1].trim().replace(/\s+/g, ' ');

  // single-line unquoted (but not just >- marker)
  m = fm.match(/seoDescription:\s*(.+)/);
  if (m && m[1].trim() !== '>-' && m[1].trim() !== '>') return m[1].trim();

  return '';
}

const results = [];

['content/blog', 'content/podcast'].forEach(dir => {
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx')).sort();
  files.forEach(f => {
    const fp = path.join(dir, f);
    const content = fs.readFileSync(fp, 'utf8');
    const desc = extractSeoDesc(content);
    const len = desc.length;
    if (len === 0) results.push(`MISSING|${fp}`);
    else if (len < 120) results.push(`SHORT(${len})|${fp}|${desc}`);
    else if (len > 160) results.push(`LONG(${len})|${fp}|${desc.slice(0,120)}...`);
  });
});

console.log(`=== ISSUES FOUND: ${results.length} ===`);
results.forEach(r => console.log(r));
