import "./styles.css";
import * as THREE from "three";
import { textureLoader } from "./WorldGen";

// MARBLE TEXTURE + MATERIAL

const marbleTex = textureLoader.load("Textures/StructMaterials/Marble.jpeg");

marbleTex.wrapS = marbleTex.wrapT = THREE.RepeatWrapping;
marbleTex.repeat.set(2, 1);
marbleTex.anisotropy = 0;
marbleTex.encoding = THREE.sRGBEncoding;

const marbleMaterial = new THREE.MeshStandardMaterial({ map: marbleTex });

// FLOATING TRIANGLE

const stoneTriangle = new THREE.Mesh(
  new THREE.ConeBufferGeometry(2, 4, 4, 12),
  marbleMaterial,
  (marbleMaterial.dithering = true)
);

stoneTriangle.position.y = 3;
stoneTriangle.position.x = 0;
stoneTriangle.position.z = 0;

stoneTriangle.receiveShadow = false;

// AUDIO VISUALISING SPHERE

const audioSphereMaterial = new THREE.MeshStandardMaterial();
audioSphereMaterial.color = new THREE.Color(0xffb3ff);

const audioSphereMesh = new THREE.Mesh(
  new THREE.IcosahedronBufferGeometry(1, 10),
  audioSphereMaterial,
  (audioSphereMaterial.dithering = true)
);

audioSphereMesh.position.y = 7;
audioSphereMesh.position.x = 0;
audioSphereMesh.position.z = 0;

audioSphereMesh.receiveShadow = true;
audioSphereMesh.castShadow = true;

const scrawledRockTex = textureLoader.load(
  "Textures/StructMaterials/MythicalPillar.jpeg"
);

scrawledRockTex.repeat.set(1, 1);
scrawledRockTex.anisotropy = 1;

scrawledRockTex.encoding = THREE.sRGBEncoding;

const scrawledRockMaterial = new THREE.MeshStandardMaterial({
  map: scrawledRockTex
});

const whistlingObelisk = new THREE.Mesh(
  new THREE.CylinderBufferGeometry(1.5, 2, 10, 6),
  scrawledRockMaterial,
  (scrawledRockMaterial.dithering = true)
);

whistlingObelisk.position.y = 5;
whistlingObelisk.position.x = 0;
whistlingObelisk.position.z = -10;

const whistlingObelisk2 = whistlingObelisk.clone();
whistlingObelisk2.position.z = 10;

const whistlingObelisk3 = whistlingObelisk.clone();
whistlingObelisk3.position.z = 0;
whistlingObelisk3.position.x = -10;

const whistlingObelisk4 = whistlingObelisk.clone();
whistlingObelisk4.position.z = 0;
whistlingObelisk4.position.x = 10;

// OBJECT BASE

const lightBase = new THREE.Mesh(
  new THREE.CylinderBufferGeometry(4, 5, 1, 32),
  scrawledRockMaterial,
  (scrawledRockMaterial.dithering = true)
);

lightBase.position.y = 0;
lightBase.position.x = 0;
lightBase.position.z = 0;

const mythicalShrineObject = new THREE.Group();

mythicalShrineObject.add(lightBase);
mythicalShrineObject.add(stoneTriangle);
mythicalShrineObject.add(audioSphereMesh);
mythicalShrineObject.add(whistlingObelisk);
mythicalShrineObject.add(whistlingObelisk2);
mythicalShrineObject.add(whistlingObelisk3);
mythicalShrineObject.add(whistlingObelisk4);

export { mythicalShrineObject };
