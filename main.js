//import { OrbitControls } from "../node_modules/three-full/sources/controls/OrbitControls.js";
//import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { RGBELoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/RGBELoader.js';
import { GLTFLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/loaders/GLTFLoader.js';

function getScene() {
    return new THREE.Scene();
}

function getCamera() {
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight, // Set initial aspect ratio based on window size
        0.1,
        1000
    );
    // Set the starting position to (0, 0, 0)
    camera.position.set(2, 1.86, 2);

    return camera;
}

function getRenderer() {
    // Create a camera
    const size = 300; // Adjusted size
  
    // Create a renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
  
    return renderer;
}

function createOrbitControls(camera, renderer) {
    // Create orbital controls
    let controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;
  
    return controls;
}

function getDirectionalLight() {
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);

    return directionalLight;
}
  
function getAmbientLight() {
    return new THREE.AmbientLight(0x404040);
}

function loadEnvMap(scene, renderer) {
    // Declare envMap outside the loader callback
    let envMap;
  
    // Load the HDR texture
    const loader = new RGBELoader();
    loader.setDataType(THREE.UnsignedByteType);
    loader.load(
      '/assets/images/sight/starmap_2020_4k.hdr',
      (texture) => {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        envMap = pmremGenerator.fromEquirectangular(texture).texture;
  
        // Set the HDR texture as the background of the renderer
        renderer.setClearColor(new THREE.Color().setRGB(0, 0, 0), 0);
        scene.background = envMap;
  
        texture.dispose();
        pmremGenerator.dispose();
      },
      undefined,
      (err) => {
        console.error('Error loading HDR texture', err);
      }
    );
  }

  function loadGLTFModel(scene) {
    const loader = new GLTFLoader();

    // Load the GLTF model
    loader.load(
        '/assets/3D/symbol2.gltf',
        (gltf) => {
            // Adjust the position, rotation, and scale of the loaded model as needed
            gltf.scene.position.set(0, 0, 0);
            gltf.scene.rotation.set(0, 0, 0);
            gltf.scene.scale.set(1, 1, 1);

            // Add the loaded model to the scene
            scene.add(gltf.scene);
        },
        undefined,
        (error) => {
            console.error('Error loading GLTF model', error);
        }
    );
}

// Wait for the DOM content to be loaded
document.addEventListener("DOMContentLoaded", function () {
    const scene = getScene();
    const camera = getCamera();
    const renderer = getRenderer();
    loadEnvMap(scene, renderer);
    scene.add(getDirectionalLight());
    scene.add(getAmbientLight());

    // Append the renderer to the 3d-screen section
    document.querySelector(".three-screen").appendChild(renderer.domElement);

    //const controls = createOrbitControls(camera, renderer);

    // Load the GLTF model
    loadGLTFModel(scene);

    // Animation function
    var animate = function () {
        requestAnimationFrame(animate);

        // Update the controls
        //controls.update();

        // rotate the model
        scene.children[0].rotation.y += 0.01;

        // Render the scene
        renderer.render(scene, camera);
    };

    // Start the animation
    animate();

    // Resize handler
    window.addEventListener("resize", function () {
        // Update the camera and renderer size on window resize
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});