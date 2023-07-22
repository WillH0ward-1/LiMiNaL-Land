import "./styles.css";
import * as THREE from "three";
import * as Tone from "tone";
import { initGame } from "./index.js";

let renderer, scene;

export { scene, renderer };

// This is the Intro sequence.
// It uses a video texture that has a variable resolution based on screen size.
// The intro can be skipped

export function initIntro() {
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    stencil: false,
    alpha: false
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  document.body.appendChild(renderer.domElement);

  let skipIntro = false;

  let overlay = document.getElementById("overlay");
  overlay.remove();

  scene = new THREE.Scene();

  setTimeout(skipIntroOption, 2000);

  function skipIntroOption() {
    console.log("Click to skip.");
    document.body.addEventListener("click", confirmSkipIntro);
  }

  const clickSound = new Tone.Player(
    "./Sounds/Interface/XPClick.wav"
  ).toDestination();
  clickSound.loop = false;

  function confirmSkipIntro() {
    if (skipIntro === false) {
      // Play 'Click Sound' on skip event and set 'skipIntro' bool to true.
      console.log("Intro Skipped.");
      clickSound.start();
      skipIntro = true;
      return;
    } else {
      // In game, play 'Click Sound', without changing 'skipIntro' bool.
      clickSound.start();
      return;
    }
  }

  scene.background = new THREE.Color(0x000000);

  var introCamera = new THREE.PerspectiveCamera(
    100, // FIELD OF VIEW
    window.innerWidth / window.innerHeight, // ASPECT RATIO
    0.1, // NEAR PLANE
    700 // CLIPPING PLANE
  );

  scene.add(introCamera);

  // VIDEO PLAYER (TEXTURE) ==================================================

  let videoPlayer = document.createElement("video");

  let videoSrc = "./Video/Intro/LiminalLandIntro.mp4";

  videoPlayer.playsInline = true;
  videoPlayer.loop = false;
  videoPlayer.autoplay = true;
  videoPlayer.volume = 0.2;
  videoPlayer.width = "960";
  videoPlayer.height = "540";
  videoPlayer.src = videoSrc;
  videoPlayer.style = "display: none";
  videoPlayer.crossOrigin = "anonymous";

  let video = videoPlayer;

  let videoTexture = new THREE.VideoTexture(video);

  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;

  var videoMaterial = new THREE.MeshBasicMaterial({
    map: videoTexture,
    side: THREE.FrontSide,
    toneMapped: false
  });

  let videoPlayerGeometry = new THREE.PlaneBufferGeometry(
    videoPlayer.width,
    videoPlayer.height
  );

  let videoPlayerScreen = new THREE.Mesh(videoPlayerGeometry, videoMaterial);

  videoPlayerScreen.position.set(0, 0, -200);
  scene.add(videoPlayerScreen);

  introCamera.position.set(0, 0, 0);
  introCamera.lookAt(videoPlayerScreen.position);

  introRender();

  // RENDER ====================================================

  let gameHasStarted = false;

  function introRender() {
    requestAnimationFrame(introRender);
    videoTexture.needsUpdate = true;

    renderer.render(scene, introCamera);

    if (videoPlayer.ended === true && gameHasStarted === false) {
      gameInitialise();
      return;
    } else if (skipIntro === true && gameHasStarted === false) {
      gameInitialise();
      return;
    }

    function gameInitialise() {
      removeStartupElements();
      initGame();
      gameHasStarted = true;
      return;
    }
  }

  // REMOVE THE STARTUP SEQUENCE

  function removeStartupElements() {
    scene.clear();
    cancelAnimationFrame(introRender);
    videoPlayer.muted = true;
  }

  // STOP ======================================================

  window.addEventListener("resize", onWindowResize, true);

  function onWindowResize() {
    const sceneHeight = window.innerHeight;
    const sceneWidth = window.innerWidth;
    renderer.setSize(sceneWidth, sceneHeight);
    introCamera.aspect = sceneWidth / sceneHeight;
    introCamera.updateProjectionMatrix();
  }
}
