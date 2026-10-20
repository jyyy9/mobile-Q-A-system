function addMessage(containerId, text, role, avatar) {
  const container = document.getElementById(containerId);
  const div = document.createElement("div");
  div.className = "message " + role;
  div.innerHTML = '<span class="message-avatar">' + avatar + '</span><div class="message-bubble">' + text + '</div>';
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTyping(containerId) {
  const container = document.getElementById(containerId);
  const div = document.createElement("div");
  div.id = "typing-indicator";
  div.className = "typing-indicator";
  div.innerHTML = "<span></span><span></span><span></span>";
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function hideTyping() {
  const el = document.getElementById("typing-indicator");
  if (el) el.remove();
}

// 售后咨询
document.addEventListener("DOMContentLoaded", () => {
  addMessage("after-sales-messages", "您好！我是售后客服小帮，请问有什么售后问题需要帮您解决？😊", "bot", "🧑‍💼");
});

async function sendAfterSales() {
  const input = document.getElementById("after-sales-input");
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  addMessage("after-sales-messages", text, "user", "👤");
  showTyping("after-sales-messages");

  try {
    const res = await fetch(API_BASE + "/api/after-sales/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    hideTyping();
    addMessage("after-sales-messages", data.reply, "bot", "🧑‍💼");
  } catch (err) {
    hideTyping();
    addMessage("after-sales-messages", "网络连接失败，请确认后端服务是否启动。", "bot", "🧑‍💼");
  }
}
