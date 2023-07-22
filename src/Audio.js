import "./styles.css";
import * as THREE from "three";
import * as Tone from "tone";
import * as TIME from "./TimeCycle.js";
import * as PLAYER from "./Player.js";
import * as SCENE from "./Scene.js";
import { textureLoader } from "./WorldGen";

var gameInitialised = false;

// AUDIO ===================================================================================

export function initAudio() {
  // AMBIENT AUDIO OSCILLATORS + GENERATORS ==================================================

  gameInitialised = true;

  // 'COIL WHINE" AMBIENCE (Circa 90's Computer) ====================================================

  const coilWhineTone = new Tone.Oscillator(14000, "sine")
    .toDestination()
    .start();

  coilWhineTone.volume.value = -55;

  // LOW FREQUENCY RUMBLE AMBIENCE ====================================================

  const lowFreqRumble = new Tone.Noise("brown").start();

  const autoFilter = new Tone.AutoFilter({
    frequency: "0.03n",
    baseFrequency: 20,
    octaves: 1
  }).toDestination();

  autoFilter.start();
  lowFreqRumble.connect(autoFilter);

  lowFreqRumble.volume.value -= 50;

  startWindDynamics();
}

// AMBIENT WIND (DYNAMIC) ====================================================

export var windDynamics = new Tone.AutoFilter({
  frequency: "0.05n",
  baseFrequency: 70,
  octaves: 1 // Higher octave = 'harsher' wind effect. This is altered in 'TimeCycle.js', Line 52.
}).toDestination();

function startWindDynamics() {
  const dynamicWindNoise = new Tone.Noise("brown").start();

  dynamicWindNoise.volume.value -= 10;
  dynamicWindNoise.connect(windDynamics);
  windDynamics.start();
}

// POSITIONAL AUDIO ====================================================

let pigSqueal = "Sounds/PositionalAmbience/pigSqueal(AntiVirus).wav";
let phantomFeet = "Sounds/PositionalAmbience/PhantomFootSteps.wav";

const positionalAudioArray = [pigSqueal, phantomFeet];

const posAudioGeometry = new THREE.BoxBufferGeometry(5, 5, 5, 1, 1);
const posAudioMaterial = new THREE.MeshBasicMaterial();

posAudioMaterial.color.set(0xff0000);
posAudioMaterial.wireframe = true;
posAudioMaterial.transparent = true;
posAudioMaterial.opacity = 0;

const audioLoader = new THREE.AudioLoader();

export function generateRandomPositionalAudio() {
  // SETUP POSITIONAL AUDIO SOURCE

  let randomAudioIndex = THREE.MathUtils.randInt(
    0,
    positionalAudioArray.length - 1
  );

  let randomAudio = positionalAudioArray[randomAudioIndex];

  let randomAmbientAudioGenerator = new THREE.Mesh(
    posAudioGeometry,
    posAudioMaterial
  );

  var xPosOffset = THREE.MathUtils.randInt(20, 40);
  var y = 0;
  var zPosOffset = THREE.MathUtils.randInt(20, 40);

  randomAmbientAudioGenerator.position.set(
    PLAYER.camera.position.x + xPosOffset,
    y,
    PLAYER.camera.position.z + zPosOffset
  );

  SCENE.scene.add(randomAmbientAudioGenerator);

  // SETUP + PLAY POSITIONAL AUDIO

  if (positionalAudioArray === phantomFeet) {
    var randomPlayBackRate = THREE.MathUtils.randFloat(1, 1.5);

    audioLoader.load(randomAudio, function (buffer) {
      positionalAmbientAudio.setBuffer(buffer);
      positionalAmbientAudio.setLoop(false);
      positionalAmbientAudio.setVolume -= 5;
      positionalAmbientAudio.setPlaybackRate(randomPlayBackRate);
      positionalAmbientAudio.setRefDistance(15);

      let randomStartTime = THREE.MathUtils.randFloat(0, buffer.duration - 5);

      positionalAmbientAudio.play(0, randomStartTime);
    });
  } else {
    var positionalAmbientAudio = new THREE.PositionalAudio(PLAYER.listener);

    var randomPlayBackRate = THREE.MathUtils.randFloat(0.25, 1);

    audioLoader.load(randomAudio, function (buffer) {
      positionalAmbientAudio.setBuffer(buffer);
      positionalAmbientAudio.setLoop(false);
      positionalAmbientAudio.setVolume -= 5;
      positionalAmbientAudio.setPlaybackRate(randomPlayBackRate);
      positionalAmbientAudio.setRefDistance(15);
      positionalAmbientAudio.play();
    });

    randomAmbientAudioGenerator.add(positionalAmbientAudio); // Add the audio to the source.

    positionalAmbientAudio.onEnded = function () {
      // When the audio ends, remove the audiosource from the scene.

      positionalAmbientAudio.isPlaying = false;
      SCENE.scene.remove(randomAmbientAudioGenerator);

      SCENE.positionalAudioChance();
    };
  }
}

