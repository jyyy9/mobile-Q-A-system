async function startCompare() {
  const phone1 = document.getElementById("phone1").value.trim();
  const phone2 = document.getElementById("phone2").value.trim();
  const btn = document.getElementById("compare-btn");
  const output = document.getElementById("compare-output");

  if (!phone1 || !phone2) {
    output.innerHTML = '<div class="compare-raw">请填写两个手机型号</div>';
    return;
  }

  btn.disabled = true;
  btn.textContent = "\u5BF9\u6BD4\u4E2D...";
  output.innerHTML = '<div class="compare-raw">\u6B63\u5728\u751F\u6210\u5BF9\u6BD4\uFF0C\u8BF7\u7A0D\u5019...</div>';

  try {
    const res = await fetch(API_BASE + "/api/compare/phones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone1, phone2 })
    });
    const data = await res.json();

    if (data.phone1 && data.phone2) {
      // 解析器返回的结构化数据 → 渲染表格
      renderCompareTable(output, data.phone1.name, data.phone2.name, data.phone1, data.phone2);
    } else if (data.raw) {
      // 看看是不是 Markdown 表格
      if (data.raw.includes("|") && data.raw.includes("---")) {
        output.innerHTML = renderMarkdownTable(data.raw);
      } else {
        output.innerHTML = '<div class="compare-raw">' + escapeHtml(data.raw) + '</div>';
      }
    } else {
      output.innerHTML = '<div class="compare-raw">\u8FD4\u56DE\u6570\u636E\u683C\u5F0F\u5F02\u5E38\uFF0C\u8BF7\u91CD\u8BD5</div>';
    }
  } catch (err) {
    output.innerHTML = '<div class="compare-raw">\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25\uFF0C\u8BF7\u786E\u8BA4\u540E\u7AEF\u670D\u52A1\u662F\u5426\u542F\u52A8\u3002</div>';
  }

  btn.disabled = false;
  btn.textContent = "\u5F00\u59CB\u5BF9\u6BD4";
}

/**
 * 渲染结构化手机对比表格
 */
function renderCompareTable(container, name1, name2, p1, p2) {
  const data1 = p1.specs || p1;
  const data2 = p2.specs || p2;

  const allKeys = new Set();
  for (const key in data1) allKeys.add(key);
  for (const key in data2) allKeys.add(key);

  let html = '<table class="compare-table">';
  html += "<tr><th>\u53C2\u6570</th><th>" + escapeHtml(name1) + "</th><th>" + escapeHtml(name2) + "</th></tr>";

  for (const key of allKeys) {
    const v1 = formatValue(data1[key]);
    const v2 = formatValue(data2[key]);
    const highlight = v1 !== v2 ? ' class="highlight"' : "";
    html += "<tr>"
         + '<td class="param-name">' + escapeHtml(key) + "</td>"
         + "<td" + highlight + ">" + escapeHtml(v1) + "</td>"
         + "<td" + highlight + ">" + escapeHtml(v2) + "</td>"
         + "</tr>";
  }

  html += "</table>";
  container.innerHTML = html;
}

/**
 * 将 Markdown 表格转为 HTML 表格
 */
function renderMarkdownTable(text) {
  const lines = text.split("\n").filter(l => l.trim().startsWith("|"));
  if (lines.length < 2) return "<div class=\"compare-raw\">" + escapeHtml(text) + "</div>";

  let html = '<table class="compare-table">';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes("---")) continue; // 跳过分隔行
    const cols = line.split("|").filter(c => c.trim().length > 0);
    if (cols.length === 0) continue;

    const tag = i === 0 ? "th" : "td";
    html += "<tr>";
    for (const col of cols) {
      html += "<" + tag + ">" + escapeHtml(col.trim()) + "</" + tag + ">";
    }
    html += "</tr>";
  }
  html += "</table>";
  return html;
}

function formatValue(val) {
  if (val === null || val === undefined) return "-";
  if (typeof val === "string") return val || "-";
  if (typeof val === "object") {
    if (Array.isArray(val)) return val.join("\u3001") || "-";
    return Object.entries(val)
      .map(function(e) { return e[0] + ": " + e[1]; })
      .join("\uFF1B") || "-";
  }
  return String(val);
}

function escapeHtml(text) {
  var div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
