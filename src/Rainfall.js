import * as TIME from "./TimeCycle";
import * as THREE from "three";
import * as Tone from "tone";
import * as PLAYER from "./Player.js";
import { textureLoader } from "./WorldGen.js";
import * as SCENE from "./Scene.js";
import { GeometryUtils, Vector3 } from "three";

// RAIN ==================================================

let isRaining = false;

export function initWeather() {
  rainChance();
}

function rainChance() {
  // A random chance of rain occuring within a given interval

  let minimumWait = 1 * 10;
  let maximumWait = 5 * 10;

  let randomNumberGen = THREE.MathUtils.randInt(minimumWait, maximumWait);

  setInterval(setupRain(), randomNumberGen);
}

function setupRain() {
  let rainCount = 9500;

  let rainGeo = new THREE.BufferGeometry();

  for (let i = 0; i < rainCount; i++) {
    let rainDrop = new THREE.Vector3(
      Math.random() * 400 - 200,
      Math.random() * 500 - 250,
      Math.random() * 400 - 200
    );
    rainDrop.velocity = {};
    rainDrop.velocity = 0;
    rainGeo.vertices.push(rainDrop);
  }

  const rainMaterial = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true
  });

  let rain = new THREE.Points(rainGeo, rainMaterial);
  SCENE.scene.add(rain);

  startRaining(rainGeo, rain);
}

function startRaining(rainGeo, rain) {
  isRaining = true;

  raining();

  function raining() {
    rainGeo.vertices.forEach((p) => {
      p.velocity -= 3 * Math.random() * 1;
      p.y += p.velocity;
      if (p.y < -100) {
        p.y = 100;
        p.velocity = 0;
      }
    });
    requestAnimationFrame(raining);
  }

  rainGeo.verticesNeedUpdate = true;
  rain.rotation.y += 0.002;

  rainAudio(isRaining);
  stopChance();
  //requestAnimationFrame(startRaining);
}

function stopChance() {
  let randomNumberGen = THREE.MathUtils.randInt(0, 10);
  setInterval(stopRaining(), randomNumberGen);
}

function stopRaining(raining) {
  isRaining = false;
  rainAudio(isRaining);
  cancelAnimationFrame(raining);
}

// Setup Rain Audio --------------------------------------------------

var rainFilter = new Tone.AutoFilter({
  frequency: "1n",
  baseFrequency: 300,
  octaves: 0 // Higher octave = 'harsher'.
}).toDestination();

const rainAmbience = new Tone.Noise("white");

rainAmbience.volume.value = 8;
rainAmbience.connect(rainFilter);

// Trigger Rain Audio --------------------------------------------------

function rainAudio(isRaining) {
  if (isRaining === false) {
    rainAmbience.stop();
    console.log("rainAmbience Stop.");
  } else if (isRaining === true) {
    rainAmbience.start();
    console.log("rainAmbience Start.");
  }
}
