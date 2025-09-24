
(function(){
  const $ = sel => document.querySelector(sel);
  const navToggle = $('#navToggle');
  const mobileMenu = $('#mobileMenu');
  const themeToggle = $('#themeToggle');

  // Mobile nav
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const open = mobileMenu.getAttribute('data-open') === 'true';
      mobileMenu.setAttribute('data-open', String(!open));
      mobileMenu.style.display = open ? 'none' : 'block';
    });
  }

  // Theme
  const lsKey = 'aurora-theme';
  function setTheme(mode){
    if(mode === 'dark'){
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    localStorage.setItem(lsKey, mode);
  }
  const saved = localStorage.getItem(lsKey);
  if(saved){ setTheme(saved); }
  if(themeToggle){
    themeToggle.addEventListener('click', ()=>{
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'light' : 'dark');
    });
  }

  // Smooth anchor offset for sticky nav
  const hash = location.hash;
  if(hash){
    const el = document.querySelector(hash);
    if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
  }
})();
