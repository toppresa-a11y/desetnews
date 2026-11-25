export async function onRequestPost({env}) {
const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
if(!env.NEWS_KV)return new Response(JSON.stringify({error:'Unavailable'}),{status:503,headers});
try{
const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Sofia',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const key='pulse:'+day+':'+crypto.randomUUID();
await env.NEWS_KV.put(key,'1',{expirationTtl:172800});
let count=0,cursor;
do{const page=await env.NEWS_KV.list({prefix:'pulse:'+day+':',cursor});count+=page.keys.length;cursor=page.list_complete?undefined:page.cursor;}while(cursor);
return new Response(JSON.stringify({count}),{headers});
}catch{return new Response(JSON.stringify({error:'Unavailable'}),{status:503,headers});}
}