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

let CARDLIST = [];
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
            console.error('Error reading kyberData:', error);
            return []; // Return an empty array if there's an error
        });
}

async function populateCardListFromJson() {
    let cards = [];

    try {
        const kybersJson = await readKybersJson(); // Assuming readKybersJson() returns a promise

        kybersJson.forEach(kyber => {
            const card = new Card(
                kyber._id,
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
        
        // 2. Populate the card container with card elements
        populateCardContainer(cards);

    } catch (error) {
        console.error('Error reading kybers.json:', error);
    }
}

function toggleCardActive(cardId) {
    let cards = CARDLIST;
    cards.forEach(card => {
        
        if (card.id == cardId) {
            card.active = true;
        } else {
            card.active = false;
        }
        
        scene.addGLTF(card.gltfFileName);
    });
}

function populateCardContainer(cards) {
    const cardContainer = document.getElementById('card-container');
    if (!cardContainer) {
        console.error("Card container element not found.");
        return;
    }
    cardContainer.innerHTML = ''; // Clear previous content

    cards.forEach(card => {
        const tempDiv = document.createElement('div'); // Create a temporary div element
        tempDiv.classList.add('card');
        tempDiv.innerHTML = `
            <label for="card_${card.id}">
            <input type="radio" name="card" class="card-radio" id="card_${card.id}">
            <img src="assets/images/thumbnails/${card.thumbnailImageName}" alt="${card.title}">
            <h2 class="title">${card.title}</h2>
            <div class="details ${card.active ? 'active' : 'inactive'}" id="details_${card.id}">
                <p>${card.description}</p>
                <p>Price: $${card.price}</p>
                <p>Categories: ${card.categoryList.join(', ')}</p>
                <button class="add-catagory">+</button>
                <p>File Name: ${card.gltfFileName}</p>
                <button class="add-to-cart">&#x1F6D2;</button>
                <button class="edit-details">&#x1F527;</button>
                <button class="delete-card">&#x1F5D1;</button>
            </div>
        </label>`;
        cardContainer.appendChild(tempDiv);
    });
}

window.addEventListener('DOMContentLoaded', () => {
    populateCardListFromJson()

    const threeScreenDiv = document.querySelector('.three-screen');
    threeScreenDiv.appendChild(scene.renderer.domElement);
    scene.animate();

    console.log("Cards: ", CARDLIST);

    const cardRadioInputs = document.querySelectorAll('.card-radio');
    cardRadioInputs.forEach(input => {
        input.addEventListener('change', () => {
            console.log("Card selected: ", input.id);
            const cardId = input.id.split('_')[1];
            toggleCardActive(cardId);
        });
    });
});