// STARTUP VIRUS WARNING AUDIO ====================================================

let virusErrorMessageFinished = false;

export { virusErrorMessageFinished };

export function playVirusErrorMessage() {
  const virusErrorMessage = new Tone.Player(
    "./Sounds/Interface/InfectionWarning.wav"
  ).toDestination();

  virusErrorMessage.volume.value += 5;
  virusErrorMessage.loop = false;
  virusErrorMessage.buffer = new Tone.ToneAudioBuffer();
  virusErrorMessage.autostart = true;

  virusErrorMessageFinished = false;

  virusErrorMessage.onstop = function () {
    virusErrorMessageFinished = true;

    SCENE.triggerVirusError();
    virusErrorMessage.isPlaying = false;
    virusErrorMessage.dispose();
  };
}

// CLOCK TICKING AUDIO ( UNIMPLEMENTED ) ====================================================

// A work in progress 'clock ticking' that will eventually sync with the in-game time.

export function startClockTick() {
  var tickBuffer = new Tone.Buffer("Sounds/Interface/Tick.wav", function () {
    var tickBuff = tickBuffer.get();
    var tickPlayer = new Tone.Player(tickBuff).toDestination();

    tickPlayer.volume.value -= 25;
    tickPlayer.loop = false;

    setTimeout(playTick(tickPlayer), 1000);
  });

  function playTick(tickPlayer) {
    tickPlayer.start();
    startClockTick();
  }
}

// GENERATIVE MUSIC ====================================================

const dayTimeSampleBank = [
  // Use this bank of samples during the day.

  "Sounds/MusicGen/WhistlingNotes/B3.wav",
  "Sounds/MusicGen/WhistlingNotes/B4.wav",
  "Sounds/MusicGen/WhistlingNotes/C#4.wav",
  "Sounds/MusicGen/WhistlingNotes/C4.wav",
  "Sounds/MusicGen/WhistlingNotes/E4.wav",
  "Sounds/MusicGen/WhistlingNotes/F4.wav",
  "Sounds/MusicGen/WhistlingNotes/G#4.wav",
  "Sounds/MusicGen/WhistlingNotes/G4.wav",
  "Sounds/MusicGen/Choir/BassChoirB1.wav",
  "Sounds/PositionalAmbience/CreepySwell.wav",
  "Sounds/PositionalAmbience/CreepyLowSwell.wav",
  "Sounds/PositionalAmbience/Siren.wav"
];

const nightTimeSampleBank = ["Sounds/MusicGen/Breath/OminousBreath.wav"]; // Use this bank of samples during the night.

var sampleBank; // The sample bank to use.
var intervalRange; // How long to wait before retrieving and playing another sample.
var dayTimeIntervalRange; // Set a different musical interval during the day.
var nightTimeIntervalRange; // Set a different musical interval during the night.

let timeIndex = TIME.currentTimeIndex;
let todLength = 8;

export function genMusicTimeCheck() {
  if (virusErrorMessageFinished === false) {
    return;
  } else {
    let maxDayTimeInterval = 20000;
    let minDayTimeInterval = maxDayTimeInterval / 2;

    let maxNightTimeInterval = TIME.currentTimeIndex * 80000;
    let minNightTimeInterval = 0;

    // Interval = Wait a random number of milliseconds between 0 and 10000 (0 and 10 seconds).
    dayTimeIntervalRange = THREE.MathUtils.randInt(
      minDayTimeInterval,
      maxDayTimeInterval
    );

    // Interval = Wait a random number of milliseconds between 5000 and 15000 (5 and 15 seconds).
    nightTimeIntervalRange = THREE.MathUtils.randInt(
      minNightTimeInterval,
      maxNightTimeInterval
    );

    if (TIME.isDayTime === true) {
      // If it's daytime, pass the dayTimeSampleBank into the music system.

      sampleBank = dayTimeSampleBank;
      intervalRange = dayTimeIntervalRange; // + pass in the dayTimeInterval into the music system.
      startGenerativeMusic(sampleBank, intervalRange);
    } else if (TIME.isDayTime === false) {
      // If it's nighttime, pass the nightTimeSampleBank into the generative music system.

      sampleBank = nightTimeSampleBank;
      intervalRange = nightTimeIntervalRange; // + pass in the nightTimeInterval into the music system.
      startGenerativeMusic(sampleBank, intervalRange);
    }

    function startGenerativeMusic(sampleBank, intervalRange) {
      //console.log(sampleBank);

      var randomNoteIndex = THREE.MathUtils.randInt(0, sampleBank.length - 1);
      var randomNote = sampleBank[randomNoteIndex];
      var randomInterval = intervalRange;

      var randomPitchDeviation = THREE.MathUtils.randFloat(0.25, 1);
      var randomVolume = THREE.MathUtils.randInt(0, 5);

      var noteBuffer = new Tone.ToneAudioBuffer(randomNote);
      var notePlayer = new Tone.Player(noteBuffer).toDestination();

      notePlayer.volume.value = randomVolume;

      notePlayer.playbackRate = randomPitchDeviation;
      notePlayer.loop = false;

      playNote();

      function playNote() {
        notePlayer.autostart = true;
        setTimeout(genMusicTimeCheck, randomInterval); // Retrigger
      }
    }
  }
}

