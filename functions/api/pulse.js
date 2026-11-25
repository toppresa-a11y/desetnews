export async function onRequestPost({env}) {
const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
if(!env.NEWS_KV)return new Response(JSON.stringify({error:'Unavailable'}),{status:503,headers});
try{
await env.NEWS_KV.put('pulse-total:'+crypto.randomUUID(),'1');
let measured=0,cursor;
do{const page=await env.NEWS_KV.list({prefix:'pulse-total:',cursor});measured+=page.keys.length;cursor=page.list_complete?undefined:page.cursor;}while(cursor);
return new Response(JSON.stringify({count:3768+measured,baseline:3768,measured}),{headers});
}catch{return new Response(JSON.stringify({error:'Unavailable'}),{status:503,headers});}
}