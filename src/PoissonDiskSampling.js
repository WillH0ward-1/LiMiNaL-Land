import "./styles.css";
import * as THREE from "three";
import { mythicalShrineObject } from "./structureShrine.js";
//import {houseObject} from "./structureHouse.js";
import * as NPC from "./NPCs";
import * as WORLD from "./WorldGen.js";
import { MathUtils } from "three";

export function initPDS() {
  const PoissonDiskSampling = require("poisson-disk-sampling/src/implementations/fixed-density");

  // TEXTURE / OBJECT BANKS =================================================

  const treeTexturesList = [
    "Textures/Nature/Trees/Tree1.png",
    "Textures/Nature/Trees/Tree2.png",
    "Textures/Nature/Trees/Tree3.png",
    "Textures/Nature/Trees/Tree4.png",
    "Textures/Nature/Trees/Tree5.png",
    "Textures/Nature/Trees/Tree6.png",

    "Textures/Nature/Trees/Tree1Flipped.png", // Same images, horizontally flipped. Haven't figured out a way to do this in code, this works.
    "Textures/Nature/Trees/Tree2Flipped.png",
    "Textures/Nature/Trees/Tree3Flipped.png",
    "Textures/Nature/Trees/Tree4Flipped.png",
    "Textures/Nature/Trees/Tree5Flipped.png",
    "Textures/Nature/Trees/Tree6Flipped.png"
  ];

  const foliageTexturesList = ["Textures/Nature/Foliage/LongGrass.png"];

  const NPClist = [NPC.hoodedHumanGroup];

  const meshObjectArray = [
    mythicalShrineObject
    //houseObject
  ];

  const diskSampleOffset = WORLD.mapBorderOffset / 2.15;
  const diskSampleRange = WORLD.mapBorderOffset - 30;

  // MESH OBJECTS - DISK SAMPLING =================================================

  var structureSamples = new PoissonDiskSampling({
    shape: [diskSampleRange, diskSampleRange],
    minDistance: 100,
    maxDistance: 100,
    tries: 30
  });

  var structurePoints = structureSamples.fill();

  for (let i = 0; i < structurePoints.length - 1; i++) {
    var x = Math.round(structurePoints[i][0]) - diskSampleOffset;
    var y = 12;
    var z = Math.round(structurePoints[i][1]) - diskSampleOffset;

    var pos = new THREE.Vector3(x, y, z);

    WORLD.createMeshObject(meshObjectArray, pos, mythicalShrineObject);
  }
  structureSamples.reset();

  // TREES - DISK SAMPLING =================================================

  var treeSamples = new PoissonDiskSampling({
    shape: [diskSampleRange, diskSampleRange],
    minDistance: 50,
    maxDistance: 70,
    tries: 30
  });

  var treePoints = treeSamples.fill();

  let GlobalScale = 42;
  let xScale = GlobalScale;
  let yScale = GlobalScale;
  let zScale = GlobalScale;

  let yOffset = 1;

  for (let i = 0; i < treePoints.length - 1; i++) {
    var x = Math.round(treePoints[i][0]) - diskSampleOffset;
    var y = GlobalScale - yScale / 2 - yOffset;
    var z = Math.round(treePoints[i][1]) - diskSampleOffset;

    var pos = new THREE.Vector3(x, y, z);
    var scale = new THREE.Vector3(xScale, yScale, zScale);

    WORLD.createSpriteObject(treeTexturesList, pos, scale);
  }

  treeSamples.reset();

  // FOLIAGE - DISK SAMPLING  =================================================

  var foliageSamples = new PoissonDiskSampling({
    shape: [diskSampleRange, diskSampleRange],
    minDistance: 25,
    maxDistance: 50,
    tries: 30
  });

  var foliagePoints = foliageSamples.fill();

  let randomGlobalScale = MathUtils.randFloat(2, 4);
  let randomXScale = randomGlobalScale;
  let randomYScale = randomGlobalScale;
  let randomZScale = randomGlobalScale;

  for (let i = 0; i < foliagePoints.length - 1; i++) {
    var x = Math.round(foliagePoints[i][0]) - diskSampleOffset;
    var y = randomGlobalScale - randomYScale / 2 - yOffset;
    var z = Math.round(foliagePoints[i][1]) - diskSampleOffset;

    var pos = new THREE.Vector3(x, y, z);

    var scale = new THREE.Vector3(randomXScale, randomYScale, randomZScale);

    WORLD.createSpriteObject(foliageTexturesList, pos, scale);
  }

  foliageSamples.reset();
}

// NPCs - DISK SAMPLING  =================================================

/*

  diskSamples = new PoissonDiskSampling({
    shape: [diskSampleRange, diskSampleRange],
    minDistance: 150,
    maxDistance: 150,
    tries: 10
  });

  points = diskSamples.fill();
  //console.log(points);

  for (let i = 0; i < points.length - 1; i++) {
    var x = Math.round(points[i][0]) - diskSampleOffset;
    var y = 3.5;
    var z = Math.round(points[i][1]) - diskSampleOffset;

    var pos = new THREE.Vector3(x, y, z);

    WORLD.createjs(NPClist, pos);
  }
  diskSamples.reset();

}

*/

// GLTF OBJECTS - DISK SAMPLING (UNUSED)

/*
  diskSamples = new PoissonDiskSampling({
    shape: [diskSampleRange, diskSampleRange],
    minDistance: 50,
    maxDistance: 100,
    tries: 30
  });

  var points = diskSamples.fill();

  console.log(points);

  for (let i = 0; i < points.length - 1; i++) {
    var x = Math.round(points[i][0]) - diskSampleOffset;
    var y = 12;
    var z = Math.round(points[i][1]) - diskSampleOffset;

    var pos = new THREE.Vector3(x, y, z);

    WORLD.createGLTFObject(pos);
  }
  */
