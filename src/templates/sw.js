/**
 * Welcome to your Workbox-powered service worker!
 *
 * You'll need to register this file in your web app and you should
 * disable HTTP caching for this file too.
 * See https://goo.gl/nhQhGp
 *
 * The rest of the code is auto-generated. Please don't update this file
 * directly; instead, make changes to your Workbox build configuration
 * and re-run your build process.
 * See https://goo.gl/2aRDsh
 */

importScripts("https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js");

workbox.core.setCacheNameDetails({prefix: "blox"});

workbox.core.skipWaiting();

workbox.core.clientsClaim();

/**
 * The workboxSW.precacheAndRoute() method efficiently caches and responds to
 * requests for URLs in the manifest.
 * See https://goo.gl/S9QRab
 */
self.__precacheManifest = [
  {
    "url": "admin/index.html",
    "revision": "6f237cfd95eb681a6a3d8e4bac6dd51b"
  },
  {
    "url": "css/styles.min.css",
    "revision": "852bfc99720a85e682f8b79cc8e21118"
  },
  {
    "url": "docs/index.html",
    "revision": "8e4290770f4a305ff3f5c26acf8ea46d"
  },
  {
    "url": "features/5cbeeb82d6c259083900c5a3/index.html",
    "revision": "30e9f735e7092b81cf88ce2ec120d609"
  },
  {
    "url": "features/5cbeeb82d6c259083900c5a5/index.html",
    "revision": "25985436b3a28935fd009de4aa43e0da"
  },
  {
    "url": "features/5cbeeb82d6c259083900c5a7/index.html",
    "revision": "d798ff721af0cb5576951a87607f5917"
  },
  {
    "url": "features/index.html",
    "revision": "1299d1a5219653caf434b74dbff80355"
  },
  {
    "url": "index.html",
    "revision": "a8b6d079b0d5889f4ae7ef617a05f231"
  },
  {
    "url": "js/bundle.min.js",
    "revision": "91bfd731053f73a1f3932211906e4df9"
  },
  {
    "url": "/features",
    "revision": "5347e888b64090a2c0a08266cdead198"
  }
].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {
  "ignoreURLParametersMatching": [/./]
});

workbox.routing.registerRoute(/(?:\/)$/, new workbox.strategies.StaleWhileRevalidate({ "cacheName":"html", plugins: [new workbox.expiration.Plugin({ maxAgeSeconds: 604800, purgeOnQuotaError: false })] }), 'GET');
workbox.routing.registerRoute(/\.(?:png|jpg|jpeg|gif|bmp|webp|svg|ico)$/, new workbox.strategies.CacheFirst({ "cacheName":"images", plugins: [new workbox.expiration.Plugin({ maxEntries: 1000, maxAgeSeconds: 31536000, purgeOnQuotaError: false })] }), 'GET');
workbox.routing.registerRoute(/\.(?:mp3|wav|m4a)$/, new workbox.strategies.CacheFirst({ "cacheName":"audio", plugins: [new workbox.expiration.Plugin({ maxEntries: 1000, maxAgeSeconds: 31536000, purgeOnQuotaError: false })] }), 'GET');
workbox.routing.registerRoute(/\.(?:m4v|mpg|avi)$/, new workbox.strategies.CacheFirst({ "cacheName":"videos", plugins: [new workbox.expiration.Plugin({ maxEntries: 1000, maxAgeSeconds: 31536000, purgeOnQuotaError: false })] }), 'GET');

workbox.googleAnalytics.initialize({});
