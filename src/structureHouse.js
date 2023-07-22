/*
import "./styles.css";
import * as THREE from "three";

// HOUSE
// An unused house object that can be generated on the map.

const paintedWallTexture = new THREE.TextureLoader().load(
  "Textures/StructMaterials/HouseWallWindow.jpg"
);

paintedWallTexture.wrapS = paintedWallTexture.wrapT = THREE.RepeatWrapping;
paintedWallTexture.repeat.set(2, 1);
paintedWallTexture.anisotropy = 0;
//paintedWallTexture.encoding = THREE.sRGBEncoding;

const paintedWallMaterial = new THREE.MeshBasicMaterial({
  map: paintedWallTexture
});

// HOUSE WALLS

const houseBoxStructure = new THREE.Mesh(
  new THREE.BoxBufferGeometry(40, 15, 40, 1),
  paintedWallMaterial,
  (paintedWallMaterial.dithering = true)
);

houseBoxStructure.position.y = 6;
houseBoxStructure.position.x = 0;
houseBoxStructure.position.z = 0;

houseBoxStructure.receiveShadow = false;

const houseRoofTexture = new THREE.TextureLoader().load(
  "Textures/StructMaterials/RoofTiles.jpg"
);

houseRoofTexture.wrapS = houseRoofTexture.wrapT = THREE.RepeatWrapping;
houseRoofTexture.repeat.set(16, 1);
houseRoofTexture.anisotropy = 0;
//paintedWallTexture.encoding = THREE.sRGBEncoding;

const houseRoofMaterial = new THREE.MeshBasicMaterial({
  map: houseRoofTexture
});

// HOUSE ROOF 

const houseRoofStructure = new THREE.Mesh(
  new THREE.CylinderBufferGeometry(18, 30, 8, 4, 4),
  houseRoofMaterial,
  (houseRoofMaterial.dithering = true)
);

houseRoofStructure.position.y = 18;
houseRoofStructure.position.x = 0;
houseRoofStructure.position.z = 0;
houseRoofStructure.rotateY(150);

houseRoofStructure.receiveShadow = false;

const houseDoorTexture = new THREE.TextureLoader().load(
  "Textures/StructMaterials/HouseDoor.jpg"
);

houseDoorTexture.wrapS = houseDoorTexture.wrapT = THREE.RepeatWrapping;
houseDoorTexture.repeat.set(1, 1);
houseDoorTexture.anisotropy = 0;
//paintedWallTexture.encoding = THREE.sRGBEncoding;

const houseDoorMaterial = new THREE.MeshBasicMaterial({
  map: houseDoorTexture
});

// HOUSE DOOR

const houseDoorStructure = new THREE.Mesh(
  new THREE.BoxBufferGeometry(6, 12, 1, 1, 1, 0),
  houseDoorMaterial,
  (houseDoorMaterial.dithering = true)
);

houseDoorStructure.position.y = 5;
houseDoorStructure.position.x = 0;
houseDoorStructure.position.z = 20;

houseDoorStructure.receiveShadow = false;


const houseObject = new THREE.Group();

houseObject.add(houseBoxStructure);
houseObject.add(houseRoofStructure);
houseObject.add(houseDoorStructure);

houseObject.scale.set(1, 0.8, 1);

export { houseObject };

*/
