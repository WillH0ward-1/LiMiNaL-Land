import "./styles.css";
import * as THREE from "three";
import * as PLAYER from "./Player.js";
import * as TWEEN from "@tweenjs/tween.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass.js";
import { FilmPass } from "three/examples/jsm/postprocessing/FilmPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { ColorifyShader } from "three/examples/jsm/shaders/ColorifyShader.js";
import { HalftonePass } from "three/examples/jsm/postprocessing/HalftonePass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js"; // Anti-Aliasing
import * as TIME from "./TimeCycle.js";
import * as NPC from "./NPCs";
import * as AUDIO from "./Audio.js";
import { scene, renderer } from "./Startup.js";
import * as Tone from "tone";
import { riseFromGround, riseFromGroundAudio } from "./WorldGen";
import * as RAIN from "./Rainfall.js";

let composer;

let light;

const effectColorify = new ShaderPass(ColorifyShader);

let noise;

var filmPass = new FilmPass(noise, 0.1, 5, 0);

export { scene, light, renderer, composer, effectColorify, filmPass, noise };

export function initScene() {
  // WEBGL RENDERER ==============================================================

  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  //renderer.outputEncoding = THREE.sRGBEncoding;

  // SCENE =======================================================================

  scene.background = new THREE.Color(0x338dff); // Blue

  scene.add(NPC.playerMesh); // Setting up collision. (Requires a playerMesh)

  virusErrorChance();

  // POST PROCESSING =============================================================

  composer = new EffectComposer(renderer);

  const renderPass = new RenderPass(scene, PLAYER.camera);
  renderPass.renderToScreen = true;
  composer.addPass(renderPass);

  composer.addPass(filmPass);

  //console.log(filmPass.noise);

  const halfTonePass = new HalftonePass(window.innerWidth, window.innerHeight, {
    shape: 3,
    radius: 1,
    scatter: 0.2,
    blending: 0.4,
    blendingMode: 1,
    greyscale: false,
    disable: false
  });

  composer.addPass(halfTonePass);

  // Anti Aliasing. EffectComposer requires it's own.

  var fxaa = new ShaderPass(FXAAShader);
  fxaa.material.uniforms["resolution"].value.x =
    1 / (window.innerWidth * window.devicePixelRatio);
  fxaa.material.uniforms["resolution"].value.y =
    1 / (window.innerHeight * window.devicePixelRatio);
  composer.addPass(fxaa);

  // LIGHTING =====================================================================

  /*
  const colour = 0xffffff;
  const intensity = 0.5;
  const light = new THREE.DirectionalLight(colour, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
  
*/

  const light = new THREE.DirectionalLight(0xffffff, 1);

  light.position.set(60, 180, 0);

  scene.add(light);

  /*
  NPC.hoodedHumanGroup.position.set(0, 50, 0);
  scene.add(NPC.hoodedHumanGroup);
*/

  // ASPECT RATIO ================================================================
  window.addEventListener("resize", onWindowResize, false);

  function onWindowResize() {
    PLAYER.camera.aspect = window.innerWidth / window.innerHeight;
    PLAYER.camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

// NIGHT TIME SHADER (POST PROCESSING) ================================================================

// An unused shader that creates a dark effect for night

/*

  export function checkIfDayTime() {
    if (TIME.isDayTime === false) {
      applyNightTimeShader();
    } else if (TIME.isDayTime === true) {
      removeNightTimeShader();
    }
  } 

  function applyNightTimeShader() {
    effectColorify.uniforms["color"].value.setRGB(0.5, 0.5, 0.5);
    composer.addPass(effectColorify);
  } 

  function removeNightTimeShader() {
  composer.removePass(effectColorify);
  }

  */

// TRIGGER GLITCH EVENTS ================================================================

export function glitchChance() {
  let glitchMinInterval = 10000;
  let glitchMaxInterval = 60000;

  let randomGlitchInterval = THREE.MathUtils.randInt(
    glitchMinInterval,
    glitchMaxInterval
  );

  setTimeout(applyGlitchShader, randomGlitchInterval);
}

let glitchShader = false;

export { glitchShader };

const glitchPass = new GlitchPass(1);
const glitchColourPass = new ShaderPass(ColorifyShader);

glitchPass.renderToScreen = true;
glitchColourPass.renderToScreen = true;

// RANDOM GLITCH EVENT  ====================================================

function applyGlitchShader() {
  //console.log("glitch!");

  var glitchBuff = new Tone.Buffer(
    "Sounds/Events/GlitchEffect.wav",
    function () {
      //the buffer is now available.
      var buff = glitchBuff.get();
      const glitchSound = new Tone.Player(buff).toDestination();
      glitchSound.volume.value = 1;

      // Apply an exaggerated field of view effect

      PLAYER.camera.fov += THREE.MathUtils.randInt(30, 50);

      PLAYER.camera.updateProjectionMatrix(); // Camera needs to be updated.

      // Generate and set Random RGB values

      let randomR = THREE.MathUtils.randFloat(0.5, 1);
      let randomG = THREE.MathUtils.randFloat(0.5, 1);
      let randomB = THREE.MathUtils.randFloat(0.5, 1);

      glitchColourPass.uniforms["color"].value.setRGB(
        randomR,
        randomG,
        randomB
      );

      // Set random start time for the glitch audio,
      //between the start and the duration of the audio.

      let randomStartTime = THREE.MathUtils.randFloat(
        0,
        glitchBuff.duration - 5
      );
      glitchSound.playbackRate = THREE.MathUtils.randFloat(1.0, 1.3);

      composer.addPass(glitchPass);
      composer.addPass(glitchColourPass);

      glitchSound.start(0, randomStartTime);
      // Start from a random point in the timeline of the sample.

      var randomGlitchInterval = new THREE.MathUtils.randInt(1000, 2000);

      setTimeout(hideGlitchShader(glitchSound), randomGlitchInterval);
    }
  );

  function hideGlitchShader(glitchSound) {
    // Reset all + stop sound

    //console.log("Hide glitch!");

    PLAYER.camera.fov = PLAYER.defaultFOV;
    PLAYER.camera.updateProjectionMatrix();
    composer.removePass(glitchPass);
    composer.removePass(glitchColourPass);
    glitchSound.stop();

    glitchChance();
  }
}

// TRIGGER POSITIONAL AUDIO ================================================================

let posAudioMinInterval = 30000;
let posAudioMaxInterval = 60000;

export function positionalAudioChance() {
  let posAudioInterval = THREE.MathUtils.randInt(
    posAudioMinInterval,
    posAudioMaxInterval
  );
  setTimeout(AUDIO.generateRandomPositionalAudio, posAudioInterval);
}

// VIRUS ERROR WARNING ================================================================

function virusErrorChance() {
  let randomErrorInterval = THREE.MathUtils.randInt(10000, 20000);
  setTimeout(triggerVirusError, randomErrorInterval);
}

const virusErrorWarning = document.createElement("img");

virusErrorWarning.src = "./Textures/UI/virusErrorUI.jpg";
virusErrorWarning.style.position = "absolute";
virusErrorWarning.style.width = "597px";
virusErrorWarning.style.height = "259px";
virusErrorWarning.style.top = 0;
virusErrorWarning.style.left = 0;
virusErrorWarning.style.right = 0;
virusErrorWarning.style.bottom = 0;
virusErrorWarning.style.margin = "auto";

export function triggerVirusError() {
  if (AUDIO.virusErrorMessageFinished === false) {
    effectColorify.uniforms["color"].value.setRGB(0.5, 0, 0); // Turn the screen red!
    composer.addPass(effectColorify);
    composer.addPass(glitchPass);
    document.body.appendChild(virusErrorWarning);
    virusErrorWarning.hidden = false;
    AUDIO.playVirusErrorMessage();

    PLAYER.player.speed = 0; // Stop the player moving when event triggered
    PLAYER.player.turnSpeed = 0; // No turning either.
  } else if (AUDIO.virusErrorMessageFinished === true) {
    // If the audio has finished, remove the 'virus detected' overlay.

    composer.removePass(effectColorify);
    composer.removePass(glitchPass);

    let trigger = THREE.MathUtils.randInt(5000, 10000);

    setTimeout(triggerEvents, trigger);

    function triggerEvents() {
      AUDIO.genMusicTimeCheck(TIME.isDayTime);
      glitchChance();
      positionalAudioChance();
      riseFromGround();
      riseFromGroundAudio();
    }

    virusErrorWarning.hidden = true;

    PLAYER.player.speed = PLAYER.defaultPlayerSpeed;
    PLAYER.player.turnSpeed = PLAYER.defaultPlayerTurnSpeed;
    PLAYER.player.isWalking = false;

    return;
  }
}
