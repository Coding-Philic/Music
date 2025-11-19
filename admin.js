async function addSong() {
    const title = document.getElementById("song-title").value.trim();
    const artist = document.getElementById("song-artist").value.trim();
    const songFile = document.getElementById("song-file").files[0];
    const songImg = document.getElementById("song-img").files[0];

    // Debug Logs (to check inputs)
    console.log("TITLE:", title);
    console.log("Artist:", artist);
    console.log("Song File:", songFile);
    console.log("Song Img:", songImg);

    // VALIDATION
    if (title === "" || !songFile || !songImg) {
        alert("Please fill all fields & upload both files!");
        return;
    }

    try {
        // Save into IndexedDB (store blobs there)
        const meta = {
            id: Date.now(),
            title,
            artist: artist || "Unknown Artist"
        };

        if (window.IDBStorage && typeof window.IDBStorage.addSong === 'function') {
            await window.IDBStorage.addSong(meta, songFile, songImg);

            // Optionally also keep a lightweight metadata mirror in localStorage (ids/index) — not required
            alert("🎉 Song Added Successfully!");

            // Clear inputs
            document.getElementById("song-title").value = "";
            document.getElementById("song-artist").value = "";
            document.getElementById("song-file").value = "";
            document.getElementById("song-img").value = "";

            // Redirect to player so user sees the added song
            window.location.href = 'index.html';
        } else {
            throw new Error('IndexedDB helper not available. Make sure utils/idb.js is loaded before admin.js');
        }
    } catch (err) {
        console.error('Failed to add song', err);
        alert('Failed to add song: ' + (err && err.message ? err.message : err));
    }
}