export function timeTriggerSoundCheck() {
  genMusicTimeCheck();
  ambienceTimeCheck();
}

// CLOCK CHIME EVENT AUDIO ====================================================

// The 'bell tone' that plays with each passing in-game hour.

export function playTimeChime() {
  const clockChimePlayer = new Tone.Player(
    "Sounds/Events/ClockChime.wav"
  ).toDestination();

  clockChimePlayer.playbackRate = THREE.MathUtils.randFloat(0.9, 1);
  clockChimePlayer.volume.value -= 10;
  clockChimePlayer.autostart = true;

  if (TIME.isDayTime === false) {
    // At night, play the sample back slower. Extra spooky.
    clockChimePlayer.playbackRate = 0.2;
  }
}

export function triggerGhost() {
  const ghostPlayer = new Tone.Player(
    "Sounds/NPC/Breathing.wav"
  ).toDestination();

  ghostPlayer.playbackRate = THREE.MathUtils.randFloat(0.5, 1);
  ghostPlayer.volume.value -= 15;
  ghostPlayer.loop = false;
  ghostPlayer.autostart = true;
}

export function fatalError() {
  const fatalErrorPlayer = new Tone.Player(
    "Sounds/Events/GlitchEffect.wav"
  ).toDestination();

  fatalErrorPlayer.playbackRate = 0.25;
  fatalErrorPlayer.volume.value -= 15;
  fatalErrorPlayer.loop = false;
  fatalErrorPlayer.autostart = true;
}

// DAY INCREMENT EVENT AUDIO ====================================================

const dayIncrementPlayer = new Tone.Player(
  "Sounds/Events/DayPassed.wav"
).toDestination();

export function playDayIncrementFX() {
  if (TIME.dayCount > 1) {
    dayIncrementPlayer.playbackRate = THREE.MathUtils.randFloat(0.9, 1);
    dayIncrementPlayer.volume.value -= 10;
    dayIncrementPlayer.autostart = true;
  }
}

// NIGHT LOWEND AUDIO LOOP ====================================================

//playNightBeat();

const nightBeatBuffer = new Tone.Buffer("Sounds/Ambient/LowEndThump.wav");

export function nightBeatTimeCheck() {
  var nightBeatPlayer = new Tone.Player(nightBeatBuffer).toDestination();

  if (TIME.isDayTime === true) {
    if (nightBeatPlayer.isPlaying === true) {
      nightBeatPlayer.stop();
      Tone.Transport.stop();
      nightBeatPlayer.isPlaying = false;
      Tone.Transport.dispose();
    } else {
      return;
    }
  } else if (TIME.isDayTime === false) {
    Tone.Transport.bpm.value = 30;
    Tone.Transport.scheduleRepeat((time) => {
      nightBeatPlayer.start(time).stop(time + nightBeatBuffer.duration);
    }, "2n");

    Tone.Transport.start();
    nightBeatPlayer.isPlaying = true;
    Tone.Transport.bpm.rampTo(60, 90);
  }
}

// DAY/NIGHT AMBIENCE ====================================================

export function ambienceTimeCheck() {
  const dayTimeAmbienceBuffer = new Tone.Buffer(
    "Sounds/Ambient/NatureAmbienceFM.wav"
  );

  const nightTimeAmbienceBuffer = new Tone.Buffer(
    "Sounds/Ambient/Crickets.wav"
  );

  var dayTimeAmbiencePlayer = new Tone.Player(
    dayTimeAmbienceBuffer
  ).toDestination();

  var nightTimeAmbiencePlayer = new Tone.Player(
    nightTimeAmbienceBuffer
  ).toDestination();

  if (TIME.isDayTime === true) {
    console.log("Daytime =", TIME.isDayTime);

    dayTimeAmbiencePlayer.loop = true;
    dayTimeAmbienceBuffer.onload = function () {
      dayTimeAmbiencePlayer.start();
      dayTimeAmbiencePlayer.isPlaying = true;
    };

    // In the morning, stop the nighttime ambience, if it's playing.
    if (nightTimeAmbiencePlayer.isPlaying === true) {
      nightTimeAmbiencePlayer.stop();
    } else if (TIME.isDayTime === false) {
      nightTimeAmbiencePlayer.autostart = true;
      nightTimeAmbiencePlayer.isPlaying = true;

      if (dayTimeAmbiencePlayer.isPlaying === true) {
        // At nightfall stop the daytime ambience, if it's playing.
        dayTimeAmbiencePlayer.stop();
      }
    }
  }
}
