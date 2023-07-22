import "./styles.css";
import * as SCENE from "./Scene.js";
import * as THREE from "three";
import * as NPC from "./NPCs.ts";
import * as Tone from "tone";
import * as WORLD from "./WorldGen.js";
import * as TWEEN from "@tweenjs/tween.js";
import * as createjs from "createjs-module";

//import * as POSTPROCESSING from "./PostProcessing.js";
//import { footStepSound } from "./Audio.js";

const keyboard = {};

var footStepBPM = 220;

const defaultPlayerSpeed = (footStepBPM / 1000) * 4;
const defaultPlayerTurnSpeed = Math.PI * 0.02;

var defaultFOV = 40;
const defaultNearPlane = 0.1;
const defaultClippingPlane = 20000;

let gamePaused = false;

let player = {
  height: 8.0,
  speed: defaultPlayerSpeed,
  turnSpeed: defaultPlayerTurnSpeed,
  isWalking: false,
  positionX: 0,
  positionZ: 0,
  foostStepSound: false
};

let aspect = window.innerWidth / window.innerHeight; //ASPECT RATIO

const camera = new THREE.PerspectiveCamera(
  defaultFOV, // FIELD OF VIEW
  aspect,
  defaultNearPlane, // NEAR PLANE
  defaultClippingPlane // CLIPPING PLANE
);

let listener = new THREE.AudioListener();

camera.add(listener);

export {
  camera,
  listener,
  player,
  defaultFOV,
  defaultPlayerSpeed,
  defaultPlayerTurnSpeed
};

