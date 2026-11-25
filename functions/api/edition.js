export async function onRequest({request,env}) {
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'};
const out=(v,status=200)=>new Response(JSON.stringify(v),{status,headers});
if(request.method==='GET' && !new URL(request.url).searchParams.has('admin')){
const data=env.NEWS_KV && await env.NEWS_KV.get('published');
return data?new Response(data,{headers}):fetch(new URL('/edition.json',request.url));
}
if(!env.ADMIN_PASSWORD||!env.NEWS_KV)return out({error:'Не са настроени NEWS_KV и ADMIN_PASSWORD.'},503);
if(request.headers.get('Authorization')!=='Bearer '+env.ADMIN_PASSWORD)return out({error:'Невалидна парола.'},401);
if(request.method==='GET'){
const draft=await env.NEWS_KV.get('draft')||await env.NEWS_KV.get('published');
return draft?new Response(draft,{headers}):fetch(new URL('/edition.json',request.url));
}
if(request.method!=='POST')return out({error:'Method not allowed'},405);
try{
const d=await request.json();
if(!Array.isArray(d.articles)||d.articles.length!==10||typeof d.label!=='string')return out({error:'Необходими са 10 материала.'},400);
for(const a of d.articles){for(const k of ['category','title','summary','body'])if(typeof a[k]!=='string')return out({error:'Невалиден материал.'},400);if(a.image&&!/^data:image\/(jpeg|png|webp);base64,|^https:\/\/|^\/(?!\/)|^[\w.-]+\.(webp|jpg|jpeg|png)$/i.test(a.image))return out({error:'Невалидна снимка.'},400);}
const publish=d.publish===true;delete d.publish;const raw=JSON.stringify(d);
if(new TextEncoder().encode(raw).length>20*1024*1024)return out({error:'Броят е прекалено голям.'},413);
if(publish){if(d.articles.some(a=>!a.title.trim()||!a.body.trim()))return out({error:'Попълни заглавие и текст на всеки материал.'},400);const old=await env.NEWS_KV.get('published');if(old)await env.NEWS_KV.put('archive:'+Date.now(),old);await env.NEWS_KV.put('published',raw);}
await env.NEWS_KV.put('draft',raw);return out({ok:true});
}catch(e){return out({error:'Грешка при запис.'},500);}
}