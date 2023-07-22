import "./styles.css";
import * as THREE from "three";
import * as SCENE from "./Scene.js";
import { Vector3 } from "three";
import { virusErrorMessageFinished } from "./Audio";
// import * as NPC from "./NPCs.ts";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as TWEEN from "@tweenjs/tween.js";
import * as createjs from "createjs-module";
import * as Tone from "tone";

export const mapScale = 520;
export const mapWidth = mapScale;
export const mapHeight = mapScale;
export const mapBorderOffset = mapScale;

// Global texture loader

const textureLoader = new THREE.TextureLoader();

export function initWorld() {
  let forestZoneTex = "Textures/Nature/Grass/Grass.jpeg";

  //let desertZoneTex = "Textures/Nature/Dunes/Dunes.jpeg";

  let warpGrassAnimTex = "warpGrass";

  let zones = [forestZoneTex, warpGrassAnimTex];

  let currentZone = forestZoneTex;

  // CREATE FLOOR ================================================

  // Create the floor and add it to the scene.

  var floorTexture = textureLoader.load(currentZone);

  let textureRepeat = (mapWidth + mapHeight) / 50;

  floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
  floorTexture.repeat.set(textureRepeat, textureRepeat);
  floorTexture.encoding = THREE.sRGBEncoding;
  floorTexture.anisotropy = 0;

  var floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });

  var floorMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(mapWidth, mapHeight),
    floorMaterial,
    (floorMaterial.dithering = true)
  );

  floorMesh.position.y = 0.0;
  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.receiveShadow = true;

  SCENE.scene.add(floorMesh); // Add the initial terrain, before warping

  var phonyFloorMesh = new THREE.Mesh(
    new THREE.PlaneBufferGeometry(mapWidth * 2, mapHeight * 2),
    floorMaterial,
    (floorMaterial.dithering = true)
  );

  phonyFloorMesh.position.y = -0.2;
  phonyFloorMesh.rotation.x = -Math.PI / 2;
  phonyFloorMesh.receiveShadow = false;

  SCENE.scene.add(phonyFloorMesh); // Add the initial terrain, before warping
  // WARP BETWEEN WORLDS ( Currently Swap out floor textures)

  //warpChance();

  function warpChance() {
    let minWarpDuration = 5000; // This sets the mininum wait before a random warp can occur.
    let maxWarpDuration = 5000; // This sets the maximum wait before a random warp can occur.

    setInterval(
      zoneWarp,
      THREE.MathUtils.randInt(minWarpDuration, maxWarpDuration)
    );
  }

  function zoneWarp() {
    var randomZoneIndex = THREE.MathUtils.randInt(0, zones.length - 1);
    var currentZoneTexture = zones[randomZoneIndex];

    let currentZone = zones[randomZoneIndex];

    //console.log("currentZone:", currentZone);
    //console.log("currentZoneTexture:", currentZoneTexture);

    const duplicates = [...currentZone].sort();

    for (let i = 0; i < duplicates.length; i++) {
      if (duplicates[i + 1] === duplicates[i]) {
        // Only switch textures if the zone has actually changed.
        loadTexture();
      }
    }

    function loadTexture() {
      console.log("texture loaded!");

      console.log(currentZoneTexture);

      let zoneTexture = textureLoader.load(currentZoneTexture);

      zoneTexture.wrapS = zoneTexture.wrapT = THREE.RepeatWrapping;
      zoneTexture.repeat.set(textureRepeat, textureRepeat);
      zoneTexture.encoding = THREE.sRGBEncoding;
      zoneTexture.anisotropy = 1;

      /*
      setTimeout(() => {
        floorMesh.material.map = zoneTexture;
        console.log(zoneTexture);
        setInterval(warpChance, 5000);
        //texture1.dispose();
      }, 3000);
      */
    }
  }
  /*

    function loadVideoTexture() {

      console.log("video loaded!");

      let videoPlayer = document.createElement("grassTexture");

      videoPlayer.playsInline = true;
      videoPlayer.loop = true;
      videoPlayer.autoplay = true;
      videoPlayer.width = "189";
      videoPlayer.height = "189";
      videoPlayer.src = "./Video/Textures/GrassGif.mp4";
      videoPlayer.style = "display: none";
      videoPlayer.crossOrigin = "anonymous";

      let vidTex = videoPlayer;

      let vidTexture = new THREE.VideoTexture(vidTex);

      vidTexture.minFilter = THREE.LinearFilter;
      vidTexture.magFilter = THREE.LinearFilter;

      vidTexture.repeat.set(textureRepeat, textureRepeat);
      vidTexture.wrapS = vidTexture.wrapT = THREE.RepeatWrapping;

      var videoMaterial = new THREE.MeshBasicMaterial({
        map: vidTexture,
        side: THREE.DoubleSide,
        toneMapped: false
      });

      floorMesh.material.map = videoMaterial;
      video.load();
      video.play();
      videoUpdate(vidTexture);

      function videoUpdate() {
        vidTexture.needsUpdate = true;
        requestAnimationFrame(videoUpdate);
      }
      
    }
    

  let videoPlayer = document.createElement("video");

  videoPlayer.playsInline = true;
  videoPlayer.loop = true;
  videoPlayer.autoplay = true;
  videoPlayer.width = "189";
  videoPlayer.height = "189";
  videoPlayer.src = "./Video/Textures/GrassGif.mp4";
  videoPlayer.style = "display: none";
  videoPlayer.crossOrigin = "anonymous";
*/

  // MAP FENCE BORDER ================================================================

  // Create the border around the map and add it to the scene.

  initMapfence();

  function initMapfence() {
    let mapBorderTex = textureLoader.load(
      "Textures/StructMaterials/chainLinkFence1.png"
    );

    mapBorderTex.wrapS = mapBorderTex.wrapT = THREE.RepeatWrapping;
    mapBorderTex.repeat.set(12, 1);
    mapBorderTex.anisotropy = 1;
    mapBorderTex.encoding = THREE.sRGBEncoding;

    var mapBorderMaterial = new THREE.MeshLambertMaterial({
      opacity: 1,
      transparent: true,
      map: mapBorderTex,
      side: THREE.DoubleSide
    });

    mapBorderMaterial.depthWrite = true;

    var mapBorder = new THREE.Group();
    mapBorder.scale.set(mapBorderOffset, 20, mapBorderOffset);

    SCENE.scene.add(mapBorder);

    setPlane("y", Math.PI * 0.5, 0x804000); //px
    setPlane("y", -Math.PI * 0.5, 0x804000); //nx
    setPlane("y", 0, 0x804000); //pz
    setPlane("y", Math.PI, 0x804000); // nz

    function setPlane(axis, angle) {
      let planeGeom = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
      planeGeom.translate(0, 0, 0.5);
      switch (axis) {
        case "y":
          planeGeom.rotateY(angle);
          break;
        default:
          planeGeom.rotateX(angle);
      }

      let plane = new THREE.Mesh(planeGeom, mapBorderMaterial);
      mapBorder.position.setY(10);

      plane.renderOrder = 2;
      mapBorder.add(plane);
    }
  }

  initForestBackDrop();

  function initForestBackDrop() {
    let forestBackDropTex = textureLoader.load(
      "Textures/Nature/Trees/ForestBackground.png"
    );

    forestBackDropTex.wrapS = forestBackDropTex.wrapT = THREE.RepeatWrapping;
    forestBackDropTex.repeat.set(3, 1);
    forestBackDropTex.anisotropy = 1;
    forestBackDropTex.encoding = THREE.sRGBEncoding;

    var forestBackDropMaterial = new THREE.MeshLambertMaterial({
      opacity: 1,
      transparent: true,
      map: forestBackDropTex,
      side: THREE.DoubleSide
    });

    forestBackDropMaterial.depthWrite = false;

    var forestBackDrop = new THREE.Group();

    let y = 50;

    let backDropOffset = (mapBorderOffset / 15) * 4;

    forestBackDrop.scale.set(
      mapBorderOffset + backDropOffset,
      y,
      mapBorderOffset + backDropOffset
    );

    SCENE.scene.add(forestBackDrop);

    setPlane("y", Math.PI * 0.5, 0x804000); //px
    setPlane("y", -Math.PI * 0.5, 0x804000); //nx
    setPlane("y", 0, 0x804000); //pz
    setPlane("y", Math.PI, 0x804000); // nz

    function setPlane(axis, angle) {
      let planeGeom = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
      planeGeom.translate(0, 0, 0.5);
      switch (axis) {
        case "y":
          planeGeom.rotateY(angle);
          break;
        default:
          planeGeom.rotateX(angle);
      }

      let backDropMesh = new THREE.Mesh(planeGeom, forestBackDropMaterial);
      forestBackDrop.position.setY(y - y / 2);
      backDropMesh.renderOrder = 1;
      forestBackDrop.add(backDropMesh);
    }
  }
}
// GENERATE MAP OBJECTS ================================================================

