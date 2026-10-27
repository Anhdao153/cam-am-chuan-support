#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const API_URL = "https://api-prod.pikzone.vn/api/v1/policy";
const SUPPORT_EMAIL = "ndthien.1532000@gmail.com";
const ROOT_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_PATH = join(ROOT_DIR, "privacy.html");
const EN_POLICY_PATH = join(ROOT_DIR, "content", "privacy.en.md");

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

function pageTemplate(viContent, enContent) {
  return `<!DOCTYPE html>
<html lang="vi" data-lang="vi"
  data-title-vi="Chính sách quyền riêng tư - Cảm Âm Chuẩn"
  data-title-en="Privacy Policy - Cảm Âm Chuẩn"
  data-description-vi="Chính sách quyền riêng tư của ứng dụng Cảm Âm Chuẩn trên iOS (Apple App Store) và Android (Google Play)."
  data-description-en="Privacy Policy of the Cảm Âm Chuẩn app on iOS (Apple App Store) and Android (Google Play).">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Chính sách quyền riêng tư - Cảm Âm Chuẩn</title>
  <meta name="description" content="Chính sách quyền riêng tư của ứng dụng Cảm Âm Chuẩn trên iOS (Apple App Store) và Android (Google Play).">
  <script>
    (function () {
      var lang = "vi";
      try {
        var saved = localStorage.getItem("camamchuan.lang");
        if (saved === "vi" || saved === "en") {
          lang = saved;
        } else if ((navigator.language || "vi").toLowerCase().indexOf("en") === 0) {
          lang = "en";
        }
      } catch (error) {}
      document.documentElement.lang = lang;
      document.documentElement.dataset.lang = lang;
    })();
  </script>
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
      flex-wrap: wrap;
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
    .site-nav {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .site-nav a {
      color: #28785b;
      font-size: 14px;
      text-decoration: none;
    }
    .site-nav a:hover { text-decoration: underline; }
    .lang-switch {
      display: inline-flex;
      overflow: hidden;
      border: 1px solid #cfe3da;
      border-radius: 999px;
    }
    .lang-switch button {
      border: 0;
      background: transparent;
      color: #28785b;
      font-size: 13px;
      font-weight: 600;
      padding: 6px 10px;
      cursor: pointer;
    }
    html[data-lang="vi"] .lang-switch [data-set-lang="vi"],
    html[data-lang="en"] .lang-switch [data-set-lang="en"] {
      background: #28785b;
      color: #fff;
    }
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
    html[data-lang="vi"] [data-lang="en"],
    html[data-lang="en"] [data-lang="vi"] { display: none; }
    @media (max-width: 480px) {
      .site-header, main, footer { padding-left: 18px; padding-right: 18px; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <a class="brand" href="./index.html">Cảm Âm Chuẩn</a>
    <nav class="site-nav">
      <a href="./index.html" data-vi="Trang hỗ trợ" data-en="Support">Trang hỗ trợ</a>
      <div class="lang-switch" role="group" aria-label="Language / Ngôn ngữ">
        <button type="button" data-set-lang="vi" aria-pressed="true">VI</button>
        <button type="button" data-set-lang="en" aria-pressed="false">EN</button>
      </div>
    </nav>
  </header>

  <main>
    <section data-lang="vi">
      <article>
${viContent}
      </article>
    </section>
    <section data-lang="en">
      <article>
${enContent}
      </article>
    </section>
  </main>

  <footer>
    © 2026 Cảm Âm Chuẩn · <a href="mailto:${SUPPORT_EMAIL}">${SUPPORT_EMAIL}</a>
  </footer>

  <script src="./assets/lang.js"></script>
</body>
</html>
`;
}

async function main() {
  let policyEn;

  try {
    policyEn = await readFile(EN_POLICY_PATH, "utf8");
  } catch (error) {
    throw new Error(
      `Không đọc được bản dịch tiếng Anh tại content/privacy.en.md: ${error.message}`
    );
  }

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

  if (policyEn.trim().length === 0) {
    throw new Error("Bản dịch tiếng Anh content/privacy.en.md đang trống");
  }

  const normalizePolicy = (text) =>
    text
      .replaceAll("support@camamchuan.vn", SUPPORT_EMAIL)
      .replaceAll("support@camamchuan.com", SUPPORT_EMAIL)
      .replaceAll("https://camamchuan.com", "https://camamchuan.vn");

  const html = pageTemplate(
    markdownToHtml(normalizePolicy(policy)),
    markdownToHtml(normalizePolicy(policyEn))
  );

  await writeFile(OUTPUT_PATH, html, "utf8");
  console.log(`Đã cập nhật ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(`Không thể tạo privacy.html: ${error.message}`);
  process.exitCode = 1;
});
