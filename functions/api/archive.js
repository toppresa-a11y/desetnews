export async function onRequestGet({request,env}){
const out=(v,status=200)=>new Response(JSON.stringify(v),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
if(!env.NEWS_KV)return out({error:'Архивът е недостъпен.'},503);
try{const q=new URL(request.url).searchParams;const id=q.get('id');
if(id){if(!/^\d{13}$/.test(id))return out({error:'Невалиден брой.'},400);const raw=await env.NEWS_KV.get('archive:'+id);return raw?out(JSON.parse(raw)):out({error:'Броят не е намерен.'},404);}
let cursor,keys=[];do{const page=await env.NEWS_KV.list({prefix:'archive:',cursor});keys.push(...page.keys);cursor=page.list_complete?undefined:page.cursor;}while(cursor);
return out({editions:keys.map(k=>k.name.slice(8)).filter(id=>/^\d{13}$/.test(id)).sort().reverse()});
}catch(e){return out({error:'Грешка при зареждане на архива.'},500);}
}