/*
The 'createObject' functions are called from 'PoissonDiskSampling.js', passing in the textures/objects + position (disk sampling coordinates) and scale.
These functions initialise and add the objects to the scene using the parameters passed in from poisson-disk sampling.
*/

// CREATE SPRITE OBJECTS ================================================================

export function createSpriteObject(textureArray, _position, _scale) {
  var randomIndex = THREE.MathUtils.randInt(0, textureArray.length - 1); // Get random index from the texture array containing different objects.
  var randomTexture = textureLoader.load(textureArray[randomIndex]); // Load the random texture
  var material = new THREE.SpriteMaterial({ map: randomTexture }); // Create a new sprite, apply the random Texture
  material.anisotropy = 0;
  material.encoding = THREE.sRGBEncoding;

  const type = new THREE.Sprite(material); // 'type' = the type of object to initialise and add to the scene.

  type.scale.set(_scale.x, _scale.y, _scale.z);
  type.position.x = _position.x;
  type.position.y = _position.y;
  type.position.z = _position.z;
  type.dithering = true;
  type.updateMatrix();
  type.matrixAutoUpdate = false;

  SCENE.scene.add(type);
}

// Create Video Planes

/*
export function createVideoPlanes(videoTextureArray, _position, _scale) {
  var randomIndex = THREE.MathUtils.randInt(0, videoTextureArray.length); // Get random index from the texture array containing different objects.
  var randomTexture = textureLoader.load(videoTextureArray[randomIndex]); // Load the random texture
  var material = new THREE.SpriteMaterial({ map: randomTexture }); // Create a new sprite, apply the random Texture
  material.anisotropy = 0;
  material.encoding = THREE.sRGBEncoding;

  const type = new THREE.Plane(material); // 'type' = the type of object to initialise and add to the scene.

  type.scale.set(_scale.x, _scale.y, _scale.z);
  type.position.x = _position.x;
  type.position.y = _position.y;
  type.position.z = _position.z;
  type.dithering = true;
  type.updateMatrix();
  type.matrixAutoUpdate = false;

  SCENE.scene.add(type);
}
*/

