(function(){
  function formatTime(seconds){
    if(!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds/60);
    const s = Math.floor(seconds%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  }

  // safe DOM helper
  function el(tag, cls, inner){
    const e = document.createElement(tag);
    if(cls) e.className = cls;
    if(inner !== undefined) e.innerHTML = inner;
    return e;
  }

  window.MMHelpers = { formatTime, el };
})();
