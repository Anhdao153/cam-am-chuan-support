#!/usr/bin/env node

import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API_URL = "https://api-prod.pikzone.vn/api/v1/policy";
const SUPPORT_EMAIL = "ndthien.1532000@gmail.com";
const OUTPUT_PATH = join(dirname(fileURLToPath(import.meta.url)), "..", "privacy.html");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function safeHref(url) {
  return /^(https?:\/\/|mailto:)/i.test(url) ? url : "#";
}

function renderInline(text) {
  let html = escapeHtml(text);

  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, "$1<em>$2</em>");
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, label, url) => `<a href="${safeHref(url)}">${label}</a>`
  );

  return html;
}

function renderList(items, index, level) {
  let html = "<ul>";

  while (index < items.length) {
    const item = items[index];

    if (item.level < level) break;
    if (item.level > level) break;

    let nested = "";
    let next = index + 1;

    if (next < items.length && items[next].level > level) {
      const child = renderList(items, next, level + 1);
      nested = child.html;
      next = child.index;
    }

    html += `<li>${renderInline(item.text)}${nested}</li>`;
    index = next;
  }

  html += "</ul>";
  return { html, index };
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];

  let paragraph = [];
  let list = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;

    const content = paragraph
      .map((line) => {
        const hasHardBreak = / {2,}$/.test(line);
        return renderInline(line.trim()) + (hasHardBreak ? "<br>" : "");
      })
      .join(" ");

    blocks.push(`<p>${content}</p>`);
    paragraph = [];
  };

  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(renderList(list, 0, 0).html);
    list = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      blocks.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      flushList();
      blocks.push("<hr>");
      continue;
    }

    const listItem = line.match(/^(\s*)[*+-]\s+(.*)$/);
    if (listItem) {
      flushParagraph();
      list.push({
        level: Math.floor(listItem[1].replace(/\t/g, "  ").length / 2),
        text: listItem[2],
      });
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();

  return blocks.join("\n");
}

function pageTemplate(content) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chính sách quyền riêng tư - Cảm Âm Chuẩn</title>
  <meta name="description" content="Chính sách quyền riêng tư của ứng dụng Cảm Âm Chuẩn trên iOS (Apple App Store) và Android (Google Play).">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.7;
      color: #222;
      background: #fff;
    }
    .site-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      max-width: 760px;
      margin: 0 auto;
      padding: 20px 24px;
      border-bottom: 1px solid #e5efe9;
    }
    .brand {
      color: #28785b;
      font-size: 18px;
      font-weight: 700;
      text-decoration: none;
    }
    .site-header nav a {
      color: #28785b;
      font-size: 14px;
      text-decoration: none;
    }
    .site-header nav a:hover { text-decoration: underline; }
    main {
      max-width: 760px;
      margin: 0 auto;
      padding: 32px 24px 48px;
    }
    h1 { color: #28785b; font-size: clamp(26px, 5vw, 36px); line-height: 1.3; }
    h2, h3, h4 { color: #1f5f49; line-height: 1.4; }
    h1 + p { color: #555; font-size: 15px; }
    a { color: #28785b; }
    ul { padding-left: 1.4em; }
    li { margin: 6px 0; }
    li > ul { margin: 4px 0; }
    code {
      background: #f1f7f4;
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 0.9em;
      word-break: break-word;
    }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 2em 0; }
    footer {
      max-width: 760px;
      margin: 0 auto;
      padding: 24px;
      border-top: 1px solid #e5efe9;
      color: #777;
      font-size: 14px;
      text-align: center;
    }
    footer a { color: #28785b; }
    @media (max-width: 480px) {
      .site-header, main, footer { padding-left: 18px; padding-right: 18px; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="./index.html">Cảm Âm Chuẩn</a>
    <nav>
      <a href="./index.html">Trang hỗ trợ</a>
    </nav>
  </header>

  <main>
    <article>
${content}
    </article>
  </main>

  <footer>
    © 2026 Cảm Âm Chuẩn · <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
  </footer>
</body>
</html>
`;
}

async function main() {
  const response = await fetch(API_URL, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API trả về ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const policy = payload?.data?.policy;

  if (typeof policy !== "string" || policy.trim().length === 0) {
    throw new Error("Không tìm thấy nội dung chính sách trong data.policy");
  }

  const normalized = policy.replaceAll("support@camamchuan.vn", SUPPORT_EMAIL);
  const html = pageTemplate(markdownToHtml(normalized));

  await writeFile(OUTPUT_PATH, html, "utf8");
  console.log(`Đã cập nhật ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(`Không thể tạo privacy.html: ${error.message}`);
  process.exitCode = 1;
});
