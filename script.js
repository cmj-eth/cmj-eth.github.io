if(!document.querySelector('link[href="motion.css"]')){const motion=document.createElement('link');motion.rel='stylesheet';motion.href='motion.css';document.head.appendChild(motion);}document.querySelectorAll('img[src="logo-ville.png"]').forEach(img=>img.addEventListener('error',()=>{img.src='assets/logo-ville.svg';},{once:true}));const button=document.querySelector('.menu');const header=document.querySelector('.header');button?.addEventListener('click',()=>header.classList.toggle('open'));document.querySelectorAll('nav a').forEach(link=>link.addEventListener('click',()=>header.classList.remove('open')));

const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduceMotion){
 document.documentElement.classList.add('motion-ok');
 const revealTargets=document.querySelectorAll('.section,.page-wrap .panel,.event-card,.project-grid article,.news article,.idea,.org-level,.calendar-item,.reveal');
 revealTargets.forEach(el=>el.classList.add('reveal-item'));
 const io=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');io.unobserve(entry.target);}})},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
 revealTargets.forEach(el=>io.observe(el));
 const hero=document.querySelector('.hero-card');
 if(hero){window.addEventListener('pointermove',e=>{if(window.innerWidth<900)return;const x=(e.clientX/window.innerWidth-.5)*4;const y=(e.clientY/window.innerHeight-.5)*-4;hero.style.transform=`rotate(1deg) translate3d(${x}px,${y}px,0)`},{passive:true});}
}
