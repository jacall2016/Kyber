//import { OrbitControls } from "../node_modules/three-full/sources/controls/OrbitControls.js";
import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r122/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r127/examples/jsm/controls/OrbitControls.js';
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
      'starmap_2020_4k.hdr',
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

  function loadGLTFModel(scene, gltfFileName) {
    const loader = new GLTFLoader();
    loader.load(
        './assets/3D/' + gltfFileName,
        (gltf) => {
            scene.add(gltf.scene);
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
    populateCardListFromJson(scene);
    const camera = getCamera();
    const renderer = getRenderer();
    loadEnvMap(scene, renderer);
    scene.add(getDirectionalLight());
    scene.add(getAmbientLight());

    // Append the renderer to the 3d-screen section
    document.querySelector(".three-screen").appendChild(renderer.domElement);

    const controls = createOrbitControls(camera, renderer);

    // Animation function
    var animate = function () {
        requestAnimationFrame(animate);

        // Update the controls
        controls.update();

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

let cards = []; 

class Card {
    constructor(id, title, description, price, gltfFileName, thumbnailImageName, categoryList) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.gltfFileName = gltfFileName;
        this.thumbnailImageName = thumbnailImageName;
        this.categoryList = categoryList;
        this.active = false;
    }
}

function readKybersJson() {
    return fetch('kybers.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .catch(error => {
            console.error('Error reading kybers.json:', error);
            return []; // Return an empty array if there's an error
        });
}

function toggleCardActive(scene, cardId) {
    cards.forEach(card => {
        card.active = false;
        const detailsDiv = document.getElementById(`details_${card.id}`);
        detailsDiv.style.display = 'none';
    });

    const card = findCardById(cardId);
    if (card) {
        card.active = true;
        const detailsDiv = document.getElementById(`details_${card.id}`);
        detailsDiv.style.display = 'block';

        // Load GLTF model associated with the active card
        loadGLTFModel(scene, card.gltfFileName);
    }
}

function findCardById(cardId) {
    // Loop through the cards array to find the card with the specified id
    for (let i = 0; i < cards.length; i++) {
        if (cards[i].id === cardId) {
            return cards[i]; // Return the card object if found
        }
    }
    return null; // Return null if no card with the specified id is found
}

function populateCardListFromJson(scene) {
    const cardContainer = document.getElementById('card-container');

    readKybersJson()
        .then(data => {
            const kybersJson = data.kybers; // Access the array of kybers
            kybersJson.forEach((kyber, index) => {
                const { id, title, description, price, gltfFileName, thumbnailImageName, categoryList } = kyber;
                const card = new Card(id, title, description, price, gltfFileName, thumbnailImageName, categoryList);
                cards.push(card);
                const checkedAttribute = index === 0 ? 'checked' : '';
                const cardElement = document.createElement('div');
                cardElement.innerHTML = `
                <div class="card">
                    <label for="card_${card.id}">
                        <input type="radio" name="card" class="card-radio" id="card_${card.id}" onclick="toggleCardActive(scene, ${card.id});" ${checkedAttribute}>
                        <img src="assets/images/thumbnails/${card.thumbnailImageName}" alt="${card.title}">
                        <h2 class="title">${card.title}</h2>
                        <div class="details" id="details_${card.id}" style="display: ${card.active ? 'block' : 'none'}">
                            <p>${card.description}</p>
                            <p>Price: $${card.price}</p>
                            <p>Categories: ${card.categoryList.join(', ')}</p>
                            <button class="add-catagory">+</button>
                            <p>File Name: ${card.gltfFileName}</p>
                            <button class="add-to-cart">&#x1F6D2;</button>
                            <button class="edit-details">&#x1F527;</button>
                            <button class="delete-card">&#x1F5D1;</button>
                        </div>
                    </label>
                </div>
                `;
                cardContainer.appendChild(cardElement);
            });

            toggleCardActive(scene, cards[0].id);

            // After populating the card list, also populate the category list
            populateCategoryListFromJson();
        })
        .catch(error => {
            console.error('Error reading kybers.json:', error);
        });
}

function populateCategoryListFromJson() {
    const categories = new Set(); // Using a Set to automatically remove duplicates
    readKybersJson()
        .then(data => {
            const kybersJson = data.kybers;
            kybersJson.forEach(kyber => {
                kyber.categoryList.forEach(category => {
                    categories.add(category);
                });
            });
            // Convert Set to array to iterate over it
            const uniqueCategories = Array.from(categories);
            const categoryListContainer = document.getElementById('categories');

            uniqueCategories.forEach(category => {
                const categoryButton = document.createElement('button');
                categoryButton.classList.add('category');
                categoryButton.textContent = category;
                categoryListContainer.appendChild(categoryButton);
            });
        })
        .catch(error => {
            console.error('Error reading kybers.json:', error);
        });
}