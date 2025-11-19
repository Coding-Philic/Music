// If localStorage doesn't have songs, this demo list will be used.
// Put some sample mp3 files at assets/songs/demo1.mp3 etc. Or admin can add songs via admin.html.
window.defaultSongs = [
  {
    id: 1,
    title: "Demo Song One",
    artist: "Demo Artist",
    src: "assets/songs/demo1.mp3",    // optional local file
    img: "assets/images/demo1.jpg"    // optional local image
  },
  {
    id: 2,
    title: "Demo Song Two",
    artist: "Demo Artist",
    src: "assets/songs/demo2.mp3",
    img: "assets/images/demo2.jpg"
  }
];
