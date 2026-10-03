/* アシスト労務：通知を受け取る係（サービスワーカー）
   本社の「通知を送る係」から届いた知らせを、アプリが閉じていても必ずスマホの画面に出します。
   ・届く内容（data）：title（題名）, body（本文）, url（タップで開く先）, tag（まとめる印）, badge（アイコンの数字）
   ・iPhoneは「届いたのに通知を出さない」ことが何度かあると通知が止められてしまうため、
     どんな内容が届いても、かならず通知を1つ出す作りにしています。 */

self.addEventListener("install", () => { self.skipWaiting(); });
self.addEventListener("activate", (event) => { event.waitUntil(self.clients.claim()); });

self.addEventListener("push", (event) => {
  let d = {};
  try {
    const p = event.data ? event.data.json() : {};
    d = (p && p.data) || (p && p.notification) || p || {};
  } catch (e) {
    d = {};
  }

  const title = d.title || "アシスト労務";
  const options = {
    body: d.body || "新しいお知らせがあります",
    icon: "icon-192.png",
    lang: "ja",
    data: { url: d.url || "assist-roumu.html" }
  };
  if (d.tag) { options.tag = d.tag; options.renotify = true; }

  const jobs = [self.registration.showNotification(title, options)];

  // アイコンの赤い数字（対応している端末のみ）
  const n = parseInt(d.badge, 10);
  if (n > 0 && self.navigator && typeof self.navigator.setAppBadge === "function") {
    jobs.push(Promise.resolve().then(() => self.navigator.setAppBadge(n)).catch(() => {}));
  }
  event.waitUntil(Promise.all(jobs));
});

// 通知をタップしたとき：すでに開いているアプリがあればそこへ、なければ開く
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "assist-roumu.html", self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.indexOf(self.registration.scope) === 0 && "focus" in c) return c.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
