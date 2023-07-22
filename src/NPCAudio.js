import "./styles.css";
import * as THREE from "three";
import * as PLAYER from "./Player.js";
import * as TIME from "./TimeCycle.js";
import * as SCENE from "./Scene.js";
import { hoodedHumanGroup } from "./NPCs.ts";
import { scene } from "./Startup";

// DAY/NIGHT TRIGGER (SPAWN/DESPAWN NPC + AUDIO) ==================================================

export function npcTimeCheck() {
  if (TIME.isDayTime === true) {
    hoodedHumanGroup.visible = false;
    SCENE.scene.remove(hoodedHumanGroup);
    npcAudio();
  } else if (TIME.isDayTime === false) {
    SCENE.scene.add(hoodedHumanGroup);
    hoodedHumanGroup.visible = true;

    var zOffset = THREE.MathUtils.randInt(5, 15);
    var xOffset = THREE.MathUtils.randInt(5, 15);

    hoodedHumanGroup.position.set(
      PLAYER.camera.position.x + xOffset,
      0,
      PLAYER.camera.position.z + zOffset
    );

    npcAudio();
  }
}

// NPC POSITIONAL AUDIO ==================================================

//var randomPlayBackRate = THREE.MathUtils.randFloat(0.25, 1);

const posAudioStages = [
  "./Sounds/NPC/PositionalAudio/Stage1.wav",
  "./Sounds/NPC/PositionalAudio/Stage2.wav",
  "./Sounds/NPC/PositionalAudio/Stage3.wav"
];

var stageNumber = 0;

function npcAudio() {
  const audioLoader = new THREE.AudioLoader();
  var positionalNPCAudio = new THREE.PositionalAudio(PLAYER.listener);

  if (TIME.isDayTime === false) {
    var posAudioIndex = posAudioStages[stageNumber];

    stageNumber += 1;
    if (stageNumber > posAudioStages.length) {
      stageNumber = posAudioStages.length - 1;
    }

    audioLoader.load(posAudioIndex, function (buffer) {
      positionalNPCAudio.setBuffer(buffer);
      positionalNPCAudio.setLoop(true);
      positionalNPCAudio.setVolume(5);
      positionalNPCAudio.setPlaybackRate(-5);
      positionalNPCAudio.setRefDistance(5);
      positionalNPCAudio.play();
      positionalNPCAudio.isPlaying = true;
    });

    hoodedHumanGroup.add(positionalNPCAudio);
  } else if (TIME.isDayTime === true && positionalNPCAudio.isPlaying === true) {
    console.log("yes");
    positionalNPCAudio.isPlaying = false;
    positionalNPCAudio.stop();
    stageNumber = 0;
  }
}
