/* utils/localStorage.js 
   Provides helper wrappers for songs/favs/playlists in localStorage.
*/
(function(){
  // Key names
  const SONGS_KEY = "mm_songs_v1";
  const FAVS_KEY = "mm_favs_v1";
  const PL_KEY = "mm_playlists_v1";

  function getSongs(){
    let s = localStorage.getItem(SONGS_KEY);
    if(s) return JSON.parse(s);
    // fallback to defaultSongs declared by data/songs.js
    if(window.defaultSongs) {
      localStorage.setItem(SONGS_KEY, JSON.stringify(window.defaultSongs));
      return window.defaultSongs.slice();
    }
    return [];
  }

  function saveSongs(songs){
    localStorage.setItem(SONGS_KEY, JSON.stringify(songs || []));
  }

  function getFavs(){
    return JSON.parse(localStorage.getItem(FAVS_KEY) || "[]");
  }

  function toggleFav(id){
    const favs = getFavs();
    const idx = favs.indexOf(id);
    if(idx === -1) favs.push(id);
    else favs.splice(idx,1);
    localStorage.setItem(FAVS_KEY, JSON.stringify(favs));
    return favs;
  }

  function isFav(id){
    return getFavs().includes(id);
  }

  function getPlaylists(){
    return JSON.parse(localStorage.getItem(PL_KEY) || "[]");
  }

  function savePlaylists(pls){
    localStorage.setItem(PL_KEY, JSON.stringify(pls || []));
  }

  function createPlaylist(name){
    const pls = getPlaylists();
    const newPl = { id: Date.now(), name: name || `Playlist ${pls.length+1}`, songs: [] };
    pls.push(newPl);
    savePlaylists(pls);
    return newPl;
  }

  function addSongToPlaylist(playlistId, songId){
    const pls = getPlaylists();
    const p = pls.find(x=>x.id===playlistId);
    if(!p) return false;
    if(!p.songs.includes(songId)) p.songs.push(songId);
    savePlaylists(pls);
    return true;
  }

  function removeSongFromPlaylist(playlistId, songId){
    const pls = getPlaylists();
    const p = pls.find(x=>x.id===playlistId);
    if(!p) return false;
    p.songs = p.songs.filter(s=>s!==songId);
    savePlaylists(pls);
    return true;
  }

  // Expose functions
  window.MMLS = {
    getSongs,
    saveSongs,
    getFavs,
    toggleFav,
    isFav,
    getPlaylists,
    savePlaylists,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist
  };
})();
