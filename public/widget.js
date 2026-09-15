/*
 * ChatDesk website widget.
 * Add to any website, just before </body>:
 *   <script src="https://YOUR-APP-URL/widget.js" data-bot="BOT_ID" async></script>
 */
(function () {
  var script = document.currentScript;
  if (!script || window.__chatdeskLoaded) return;
  var botId = script.getAttribute("data-bot");
  if (!botId) return console.warn("[ChatDesk] data-bot attribute is missing");
  window.__chatdeskLoaded = true;

  var origin = new URL(script.src).origin;
  // Each company picks its own brand color in the dashboard; data-color on the script tag overrides it.
  var colorOverride = script.getAttribute("data-color");
  var color = colorOverride || "#1e2a3a";
  var isOpen = false;
  var frame = null;

  var chatIcon =
    '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C6.5 3 2 6.9 2 11.7c0 2.4 1.1 4.6 3 6.2L4.2 21l3.9-1.9c1.2.4 2.5.6 3.9.6 5.5 0 10-3.9 10-8.7S17.5 3 12 3z"/></svg>';
  var closeIcon =
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  var button = document.createElement("button");
  button.setAttribute("aria-label", "Open chat");
  button.innerHTML = chatIcon;
  Object.assign(button.style, {
    position: "fixed", right: "20px", bottom: "20px", width: "60px", height: "60px",
    borderRadius: "50%", border: "none", cursor: "pointer", color: "#fff", background: color,
    boxShadow: "0 6px 20px rgba(0,0,0,.25)", zIndex: "2147483000",
    display: "flex", alignItems: "center", justifyContent: "center", transition: "transform .2s",
  });
  button.onmouseenter = function () { button.style.transform = "scale(1.07)"; };
  button.onmouseleave = function () { button.style.transform = "scale(1)"; };

  function layoutFrame() {
    if (!frame) return;
    var mobile = window.innerWidth < 480;
    Object.assign(frame.style, mobile
      ? { right: "0", bottom: "0", width: "100%", height: "100%", borderRadius: "0" }
      : { right: "20px", bottom: "92px", width: "380px", height: "min(620px, calc(100vh - 112px))", borderRadius: "16px" });
  }

  function createFrame() {
    frame = document.createElement("iframe");
    frame.title = "Chat";
    frame.src = origin + "/embed/" + encodeURIComponent(botId) + "?widget=1&page=" + encodeURIComponent(location.href);
    Object.assign(frame.style, {
      position: "fixed", border: "none", background: "#fff", zIndex: "2147483001",
      boxShadow: "0 12px 40px rgba(0,0,0,.25)", display: "none",
    });
    layoutFrame();
    document.body.appendChild(frame);
  }

  function toggle(open) {
    isOpen = open;
    if (open && !frame) createFrame();
    if (frame) frame.style.display = open ? "block" : "none";
    button.innerHTML = open ? closeIcon : chatIcon;
    button.setAttribute("aria-label", open ? "Close chat" : "Open chat");
    // On phones the chat covers the screen and has its own close button.
    button.style.display = open && window.innerWidth < 480 ? "none" : "flex";
  }

  button.onclick = function () { toggle(!isOpen); };
  window.addEventListener("resize", layoutFrame);
  window.addEventListener("message", function (event) {
    if (event.origin === origin && event.data === "chatdesk:close") toggle(false);
  });

  // Show the bubble only once the company's own color is known, so it never flashes a default color.
  var shown = false;
  function show() {
    if (shown) return;
    shown = true;
    if (document.body) document.body.appendChild(button);
    else document.addEventListener("DOMContentLoaded", function () { document.body.appendChild(button); });
  }

  if (colorOverride) show();
  else {
    setTimeout(show, 4000); // slow network: show with the fallback color
    fetch(origin + "/api/bots/" + encodeURIComponent(botId))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (bot) {
        if (bot && /^#[0-9a-f]{6}$/i.test(bot.color)) button.style.background = bot.color;
        show();
      })
      .catch(show);
  }
})();
