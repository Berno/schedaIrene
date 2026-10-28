"use strict";
const VERSION="2.1.0";
const PREFIX="irene-bb-"+encodeURIComponent(new URL(self.registration.scope).pathname)+"-";
const CACHE=PREFIX+VERSION;
const ASSETS=["./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",event=>{event.waitUntil((async()=>{const cache=await caches.open(CACHE);for(const path of ASSETS){const request=new Request(new URL(path,self.registration.scope),{cache:"reload"});const response=await fetch(request);if(!response.ok)throw new Error("Precache failed");await cache.put(new URL(path,self.registration.scope).href,response);}await self.skipWaiting();})());});
self.addEventListener("activate",event=>{event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith(PREFIX)&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();})());});
self.addEventListener("message",event=>{if(event.data?.type==="SKIP_WAITING")self.skipWaiting();});
self.addEventListener("fetch",event=>{
 const request=event.request,url=new URL(request.url);if(request.method!=="GET"||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
 if(request.mode==="navigate"||url.pathname.endsWith("/index.html")){
  event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const response=await fetch(request,{cache:"no-store"});if(!response.ok)throw new Error("Network error");await cache.put(new URL("./index.html",self.registration.scope).href,response.clone());return response;}catch(e){return await cache.match(new URL("./index.html",self.registration.scope).href)||new Response("Apri l’app online una prima volta.",{status:503,headers:{"Content-Type":"text/plain;charset=utf-8"}});}})());return;
 }
 if(ASSETS.some(path=>new URL(path,self.registration.scope).pathname===url.pathname))event.respondWith((async()=>{const cache=await caches.open(CACHE),cached=await cache.match(request,{ignoreSearch:true});if(cached)return cached;return fetch(request);})());
});
