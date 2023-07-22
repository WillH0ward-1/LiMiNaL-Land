import "./styles.css";

import { initScene } from "./Scene.js";
import { initWorld } from "./WorldGen.js";
import { initPDS } from "./PoissonDiskSampling.js";
import { initTimeCycle } from "./TimeCycle.js";
import { initPlayer } from "./Player.js";
import * as Tone from "tone";
import { initAudio } from "./Audio.js";
import { initIntro } from "./Startup.js";
import { initWeather } from "./Rainfall.js";

let startButton = document.getElementById("startButton");

startButton.addEventListener("click", initStartup);

// ======================================================

// Initialise all scripts

function initStartup() {
  initIntro();
  Tone.start();
}

export function initGame() {
  initScene();
  initPDS();
  initWorld();
  initPlayer();
  initTimeCycle();
  initAudio();
  //initWeather
}
