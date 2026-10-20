// 智能问答
document.addEventListener("DOMContentLoaded", () => {
  addMessage("qa-messages", "你好！我是智能助手小智~ 可以问我商品信息、优惠活动、配送规则等问题。如果是售后问题，记得找售后客服哦 😊", "bot", "🤖");
});

async function sendQA() {
  const input = document.getElementById("qa-input");
  const text = input.value.trim();
  if (!text) return;

  input.value = "";
  addMessage("qa-messages", text, "user", "👤");
  showTyping("qa-messages");

  try {
    const res = await fetch(API_BASE + "/api/general-qa/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    });
    const data = await res.json();
    hideTyping();
    addMessage("qa-messages", data.reply, "bot", "🤖");
  } catch (err) {
    hideTyping();
    addMessage("qa-messages", "网络连接失败，请确认后端服务是否启动。", "bot", "🤖");
  }
}
