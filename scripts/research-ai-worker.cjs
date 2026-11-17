#!/usr/bin/env node
// Research-only AI worker. Never modifies authoritative restaurant records.
const fs=require('node:fs');
const key=process.env.OPENAI_API_KEY;
if(!key){console.log('BLOCKED: OPENAI_API_KEY repository secret is not configured. No API call made.');process.exit(0)}
const data=JSON.parse(fs.readFileSync('data/eateries.json','utf8'));
const target=data.find(x=>x.id===process.env.RESTAURANT_ID)||data.find(x=>x.id!=='MBA-DINE-0001'&&!x.diningDetails);
if(!target){console.log('No pending restaurants');process.exit(0)}
const prompt='Research this restaurant using web search. Return ONLY JSON with keys id, restaurant, checkedOn, proposedFields (object), evidence (array of {field,sourceUrl,note}), unresolved (array). Never invent facts. Use official operator sources first. Do not include photos. Restaurant: '+JSON.stringify({id:target.id,name:target.name,address:target.address,city:target.city,website:target.website,existingHours:target.hours});
const resp=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.RESEARCH_MODEL||'gpt-4.1-mini',tools:[{type:'web_search_preview'}],input:prompt,max_output_tokens:1600})});
const raw=await resp.text();if(!resp.ok)throw Error('Research API HTTP '+resp.status+': '+raw.slice(0,350));
const obj=JSON.parse(raw);const text=(obj.output||[]).filter(x=>x.type==='message').flatMap(x=>x.content||[]).filter(x=>x.type==='output_text').map(x=>x.text).join('\n');
const match=text.match(/\{[\s\S]*\}/);if(!match)throw Error('No structured research JSON returned');
const proposal=JSON.parse(match[0]);if(proposal.id!==target.id||!Array.isArray(proposal.evidence)||!Array.isArray(proposal.unresolved)||!proposal.proposedFields||typeof proposal.proposedFields!=='object')throw Error('Invalid research proposal structure');
const output={status:'unreviewed-research-proposal',generatedOn:new Date().toISOString(),model:process.env.RESEARCH_MODEL||'gpt-4.1-mini',...proposal};
fs.mkdirSync('research-output',{recursive:true});fs.writeFileSync('research-output/ai-proposal-'+target.id+'.json',JSON.stringify(output,null,2)+'\n');
console.log('Generated UNREVIEWED proposal for '+target.id+'; no production data changed.');