export function initPlayer() {
  // Set initial camera position

  camera.position.set(0, player.height, -70);
  camera.lookAt(new THREE.Vector3(0, player.height, 0));

  play();

  // SET ANIMATION LOOP ===================================================

  function play() {
    if (gamePaused === false) {
      // 'Pause' option is a work in progress.
      SCENE.renderer.setAnimationLoop(() => {
        update();
        render();
      });
    }
  }

  // UPDATE ===================================================

  var clock = new THREE.Clock();
  var deltaTime = 0;

  function update() {
    animate();
    NPC.checkColliderEvent(); // Checks if the player has collided with the NPC's collision bounding box.
  }

  // RENDER + ANIMATE LOOP ====================================================

  var clock = new THREE.Clock();

  function render() {
    var delta = clock.getDelta();
    SCENE.composer.render(delta); // Render scene + post processing.
  }

  function animate() {
    playerMovement();

    updatePlayerPosition(); // For map border boundary detection.

    NPC.updatePlayerMeshPosition(camera.position); // For collision detection.

    checkPlayerInBounds(); // Checks if the player is within the map bounds (map size).

    TWEEN.default.update();
  }

  function updatePlayerPosition() {
    player.positionX = camera.position.x;
    player.positionZ = camera.position.z;

    //console.log ("X:", player.positionX, "Z:", player.positionZ); // Debug
  }

  // MAP BOUNDARY DETECTION ========================================================

  // A hacky solution to prevent the player leaving the map without collision. Not perfect yet.
  // Issue: player can clip through the corners of the map.

  let mapBounds = WORLD.mapScale / 2 - 1;

  let positiveAxisBounds = mapBounds;
  let negativeAxisBounds = (mapBounds *= -1);

  let playerInBounds = true;

  function checkPlayerInBounds() {
    if (
      player.positionX <= positiveAxisBounds &&
      player.positionZ <= positiveAxisBounds
    ) {
      playerInBounds = true;
    } else {
      // If the player is out of bounds, prevent them going further by immediately transporting them backwards.

      camera.position.x -= 2;
      camera.position.z -= 2;
    }

    if (
      player.positionX >= negativeAxisBounds &&
      player.positionZ >= negativeAxisBounds
    ) {
      playerInBounds = true;
    } else {
      camera.position.x += 2;
      camera.position.z += 2;
    }
  }

  // PLAYER MOVEMENT ========================================================

  function playerMovement() {
    // KEYBOARD MOVEMENT INPUTS

    if (keyboard[87]) {
      // W key
      camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
      camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
    }

    if (keyboard[65]) {
      // A key
      camera.position.x +=
        Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
      camera.position.z +=
        -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
    }

    if (keyboard[83]) {
      // S key
      camera.position.x += Math.sin(camera.rotation.y) * player.speed;
      camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
    }

    if (keyboard[68]) {
      // D key
      camera.position.x +=
        Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
      camera.position.z +=
        -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
    }

    // KEYBOARD TURN INPUTS ================================================

    if (keyboard[37]) {
      // Left arrow key
      camera.rotation.y -= player.turnSpeed;
    }

    if (keyboard[39]) {
      // Right arrow key
      camera.rotation.y += player.turnSpeed;
    }
  }

  let isPlayerIdle = false;

  var frequency = 0;
  const IdleFrequency = 3000;
  const walkingFrequency = 60000 / footStepBPM / 2;
  let randYOffset = THREE.MathUtils.randFloat(0, 0.4);

  function walkingAnim(playerWalking) {
    if (playerWalking === true) {
      createjs.Tween.get(camera.position, { loop: true })
        .to({ y: camera.position.y + randYOffset }, walkingFrequency)
        .to({ y: camera.position.y }, walkingFrequency);
    }
  }

  function idleAnim(playerWalking) {
    if (playerWalking === false) {
      createjs.Tween.get(camera.position, { loop: true })
        .to({ y: camera.position.y + randYOffset }, IdleFrequency)
        .to({ y: camera.position.y }, IdleFrequency);
    }
  }

  /*
    createjs.Tween.get(camFov, { loop: true })
      .to({ fov: (camFov += randYOffset) }, frequency)
      .to({ fov: (camFov -= randYOffset) }, frequency);

    camera.updateProjectionMatrix();
*/

  // EVENT LISTENERS ========================================================

  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);

  // KEYBOARD EVENTS =======================================================

  //let movementKeys = [87, 65, 83, 68];

  function keyDown(event) {
    var keyValue = event.key;
    keyboard[event.keyCode] = true;

    if (
      keyValue === "ArrowLeft" ||
      keyValue === "ArrowRight" ||
      keyValue === "ArrowUp" ||
      keyValue === "ArrowDown"
    ) {
      //console.log("Don't Move.");
    } else if (
      keyValue === "w" ||
      keyValue === "a" ||
      keyValue === "s" ||
      keyValue === "d"
    ) {
      player.isWalking = true;
      walkingAnim();
      idleAnim();
      footStepSound();
      //console.log("Move!");
    }
  }

  function keyUp(event) {
    var keyValue = event.key;
    keyboard[event.keyCode] = false;
    console.log(keyValue);
    if (
      keyValue === "w" ||
      keyValue === "a" ||
      keyValue === "s" ||
      keyValue === "d"
    ) {
      console.log(keyValue);
      player.isWalking = false;

      walkingAnim();
      idleAnim();
      footStepSound();
    }
  }

  // PLAYER AUDIO ====================================================

  // PLAYER MOVEMENT - FOOTSTEPS

  // Issue: getting new footstep per buffer playback instead of
  // per keydown.

  const footstepSamples = [
    "Sounds/Player/Footsteps/DirtFootStep01.wav",
    "Sounds/Player/Footsteps/DirtFootStep02.wav",
    "Sounds/Player/Footsteps/DirtFootStep03.wav",
    "Sounds/Player/Footsteps/DirtFootStep04.wav",
    "Sounds/Player/Footsteps/DirtFootStep05.wav"
  ];

  let footStepPlaying = false;

  function footStepSound() {
    var randomFootStepIndex = THREE.MathUtils.randInt(
      0,
      footstepSamples.length - 1
    );
    var randomFootStep = footstepSamples[randomFootStepIndex];

    var footStepBuffer = new Tone.Buffer(randomFootStep, function () {
      var footStepBuff = footStepBuffer.get();
      var footStepPlayer = new Tone.Player(footStepBuff).toDestination();

      let minPitch = 1;
      let maxPitch = minPitch + 0.3;
      var footStepPitchVariation = THREE.MathUtils.randFloat(
        minPitch,
        maxPitch
      );

      let minVol = 1;
      let maxVol = minVol + 0.3;
      var footStepVolumeVariation = THREE.MathUtils.randFloat(
        minPitch,
        maxPitch
      );

      footStepPlayer.volume = footStepVolumeVariation;

      playFootStepSound(footStepPlayer, footStepPitchVariation);
    });
  }

  function playFootStepSound(footStepPlayer, footStepPitchVariation) {
    //let bufferArray = [];

    //bufferArray.push(footStepPlayer);

    footStepPlayer.playbackRate = footStepPitchVariation;
    footStepPlayer.volume.value = -25;
    Tone.Transport.bpm.value = footStepBPM;

    let minVol = -25;
    let maxVol = -28;
    let randInterval;
    let footStepDeviance;

    let randStop = THREE.MathUtils.randInt(footStepBPM / 10, footStepBPM / 11);

    if (player.isWalking === true && footStepPlaying === false) {
      footStepPlaying = true;
      Tone.Transport.scheduleRepeat((time) => {
        randInterval = THREE.MathUtils.randFloat(0, 2);
        footStepDeviance = footStepBPM + randInterval;
        footStepPlayer.start(time);
        footStepPlayer.volume.value = THREE.MathUtils.randInt(minVol, maxVol);
        console.log(randInterval);
        footStepPlayer.stop(time + 0.5);
      }, "4n");

      Tone.Transport.start();
      console.log("playerWalking!");
    } else if (player.isWalking === false) {
      Tone.Transport.stop();
      //bufferArray.forEach( element => Tone.Transport.dispose())
      footStepPlaying = false;
      console.log("playerNotWalking!");
    }
  }
}

// PLAYER BREATHING AUDIO ====================================================
let playerStopBreathing = false;
let playerBreathingIsPlaying = false;

function playerBreathing() {
  CheckPlayerBreathing();

  setTimeout(CheckPlayerBreathing);
}

export function CheckPlayerBreathing() {
  const playerBreathing = new Tone.Player(
    "Sounds/Player/PlayerBreathing.wav"
  ).toDestination();

  if (playerBreathingIsPlaying === false && playerStopBreathing === false) {
    playerBreathing.playbackRate = 1;
    playerBreathing.loop = true;
    playerBreathing.autostart = true;
    playerBreathingIsPlaying = true;
  } else if (
    playerBreathingIsPlaying === true &&
    playerStopBreathing === true
  ) {
    playerBreathing.stop();
    playerBreathingIsPlaying = false;
  }
}