// CREATE MESH GROUP OBJECTS ================================================================
// Uses the same method as above, but specifically for mesh objects, picked from an array of mesh objects (abstracted into groups).

let shrineGroup = new THREE.Group();

export function createMeshObject(
  meshObjectArray,
  _position,
  mythicalShrineObject
) {
  var randomIndex = THREE.MathUtils.randInt(0, meshObjectArray.length - 1);
  var randomObject = meshObjectArray[randomIndex];
  var randomRotation = new THREE.MathUtils.randInt(0, 360);

  var objectInstance = randomObject.clone();

  objectInstance.position.x = _position.x;
  objectInstance.position.y = -15;
  objectInstance.position.z = _position.z;
  objectInstance.scale.set(1.5, 1.6, 1.5);
  objectInstance.rotateX = randomRotation;
  objectInstance.updateMatrix();
  objectInstance.matrixAutoUpdate = false;

  if (objectInstance === mythicalShrineObject) {
    console.log("Shrine Generated!");
  }

  shrineGroup.add(objectInstance);

  SCENE.scene.add(shrineGroup);
}

let frequency = 10000;

export function riseFromGround() {
  let yOffset = 15;

  createjs.Tween.get(shrineGroup.position, { loop: false }).to(
    { y: shrineGroup.position.y + yOffset },
    frequency
  );
}

export function riseFromGroundAudio() {
  const risePlayer = new Tone.Player(
    "Sounds/Events/StoneRising.wav"
  ).toDestination();

  const risenPlayer = new Tone.Player(
    "Sounds/Events/StoneRisen.wav"
  ).toDestination();

  risePlayer.playbackRate = THREE.MathUtils.randFloat(0.9, 1);
  risePlayer.volume.value -= 15;
  risePlayer.loop = true;
  risePlayer.autostart = true;

  risenPlayer.playbackRate = THREE.MathUtils.randFloat(0.9, 1);
  risenPlayer.volume.value -= 15;
  risenPlayer.loop = false;

  setTimeout(stopRisePlayer, frequency);

  function stopRisePlayer() {
    risenPlayer.start();
    risePlayer.stop();
  }
}

export { textureLoader };

/*
// CREATE NPCS ================================================================
// An unused generator that can add NPC's to the scene using poisson disk coordinates.

export function createjs(NPClist, _position) {

  var randomIndex = THREE.MathUtils.randInt(0, NPClist.length);

  let objectInstance = NPC.hoodedHumanGroup.clone();

  objectInstance.position.x = _position.x;
  objectInstance.position.y = 0;
  objectInstance.position.z = _position.z;

  SCENE.scene.add(objectInstance);
}

// CREATE GLTF OBJECTS ================================================================
// An unused generator that can add custom 3D mesh objects (GLTF objects) to the scene using poisson disk coordinates.

export function createGLTFObject(_position) {
  let sacredTreeLoader = new GLTFLoader();

  sacredTreeLoader.load("3DModels/Tree.gltf", (gltf) => {
    let sacredTree = gltf.scene;

    sacredTree.position.y = 0;
    sacredTree.position.x = _position.x;
    sacredTree.position.z = _position.z;
    sacredTree.rotateOnAxis = Math.random(0 - Math.PI);
    sacredTree.scale.set(2, 2, 2);
    SCENE.scene.add(sacredTree);
  });
}
*/
