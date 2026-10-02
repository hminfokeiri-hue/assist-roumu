/* アシスト労務：通知を受け取る係（サービスワーカー）
   - アプリを閉じていても、本社のサーバーから届いた通知をスマホの画面に出します
   - 通知の中身（data）の決まり： title（題名）, body（本文）, url（タップで開く先）, badge（アイコンの数字） */
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyD1bprw7Xb6ZisnOkRKMlul_iW-rLvzf28",
  authDomain: "assist-roumu.firebaseapp.com",
  projectId: "assist-roumu",
  storageBucket: "assist-roumu.firebasestorage.app",
  messagingSenderId: "919904591114",
  appId: "1:919904591114:web:33d30e66ea4264e081eef3"
});

const messaging = firebase.messaging();

// 通知が届いたとき（アプリが閉じている・裏にいるとき）
messaging.onBackgroundMessage((payload) => {
  const d = (payload && payload.data) || {};
  const options = {
    body: d.body || "",
    icon: "icon-192.png",
    data: { url: d.url || "assist-roumu.html" }
  };
  if (d.tag) options.tag = d.tag;
  self.registration.showNotification(d.title || "アシスト労務", options);
  // アイコンの赤い数字
  const n = parseInt(d.badge, 10);
  if (n > 0 && self.navigator && self.navigator.setAppBadge) {
    try { self.navigator.setAppBadge(n).catch(() => {}); } catch (e) { /* ignore */ }
  }
});

// 通知をタップしたとき：すでに開いているアプリがあればそこへ、なければ開く
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "assist-roumu.html", self.registration.scope).href;
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.indexOf(self.registration.scope) === 0 && "focus" in c) return c.focus();
      }
      return clients.openWindow(target);
    })
  );
});
