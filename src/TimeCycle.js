import "./styles.css";
import * as THREE from "three";
import * as SCENE from "./Scene.js";
import * as AUDIO from "./Audio.js";
import * as NPC from "./NPCAudio.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";

//import * as GSAP from "gsap";
//import * as SKYBOX from "./SkyBox";

// DAY/NIGHT CYCLE ======================================================

// 'TOD' means 'Time of Day'.

var dayCount = 1; // Always start at day 1.

let isDayTime = true;

const fontLoader = new FontLoader(); // Can't get font loader to work... idk
const windowsFont = fontLoader.load("Fonts/W95.json");

var currentTimeIndex = 0; // This represents the index of the TOD array.

export { windowsFont, isDayTime, dayCount, currentTimeIndex };

export function initTimeCycle() {
  // AUDIO.startClockTick();

  // Time of day class stores info that controls visual/audio changes.

  let clock = new THREE.Clock();

  class timeOfDay {
    constructor(text, _color, _fogFar, _noiseIntensity, _windIntensity) {
      this.TOD = text;
      this.color = _color;
      this.fogFar = _fogFar;
      this.noiseIntensity = _noiseIntensity;
      this.windIntensity = _windIntensity;
    }
  }

  const TOD = [
    /* This TOD Array represents the parameters of world variables
    (Sky colour, fog density etc...) depending on the time of day. */

    new timeOfDay("9:00AM", new THREE.Color(0xb3ccff), 250, 0, 0.1),
    new timeOfDay("12:00PM", new THREE.Color(0x80aaff), 225, 0.1, 0.5),
    new timeOfDay("2:00PM", new THREE.Color(0x4d88ff), 200, 0.2, 1),
    new timeOfDay("4:00PM", new THREE.Color(0x6666ff), 150, 0.5, 2),
    new timeOfDay("6:00PM", new THREE.Color(0x171cb4), 150, 1, 2),
    new timeOfDay("12:00AM", new THREE.Color(0x1d1d1d), 80, 1.5, 3),
    new timeOfDay("3:00AM", new THREE.Color(0x1d1d1d), 70, 1, 1),
    new timeOfDay("6:00AM", new THREE.Color(0xffb366), 150, 0.2, 0)
  ];

  function nextItem() {
    // Iteriate through the TOD array
    currentTimeIndex++;

    //AUDIO.windDynamics.octaves += 0.25;

    if (currentTimeIndex >= TOD.length) {
      // Reset the index when it reaches the end.
      currentTimeIndex = 0;
      dayCount += 1; // Increase the number of days
      triggerDayText(dayCount);
      //AUDIO.windDynamics.octaves = 2; // Calm the wind effect
    }
  }

  let triggerGhost = false;

  function chanceOfRandomGhost() {
    if (AUDIO.virusErrorMessageFinished === true && triggerGhost === false) {
      setTimeout(messageToPlayer, THREE.MathUtils.randInt(0, 60000));
    }
  }

  setTimeout(chanceOfRandomGhost, THREE.MathUtils.randInt(0, 60000));

  function messageToPlayer() {
    triggerGhost = true;

    const chatBox = document.createElement("div");

    chatBox.hidden = false;
    chatBox.style.position = "absolute";
    chatBox.style.fontStyle = "Italic";
    chatBox.style.fontWeight = "lighter";
    chatBox.style.fontSize = "1rem";
    chatBox.style.color = "white";
    chatBox.style.fontFamily = "Arial, Times New Roman, Times, serif";
    chatBox.innerHTML = "A player has joined the game!";
    chatBox.style.top = window.innerHeight / 2 + "px";
    chatBox.style.left = window.innerWidth / 2 + "px";
    document.body.appendChild(chatBox);

    AUDIO.generateRandomPositionalAudio();

    AUDIO.triggerGhost();

    setTimeout(hideChatBox, 3000);

    function hideChatBox() {
      chatBox.hidden = true;
      triggerGhost = false;
    }
  }

  function whatDayIsIt(dayCount) {
    // Show the player what day it is

    AUDIO.playDayIncrementFX();

    const timeTextBox = document.createElement("div");

    timeTextBox.hidden = false;
    timeTextBox.style.position = "absolute";
    timeTextBox.style.fontFamily = "Arial, Times New Roman, Times, serif";
    timeTextBox.innerHTML = "DAY " + dayCount + ".";
    timeTextBox.style.top = window.innerHeight / 2 + "px";
    timeTextBox.style.left = window.innerWidth / 2 + "px";
    document.body.appendChild(timeTextBox);

    setTimeout(hideDayText, 3000);

    function hideDayText() {
      timeTextBox.hidden = true;
    }
  }

  triggerDayText();

  function triggerDayText() {
    setTimeout(showDayText, 5000);
    function showDayText() {
      whatDayIsIt(dayCount);
    }
  }

  setTimeLoop(); // Loop through the TOD array.

  function setTimeLoop() {
    setTimeout(setTime, 0);
  }

  function setTime() {
    var currentTime = TOD[currentTimeIndex].TOD;

    console.log("The time is:", currentTime);

    AUDIO.playTimeChime(); // Trigger 'Bell Tone' audio effect when the time changes.

    const timeTextBox = document.createElement("div");

    timeTextBox.hidden = false;
    timeTextBox.style.position = "absolute";
    timeTextBox.style.fontFamily = "Arial, Times, serif";
    timeTextBox.innerHTML = currentTime;
    timeTextBox.style.top = window.innerHeight / 2 + "px";
    timeTextBox.style.left = window.innerWidth / 2 + "px";
    document.body.appendChild(timeTextBox);

    setTimeout(hideTimeText, 3000);

    function hideTimeText() {
      timeTextBox.hidden = true;
    }

    // DAY/NIGHT TRIGGERS ======================================================

    // Trigger various effects and events based on the TOD.

    // Based on the boolean state of 'isDayTime', the 'x'TimeCheck functions will start/stop certain events.

    if (currentTime === "9:00AM" || currentTime === "6:00AM") {
      isDayTime = true;
      timeTextBox.style.color = "black";
      NPC.npcTimeCheck();
      AUDIO.timeTriggerSoundCheck();

      //AUDIO.nightBeatTimeCheck();
      //SCENE.checkIfDayTime(isDayTime); // An omitted function to apply a night-time shader
      //console.log("it's daytime?", isDayTime);
    } else if (currentTime === "9:00PM") {
      isDayTime = false;
      timeTextBox.style.color = "yellow";
      NPC.npcTimeCheck();
      AUDIO.timeTriggerSoundCheck();

      //AUDIO.nightBeatTimeCheck();
      //console.log("it's daytime?", isDayTime);
    } else if (currentTime === "12:00AM" || currentTime === "3:00AM") {
      isDayTime = false;
      timeTextBox.style.color = "yellow";
      NPC.npcTimeCheck();

      //SCENE.checkIfDayTime(isDayTime);

      //console.log("it's daytime?", isDayTime);
    }

    nextItem(); // Progress through the TOD array

    setTimeout(setTimeLoop, duration * 100); // duration * 100 (30 * 100 = 3000ms)
  }

  // LERPS ======================================================================

  // Lerp the backround and fog colour in conjunction with TOD array iterations.

  const duration = 30 * TOD.length - 1; // Duration dictates how long the day is.

  timeCycle(); // Trigger the time loop for lerping.

  function timeCycle() {
    requestAnimationFrame(timeCycle);
    const time = clock.getElapsedTime();
    backroundColourLerp(time);
  }

  // BACKROUND COLOUR LERPS =======================================================

  function backroundColourLerp(t) {
    const f = Math.floor(duration / TOD.length);
    const i1 = Math.floor((t / f) % TOD.length);

    let i2 = i1 + 1;

    if (i2 === TOD.length) i2 = 0;

    const color1 = TOD[i1].color;
    const color2 = TOD[i2].color;

    const fogFar1 = TOD[i1].fogFar;
    const fogFar2 = TOD[i2].fogFar;

    const noiseIntensity1 = TOD[i1].noiseIntensity;
    const noiseIntensity2 = TOD[i2].noiseIntensity;

    const windIntensity1 = TOD[i1].windIntensity;
    const windIntensity2 = TOD[i2].windIntensity;

    const a = ((t / f) % TOD.length) % 1;

    SCENE.scene.background.copy(color1);
    SCENE.scene.background.lerp(color2, a);

    // FOG COLOUR / INTENSITY LERPS ===========================================================

    var fogColor = SCENE.scene.background.copy(color1);
    fogColor.lerp(color2, a);

    let fogNear = 5;

    let x;

    x = THREE.MathUtils.lerp(fogFar1, fogFar2, a);

    SCENE.scene.fog = new THREE.Fog(fogColor, fogNear, x);

    let windLerp;

    windLerp = THREE.MathUtils.lerp(windIntensity1, windIntensity2, a);

    AUDIO.windDynamics.octaves = windLerp;

    let noiseLerp;

    noiseLerp = THREE.MathUtils.lerp(noiseIntensity1, noiseIntensity2, a);

    SCENE.noise = noiseLerp;
    //SKYBOX.sky.material.color.copy(color1)
    //SKYBOX.sky.material.color.lerp(color2, a);
  }
}
