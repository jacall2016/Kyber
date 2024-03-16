import Scene from './main2.js';
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

    updateActive(active) {
        this.active = active;
        // If the card is now active, add it to the scene
        if (this.active) {
            scene.addGLTF(this.gltfFileName);
        } else {
            // If the card is no longer active, remove it from the scene
            scene.removeGLTF(this.gltfFileName);
        }
    }
}

let cards =[];
let scene = new Scene();

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

async function populateCardListFromJson() {
    readKybersJson()
        .then(data => {
            const kybersJson = data.kybers; // Access the array of kybers
            kybersJson.forEach((kyber, index) => {
                const { id, title, description, price, gltfFileName, thumbnailImageName, categoryList } = kyber;
                // Create a new Card instance for each kyber object
                const card = new Card(
                    kyber.id,
                    kyber.title,
                    kyber.description,
                    kyber.price,
                    kyber.gltfFileName,
                    kyber.thumbnailImageName,
                    kyber.categoryList
                );
                // Add the new card to the cards array
                cards.push(card);
            });

            // After populating the cards array, add active cards to the scene
            cards.forEach(card => {
                if (card.active) {
                    scene.addGTF(card.gltfFileName);
                }
            });
            toggleCardActive(1);
        })
        .catch(error => {
            console.error('Error reading kybers.json:', error);
        });
}

function toggleCardActive(cardId) {
    cards.forEach(card => {
        if (card.id === cardId) {
            card.active = true;
        } else {
            card.active = false;
        }
    })
    // Call the updateActiveGLTF function to update the GLTF based on the active card
    updateActiveGLTF();
}

function populateCardContainer() {
    const cardContainer = document.getElementById('card-container');
    cardContainer.innerHTML = ''; // Clear previous content

    console.log(cards[0]);

    cards.forEach(card => {
        const cardElement = `
            <div class="card">
                <label for="card_${card.id}">
                    <input type="radio" name="card" class="card-radio" id="card_${card.id}" onclick="toggleCardActive(${card.id});" ${checkedAttribute}>
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
            </div>`;
        cardContainer.appendChild(cardElement);
    });
}

function updateActiveGLTF() {
    cards.forEach(card => {
        if (card.active) {
            scene.addGLTF(card.gltfFileName);
        } else {
            scene.removeGLTF(card.gltfFileName);
        }
    })
}

// 1. Populate the card list from the JSON data when the site first loads
window.addEventListener('DOMContentLoaded', () => {
    populateCardListFromJson()
    // 2. Populate the card container with card elements
    populateCardContainer();

    toggleCardActive(1);

    const threeScreenDiv = document.querySelector('.three-screen');
    threeScreenDiv.appendChild(scene.renderer.domElement);
    scene.animate();
});