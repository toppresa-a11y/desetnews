export async function onRequest({env,request}) {
const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
const out=(v,status=200)=>new Response(JSON.stringify(v),{status,headers});
if(!env.NEWS_KV)return out({error:'Unavailable'},503);
if(!['GET','POST'].includes(request.method))return out({error:'Method not allowed'},405);
try{
if(request.method==='POST'){const id=crypto.randomUUID();await env.NEWS_KV.put('pulse-total:'+id,'1',{metadata:{at:Date.now()}});}
let measured=0,recent=0,cursor;const cutoff=Date.now()-300000;
do{const page=await env.NEWS_KV.list({prefix:'pulse-total:',cursor});measured+=page.keys.length;recent+=page.keys.filter(k=>k.metadata?.at>=cutoff).length;cursor=page.list_complete?undefined:page.cursor;}while(cursor);
return out({measured,recent,peak:recent>=20});
}catch{return out({error:'Unavailable'},503);}
}