import "./styles.css";
import * as THREE from "three";
import * as PLAYER from "./Player.js";
import { OBB } from "three/examples/jsm/math/OBB";

////////////////////////////////////////////////////////////////////////////////////////////
// NPC ===================================================================================

// Initialise the NPC, setup it's appearance, dialogue, and attach it's collider.
// Group the sprite + collider together.

// DIALOGUE HANDLER =================================================

// Stores an array of possible dialogues that appear on interaction with NPCS
// There is a small system in place that helps prevent the same dialogue from occuring more than once

const dialogueText = document.createElement("div");

const dialogueBank = [
  "the cloaked figure says nothing.",
  "you can't quite see his face..."
];

let playerHasCollided = false;

var previousIndex = dialogueBank.length;

function generateRandomIndex(ignoreIndex, counter) {
  var randomDialogueIndex = THREE.MathUtils.randInt(0, dialogueBank.length - 1);
  if (randomDialogueIndex === ignoreIndex && counter < 9) {
    return generateRandomIndex(ignoreIndex, counter++);
  }
  return randomDialogueIndex;
}

function dialoguePrompt() {
  if (playerHasCollided === true) {
    return;
  }

  var randomDialogueIndex = generateRandomIndex(previousIndex, 0);

  previousIndex = randomDialogueIndex;

  var randomDialogueText = dialogueBank[randomDialogueIndex];

  // HMTL/CSS ELEMENTS

  dialogueText.innerHTML = randomDialogueText;
  dialogueText.hidden = false;
  dialogueText.style.position = "absolute";
  dialogueText.style.color = "white";
  dialogueText.style.backgroundColor = "black";
  dialogueText.style.opacity = "0.9";
  dialogueText.style.outline = "inset";
  dialogueText.style.fontWeight = "lighter";
  dialogueText.style.fontFamily = "Wingdings";
  dialogueText.style.fontSize = 20 + "px";
  dialogueText.style.textAlign = "center";
  dialogueText.style.letterSpacing = 3 + "px";
  dialogueText.style.width = "50%";
  dialogueText.style.height = "15%";
  dialogueText.style.top = window.innerHeight / 1 + "px";
  dialogueText.style.left = "0";
  dialogueText.style.right = "0";
  dialogueText.style.bottom = window.innerHeight / 4 + "px";
  dialogueText.style.margin = "auto";

  document.body.appendChild(dialogueText);
}

// NPC EVENT COLLIDER ==================================================

const geometry = new THREE.CylinderBufferGeometry(10, 10, 5, 20, 1);

const playerColliderMaterial = new THREE.MeshLambertMaterial({
  opacity: 0,
  transparent: true
});

const npcColliderMaterial = new THREE.MeshLambertMaterial({
  opacity: 0,
  transparent: true,
  side: THREE.BackSide
});

const npcEventCollider = new THREE.Mesh(geometry, npcColliderMaterial);

npcEventCollider.geometry.computeBoundingBox();
npcEventCollider.geometry.userData.obb = new OBB().fromBox3(
  npcEventCollider.geometry.boundingBox as THREE.Box3
);

npcEventCollider.position.set(0, 0, 0);

npcEventCollider.userData.obb = new OBB();

// PLAYER COLLIDER ==================================================

const playerMesh = new THREE.Mesh(geometry, playerColliderMaterial);

//playerMesh.geometry.computeBoundingBox();
playerMesh.geometry.userData.obb = new OBB().fromBox3(
  playerMesh.geometry.boundingBox as THREE.Box3
);
export function updatePlayerMeshPosition() {
  playerMesh.position.copy(PLAYER.camera.position);
}

playerMesh.userData.obb = new OBB();

export { npcEventCollider, playerMesh };

// NPC COLLISION EVENT ==================================================

export function checkColliderEvent() {
  npcEventCollider.userData.obb.copy(npcEventCollider.geometry.userData.obb);
  playerMesh.userData.obb.copy(playerMesh.geometry.userData.obb);

  npcEventCollider.userData.obb.applyMatrix4(npcEventCollider.matrixWorld);
  playerMesh.userData.obb.applyMatrix4(playerMesh.matrixWorld);

  if (npcEventCollider.userData.obb.intersectsOBB(playerMesh.userData.obb)) {
    npcEventCollider.material.color.set(0xff0000);
    //console.log("collision!");
    dialoguePrompt();
    playerHasCollided = true;
  } else {
    playerHasCollided = false;
    npcEventCollider.material.color.set(0x00ff00);
    //console.log("not colliding!");
    dialogueText.hidden = true;
  }
}

// NPC SPRITE ==================================================

let hoodedHumanTexture = new THREE.TextureLoader().load(
  "Textures/Humanoids/Watcher.png"
);

var hoodedHumanMaterial = new THREE.SpriteMaterial({
  map: hoodedHumanTexture
});

var hoodedHumanSprite = new THREE.Sprite(hoodedHumanMaterial);

hoodedHumanTexture.anisotropy = 0;
hoodedHumanTexture.encoding = THREE.sRGBEncoding;

hoodedHumanSprite.scale.x = 10;
hoodedHumanSprite.scale.y = 15;
hoodedHumanSprite.position.y = 5;

// NPC + COLLIDER GROUPING ==================================================

let hoodedHumanGroup = new THREE.Group();

//hoodedHumanGroup.name = "hoodedHumanGroup";

hoodedHumanGroup.add(npcEventCollider);
hoodedHumanGroup.add(hoodedHumanSprite);

export { hoodedHumanGroup };
