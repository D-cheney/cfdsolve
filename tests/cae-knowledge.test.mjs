import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseKnowledgeTemplate } from "../server/services/knowledge-importer.ts";

const root = new URL("../templates/knowledge/library/", import.meta.url);
const folders = [
  "10-cae-algorithm-map",
  "11-structural-fem",
  "12-solvers-time",
  "13-physics-discretization",
  "14-multiphysics-coupling",
  "15-optimization-uq-rom",
];
const files = folders.flatMap((folder) => {
  const directory = new URL(`${folder}/`, root);
  return readdirSync(directory)
    .filter((name) => name.endsWith(".md") && name !== "README.md")
    .map((name) => ({ folder, name, url: new URL(name, directory) }));
});

assert.equal(files.length, 19, "CAE 算法新增知识块数量发生变化时，应同步更新覆盖审计");

const articles = files.map(({ folder, name, url }) => {
  const source = readFileSync(url, "utf8");
  const article = parseKnowledgeTemplate(source, join(folder, name));
  assert.equal(article.status, "PUBLISHED");
  assert.ok(article.headings.length >= 5, `${article.slug} 缺少分层推导结构`);
  assert.match(article.markdown, /## \d+\. 参考资料/u, `${article.slug} 缺少参考资料`);
  assert.ok((article.markdown.match(/\$\$/g) || []).length >= 2, `${article.slug} 缺少独立推导公式`);
  assert.ok(article.html.includes("class=\"katex"), `${article.slug} 未生成 KaTeX`);
  assert.ok(article.html.includes("<math"), `${article.slug} 未生成 MathML`);
  return article;
});

assert.equal(new Set(articles.map((item) => item.slug)).size, articles.length);
assert.equal(new Set(articles.map((item) => item.category.slug)).size, 6);

const taxonomy = articles.find((item) => item.slug === "cae-algorithm-taxonomy");
assert.ok(taxonomy);
for (const keyword of [
  "FDM", "FVM", "FEM", "DG", "BEM", "LBM", "SPH", "DEM", "MPM",
  "结构", "电磁", "声学", "多体", "多物理", "优化", "不确定性", "降阶",
]) {
  assert.ok(taxonomy.markdown.includes(keyword), `CAE 算法全景图缺少 ${keyword}`);
}

console.log(`CAE knowledge audit passed: ${articles.length} articles, 6 categories, formulas and references verified`);
