const API_BASE = "http://localhost:3002";

function showView(viewName) {
  document.querySelectorAll(".view").forEach(v => v.style.display = "none");
  if (viewName === "home") {
    document.getElementById("home-view").style.display = "block";
  } else {
    document.getElementById(viewName + "-view").style.display = "block";
  }
}

// 页面加载默认显示主页
document.addEventListener("DOMContentLoaded", () => showView("home"));
