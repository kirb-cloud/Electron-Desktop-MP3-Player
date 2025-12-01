const audio = document.getElementById("audio");
const playPauseBtn = document.getElementById("playPause");
const playPauseIcon = document.getElementById("playPauseIcon");
const progressBar = document.getElementById("progressBar");
const fileInput = document.getElementById("fileinput");
const dropArea = document.getElementById("dropArea");
const coverImage = document.getElementById("coverImage");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");
const songTitle = document.querySelector(".song-title");

let playlist = [];
let currentIndex = -1;
let isPlaying = false;

const coverImages = [
  "default-cover.png",
  "default-cover1.png",
  "default-cover2.png"
];

function handleFiles(files) {
  const audioFiles = Array.from(files).filter(file => 
    file && file.type.startsWith("audio/")
  );

  if (audioFiles.length === 0) {
    console.log("No audio files found");
    return;
  }

  for (const file of audioFiles) {
    const url = URL.createObjectURL(file);
    const fileName = file.name.replace(/\.[^/.]+$/, "");

    const song = {
      name: fileName,
      url: url,
      cover: "default-cover.png",
    };

    playlist.push(song);
  }

  console.log(`Added ${audioFiles.length} song(s). Total: ${playlist.length}`);

  if (currentIndex === -1 && playlist.length > 0) {
    currentIndex = 0;
    loadSong(currentIndex);
  }
}

function getSequentialCover(index) {
  const coverIndex = index % coverImages.length;
  return coverImages[coverIndex];
}

function loadSong(index) {
  const song = playlist[index];
  if (!song) {
    console.log("No song at index", index);
    return;
  }

  console.log("Loading song:", song.name);

  audio.src = song.url;
  songTitle.textContent = song.name;

  const cover = getSequentialCover(index);
  coverImage.src = `${cover}?t=${Date.now()}`;
  coverImage.style.display = "block";

  coverImage.onerror = () => {
    console.log("Cover image failed to load, using default");
    coverImage.src = "default-cover.png";
  };

  isPlaying = false;
  playPauseIcon.src = "btn-play.png";
}

nextBtn.addEventListener("click", () => {
  if (playlist.length === 0) {
    console.log("No songs in playlist");
    return;
  }
  currentIndex = (currentIndex + 1) % playlist.length;
  console.log("Next button clicked, new index:", currentIndex);
  loadSong(currentIndex);
});

prevBtn.addEventListener("click", () => {
  if (playlist.length === 0) {
    console.log("No songs in playlist");
    return;
  }
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  console.log("Previous button clicked, new index:", currentIndex);
  loadSong(currentIndex);
});

fileInput.addEventListener("change", function () {
  console.log("Files selected:", this.files.length);
  handleFiles(this.files);
});

dropArea.addEventListener("click", (e) => {
  if (e.target.closest("button")) {
    console.log("Button clicked, not opening file picker");
    return;
  }
  console.log("Drop area clicked, opening file picker");
  fileInput.click();
});

dropArea.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropArea.classList.add("dragover");
});

dropArea.addEventListener("dragleave", () => {
  dropArea.classList.remove("dragover");
});

dropArea.addEventListener("drop", (e) => {
  e.preventDefault();
  dropArea.classList.remove("dragover");
  console.log("Files dropped:", e.dataTransfer.files.length);
  if (e.dataTransfer.files.length > 0) {
    handleFiles(e.dataTransfer.files);
  }
});

playPauseBtn.addEventListener("click", () => {
  if (!audio.src) {
    console.log("No audio loaded");
    return;
  }

  if (isPlaying) {
    audio.pause();
    playPauseIcon.src = "btn-play.png";
    console.log("Paused");
  } else {
    audio.play().catch(err => {
      console.error("Error playing audio:", err);
    });
    playPauseIcon.src = "btn-pause.png";
    console.log("Playing");
  }
  isPlaying = !isPlaying;
});

audio.addEventListener("timeupdate", () => {
  if (audio.duration) {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progress}%`;
  }
});

audio.addEventListener("ended", () => {
  console.log("Song ended");
  if (playlist.length > 1) {
    currentIndex = (currentIndex + 1) % playlist.length;
    loadSong(currentIndex);
    audio.play().catch(err => {
      console.error("Error auto-playing next song:", err);
    });
  } else {
    isPlaying = false;
    playPauseIcon.src = "btn-play.png";
  }
});

function attachWindowControlListeners() {
  const minBtn = document.querySelector('.min-btn');
  const closeBtn = document.querySelector('.close-btn');

  console.log("Setting up window controls", { 
    minBtn: !!minBtn, 
    closeBtn: !!closeBtn, 
    electronAPI: !!window.electronAPI 
  });

  if (minBtn && window.electronAPI) {
    minBtn.addEventListener('click', () => {
      console.log("Minimize clicked");
      window.electronAPI.minimizeWindow();
    });
  }

  if (closeBtn && window.electronAPI) {
    closeBtn.addEventListener('click', () => {
      console.log("Close clicked");
      window.electronAPI.closeWindow();
    });
  }
}

window.addEventListener('DOMContentLoaded', () => {
  console.log("DOM loaded, initializing...");
  attachWindowControlListeners();
});