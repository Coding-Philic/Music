// script.js - main app logic
(function(){
  const content = document.getElementById("page-content");
  const pageTitle = document.getElementById("page-title");
  const navBtns = Array.from(document.querySelectorAll(".nav-btn"));
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  // Player elements
  const audio = document.getElementById("audio");
  const playerImg = document.getElementById("player-img");
  const playerTitle = document.getElementById("player-title");
  const playerArtist = document.getElementById("player-artist");
  const playBtn = document.getElementById("play-btn");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const seek = document.getElementById("seek");
  const currentTime = document.getElementById("current-time");
  const duration = document.getElementById("duration");
  const volume = document.getElementById("volume");

  let songs = [];
  let currentIndex = 0;
  let isPlaying = false;
  let recentlyPlayed = JSON.parse(localStorage.getItem("mm_recent_v1") || "[]");

  // Navigation
  navBtns.forEach(btn=>{
    btn.addEventListener("click", () => {
      navBtns.forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      const page = btn.dataset.page;
      showPage(page);
    });
  });

  searchBtn.addEventListener("click", () => {
    const q = searchInput.value.trim();
    if(!q) return showPage("home");
    showSearchResults(q);
  });

  searchInput.addEventListener("keyup", (e)=> {
    if(e.key === "Enter") searchBtn.click();
  });

  // Player event listeners
  audio.addEventListener("timeupdate", () => {
    if(audio.duration){
      const percent = (audio.currentTime / audio.duration) * 100;
      seek.value = percent;
      currentTime.innerText = MMHelpers.formatTime(audio.currentTime);
      duration.innerText = MMHelpers.formatTime(audio.duration);
    }
  });

  seek.addEventListener("input", ()=>{
    if(!audio.duration) return;
    const val = seek.value;
    audio.currentTime = (val/100) * audio.duration;
  });

  playBtn.addEventListener("click", togglePlay);
  prevBtn.addEventListener("click", prevSong);
  nextBtn.addEventListener("click", nextSong);
  volume.addEventListener("input", ()=> audio.volume = volume.value);

  audio.addEventListener("ended", () => {
    nextSong();
  });

  // Utilities to render songs
  function createSongCard(song, idx){
    const card = MMHelpers.el("div","card");
    const img = MMHelpers.el("img");
    img.src = song.img || "assets/images/demo1.jpg";
    const meta = MMHelpers.el("div","meta");
    const title = MMHelpers.el("h3",null,song.title);
    const artist = MMHelpers.el("p",null,song.artist || "Unknown Artist");
    meta.appendChild(title);
    meta.appendChild(artist);

    const actions = MMHelpers.el("div","actions");
    const playBtn = MMHelpers.el("button","icon-btn","▶");
    playBtn.title = "Play";
    playBtn.addEventListener("click", (ev)=>{
      ev.stopPropagation();
      playByIndex(idx);
    });

    const favBtn = MMHelpers.el("button","icon-btn", MMLS.isFav(song.id) ? "♥" : "♡");
    favBtn.title = "Favourite";
    favBtn.addEventListener("click", (ev)=>{
      ev.stopPropagation();
      MMLS.toggleFav(song.id);
      favBtn.innerText = MMLS.isFav(song.id) ? "♥" : "♡";
    });

    const addPlBtn = MMHelpers.el("button","icon-btn","+PL");
    addPlBtn.title = "Add to Playlist";
    addPlBtn.addEventListener("click", (ev)=>{
      ev.stopPropagation();
      showAddToPlaylistModal(song.id);
    });

    actions.appendChild(playBtn);
    actions.appendChild(favBtn);
    actions.appendChild(addPlBtn);

    card.appendChild(img);
    card.appendChild(meta);
    card.appendChild(actions);

    card.addEventListener("dblclick", ()=> playByIndex(idx));

    return card;
  }

  // Pages
  function showPage(page){
    pageTitle.innerText = {
      home: "Home",
      favs: "Favourites",
      playlists: "Playlists",
      "create-playlist": "Create Playlist",
      search: "Search"
    }[page] || "Home";

    content.innerHTML = "";

    if(page === "home"){
      renderHome();
    } else if(page === "favs"){
      renderFavs();
    } else if(page === "playlists"){
      renderPlaylists();
    } else if(page === "create-playlist"){
      renderCreatePlaylist();
    } else if(page === "search"){
      renderSearch();
    } else {
      renderHome();
    }
  }

  function renderHome(){
    // Recently played
    const recTitle = MMHelpers.el("h2",null,"Recently Played");
    content.appendChild(recTitle);
    const recGrid = MMHelpers.el("div","grid");
    if(recentlyPlayed.length === 0){
      const p = MMHelpers.el("p",null,"No recently played songs.");
      content.appendChild(p);
    } else {
      recentlyPlayed.slice().reverse().forEach(id => {
        const s = songs.find(x=>x.id===id);
        if(s) content.appendChild(createSongCard(s, songs.indexOf(s)));
      });
    }

    const allTitle = MMHelpers.el("h2",null,"All Songs");
    content.appendChild(allTitle);

    if(songs.length === 0){
      content.appendChild(MMHelpers.el("p",null,"No songs available. Use Admin to add songs."));
    } else {
      songs.forEach((s,i) => {
        content.appendChild(createSongCard(s,i));
      });
    }
  }

  function renderFavs(){
    const favs = MMLS.getFavs();
    if(favs.length === 0){
      content.appendChild(MMHelpers.el("p",null,"No favourite songs yet."));
      return;
    }
    favs.forEach(id => {
      const s = songs.find(x=>x.id===id);
      if(s) content.appendChild(createSongCard(s, songs.indexOf(s)));
    });
  }

  function renderPlaylists(){
    const pls = MMLS.getPlaylists();
    const wrapper = MMHelpers.el("div","playlists-wrapper");
    const createBtn = MMHelpers.el("button",null,"Create New Playlist");
    createBtn.addEventListener("click", ()=> {
      const name = prompt("Playlist name?");
      if(name) {
        MMLS.createPlaylist(name);
        renderPlaylists();
      }
    });
    content.appendChild(createBtn);
    if(pls.length === 0){
      content.appendChild(MMHelpers.el("p",null,"No playlists yet. Create one."));
      return;
    }

    pls.forEach(pl => {
      const plCard = MMHelpers.el("div","card");
      const info = MMHelpers.el("div","meta");
      info.appendChild(MMHelpers.el("h3",null,pl.name));
      info.appendChild(MMHelpers.el("p",null,`${pl.songs.length} songs`));
      plCard.appendChild(info);

      const actions = MMHelpers.el("div","actions");
      const viewBtn = MMHelpers.el("button","icon-btn","View");
      viewBtn.addEventListener("click", ()=> {
        showPlaylistDetail(pl.id);
      });
      const delBtn = MMHelpers.el("button","icon-btn","Delete");
      delBtn.addEventListener("click", ()=> {
        if(confirm("Delete playlist?")) {
          const plsAll = MMLS.getPlaylists().filter(x=>x.id!==pl.id);
          MMLS.savePlaylists(plsAll);
          renderPlaylists();
        }
      });
      actions.appendChild(viewBtn);
      actions.appendChild(delBtn);
      plCard.appendChild(actions);

      content.appendChild(plCard);
    });
  }

  function renderCreatePlaylist(){
    const box = MMHelpers.el("div","card");
    const nameInput = MMHelpers.el("input","",null);
    nameInput.placeholder = "Playlist name";
    const createBtn = MMHelpers.el("button","icon-btn","Create");
    createBtn.addEventListener("click", ()=> {
      const name = nameInput.value.trim();
      if(!name) return alert("Enter playlist name");
      MMLS.createPlaylist(name);
      alert("Playlist created");
      nameInput.value = "";
    });
    box.appendChild(nameInput);
    box.appendChild(createBtn);
    content.appendChild(box);
  }

  function renderSearch(){
    const q = searchInput.value.trim();
    if(!q) {
      content.appendChild(MMHelpers.el("p",null,"Type a query in the search bar."));
      return;
    }
    showSearchResults(q);
  }

  function showSearchResults(q){
    content.innerHTML = "";
    const ql = q.toLowerCase();
    const results = songs.filter(s => s.title.toLowerCase().includes(ql) || (s.artist||"").toLowerCase().includes(ql));
    if(results.length === 0) {
      content.appendChild(MMHelpers.el("p",null,"No results found."));
      return;
    }
    results.forEach(s => content.appendChild(createSongCard(s, songs.indexOf(s))));
  }

  // Playlist detail
  function showPlaylistDetail(plId){
    content.innerHTML = "";
    const pl = MMLS.getPlaylists().find(x=>x.id===plId);
    if(!pl) return renderPlaylists();
    content.appendChild(MMHelpers.el("h2",null,pl.name));
    if(pl.songs.length === 0) content.appendChild(MMHelpers.el("p",null,"No songs in this playlist."));
    pl.songs.forEach(id => {
      const s = songs.find(x=>x.id===id);
      if(s) {
        const idx = songs.indexOf(s);
        const card = createSongCard(s, idx);
        // add remove from playlist button override
        const removeBtn = MMHelpers.el("button","icon-btn","Remove");
        removeBtn.addEventListener("click",(ev)=>{
          ev.stopPropagation();
          MMLS.removeSongFromPlaylist(plId, id);
          showPlaylistDetail(plId);
        });
        card.querySelector(".actions").appendChild(removeBtn);
        content.appendChild(card);
      }
    });
  }

  // Add to playlist modal (simple prompt selection)
  function showAddToPlaylistModal(songId){
    const pls = MMLS.getPlaylists();
    if(pls.length === 0){
      if(confirm("No playlists. Create one?")) {
        const name = prompt("Playlist name");
        if(name) MMLS.createPlaylist(name);
      }
      return;
    }
    const choices = pls.map((p,i)=>`${i+1}. ${p.name}`).join("\n");
    const sel = prompt("Select playlist number:\n" + choices);
    const num = parseInt(sel);
    if(isNaN(num) || num < 1 || num > pls.length) return;
    const selected = pls[num-1];
    MMLS.addSongToPlaylist(selected.id, songId);
    alert(`Added to ${selected.name}`);
  }

  // Play functions
  function playByIndex(idx){
    if(idx < 0 || idx >= songs.length) return;
    currentIndex = idx;
    const song = songs[idx];
    loadSong(song);
    audio.play();
    isPlaying = true;
    updatePlayButton();
    // record recently played
    recentlyPlayed = recentlyPlayed.filter(x=>x!==song.id);
    recentlyPlayed.push(song.id);
    if(recentlyPlayed.length > 30) recentlyPlayed.shift();
    localStorage.setItem("mm_recent_v1", JSON.stringify(recentlyPlayed));
  }

  function loadSong(song){
    // if src is data url or absolute path, use it
    audio.src = song.src;
    playerImg.src = song.img || "assets/images/demo1.jpg";
    playerTitle.innerText = song.title;
    playerArtist.innerText = song.artist || "Unknown";
  }

  function togglePlay(){
    if(!audio.src){
      if(songs.length === 0) return alert("No songs available. Admin can add songs.");
      playByIndex(0);
      return;
    }
    if(audio.paused) {
      audio.play();
      isPlaying = true;
    } else {
      audio.pause();
      isPlaying = false;
    }
    updatePlayButton();
  }

  function updatePlayButton(){
    playBtn.innerText = audio.paused ? "⏯" : "⏸";
  }

  function prevSong(){
    currentIndex = (currentIndex - 1 + songs.length) % songs.length;
    playByIndex(currentIndex);
  }

  function nextSong(){
    currentIndex = (currentIndex + 1) % songs.length;
    playByIndex(currentIndex);
  }

  // When page loads
  async function init(){
    // Try loading songs from IndexedDB first (binary blobs)
    if(window.IDBStorage && typeof window.IDBStorage.getAllSongs === 'function'){
      try{
        const idbSongs = await window.IDBStorage.getAllSongs();
        if(idbSongs && idbSongs.length > 0){
          // Convert blobs to object URLs for playback
          songs = idbSongs.map(s => ({
            id: s.id,
            title: s.title,
            artist: s.artist,
            src: s.audio ? URL.createObjectURL(s.audio) : (s.src || ''),
            img: s.image ? URL.createObjectURL(s.image) : (s.img || '')
          }));
        } else {
          songs = MMLS.getSongs();
        }
      } catch(err){
        console.error('Failed to load songs from IDB', err);
        songs = MMLS.getSongs();
      }
    } else {
      songs = MMLS.getSongs();
    }

    // set default player image
    if(songs.length > 0){
      // load first song but do not autoplay
      loadSong(songs[0]);
    }
    // default page
    showPage("home");

    // small improvement: hotkeys
    window.addEventListener("keydown", (e) => {
      if(e.code === "Space") { e.preventDefault(); togglePlay(); }
      if(e.code === "ArrowRight") nextSong();
      if(e.code === "ArrowLeft") prevSong();
    });
  }

  init();
})();
