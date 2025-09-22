(() => {
  const cats = ["jobs","marketplace","portfolio","real-estate","blog-&-magazine","saas-dashboard","education","food-&-restaurant","travel","events"];
  const sizeMap = { hero:"1600x900", wide:"1400x800", card:"1000x700", thumb:"700x500" };
  const pick = (arr) => arr[Math.floor(Math.random()*arr.length)];
  const isBlank = (src) => !src || /placeholder|dummy|blank|^data:image\/svg\+xml/i.test(src);

  const fileFor = (w) => {
    let key = "thumb";
    if (w >= 1100) key = "hero";
    else if (w >= 900) key = "wide";
    else if (w >= 700) key = "card";
    const cat = pick(cats);
    const num = ("0"+(cats.indexOf(cat)+1)).slice(-2);
    const dim = sizeMap[key];
    return ${num}---.jpg;
  };

  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("img").forEach(img => {
      const src = img.getAttribute("src") || "";
      if (isBlank(src)) {
        const w = img.getAttribute("width") || img.clientWidth || 800;
        img.src = ../_shared/img/;
        img.loading = img.loading || "lazy";
        img.referrerPolicy = "no-referrer";
      }
    });
  });
})();
