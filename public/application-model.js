export const statuses=['Student','Working Professional','Founder','Business Owner','Freelancer','Other'];
export const journeys=["I want to build a business but don't know what yet","I have several ideas","I have one idea I want to explore","I am already working on an idea","I have an MVP","I already have customers"];
export const ideaStages=['Idea','Research','Validation','Prototype','MVP','Early Users','Revenue'];
export const reviewStatuses=['NEW','UNDER REVIEW','SHORTLISTED','ACCEPTED','WAITLISTED','REJECTED'];
export const fields=['fullName','email','phone','age','city','currentStatus','college','course','year','company','role','experience','journey','motivation','hasIdea','building','problem','audience','ideaStage','cofounder','interests','goals','program','joinReason','success'];
export function clean(input={}){
 if(!input||typeof input!=='object'||Array.isArray(input))input={};
 const d={};for(const key of fields)d[key]=typeof input[key]==='string'?input[key].trim():'';
 d.confirm=input.confirm===true;
 if(d.currentStatus!=='Student')d.college=d.course=d.year='';
 if(d.currentStatus!=='Working Professional')d.company=d.role=d.experience='';
 if(d.hasIdea==='NOT YET')d.building=d.problem=d.audience=d.ideaStage=d.cofounder='';
 if(d.hasIdea==='YES')d.interests=d.goals='';
 return d;
}
export function recommend(d){return d.hasIdea==='YES'&&(journeys.indexOf(d.journey)>=3||ideaStages.indexOf(d.ideaStage)>=2)?'IGNITE':'SPARK'}
export function validate(d,step){
 const errors={};const need=(key,label,max=1500)=>{if(!d[key])errors[key]=`${label} is required.`;else if(d[key].length>max)errors[key]=`Keep this response under ${max} characters.`};
 const choice=(key,values,label)=>{if(!values.includes(d[key]))errors[key]=`Choose ${label}.`};
 if(!step||step===1){
  need('fullName','Your name',120);need('email','Your email',254);need('phone','Your phone number',30);need('city','Your city',120);choice('currentStatus',statuses,'your current status');
  if(d.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email))errors.email='Enter a valid email address.';
  if(d.phone&&(!/^[+\d\s().-]+$/.test(d.phone)||d.phone.replace(/\D/g,'').length<7||d.phone.replace(/\D/g,'').length>15))errors.phone='Enter a valid phone number, including country code.';
  if(d.age&&(!/^\d{1,3}$/.test(d.age)||+d.age<1||+d.age>120))errors.age='Enter an age between 1 and 120, or leave it blank.';
  if(d.experience&&(!/^\d{1,2}(\.\d)?$/.test(d.experience)||+d.experience>80))errors.experience='Enter years of experience from 0 to 80.';
 }
 if(!step||step===2){choice('journey',journeys,'where you are in your journey');need('motivation','Your motivation');}
 if(!step||step===3){choice('hasIdea',['YES','NOT YET'],'whether you have an idea');if(d.hasIdea==='YES'){need('building','What you are building');need('problem','The problem you want to solve');need('audience','Who it is for');choice('ideaStage',ideaStages,'your current idea stage');choice('cofounder',['Yes','No','Looking for one'],'your co-founder situation');}else if(d.hasIdea==='NOT YET'){need('interests','Your interests');need('goals','What you want to achieve');}}
 if(!step||step===4){choice('program',['SPARK','IGNITE'],'a program');need('joinReason','Why you want to join');need('success','What success looks like');}
 if((!step||step===5)&&!d.confirm)errors.confirm='Please confirm that your information is accurate.';
 for(const key of fields)if(typeof d[key]==='string'&&d[key].length>1500)errors[key]='Keep this response under 1,500 characters.';
 return errors;
}
