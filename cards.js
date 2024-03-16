
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
        this.scene = new Scene();
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

function populateCardListFromJson() {
    const cardContainer = document.getElementById('card-container');
    let cards = [];
    readKybersJson()
        .then(data => {
            const kybersJson = data.kybers; // Access the array of kybers
            kybersJson.forEach((kyber, index) => {
                const { id, title, description, price, gltfFileName, thumbnailImageName, categoryList } = kyber;
                const card = new Card(id, title, description, price, gltfFileName, thumbnailImageName, categoryList);
                cards.push(card);
                if (index === 0) {
                    card.active = true; // Set the first card's active property to true

                }
                const checkedAttribute = index === 0 ? 'checked' : '';
                const cardElement = document.createElement('div');
                cardElement.innerHTML = `
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
                </div>
                `;
                cardContainer.appendChild(cardElement);
            });
            // After populating the card list, also populate the category list
            populateCategoryListFromJson();
        })
        .catch(error => {
            console.error('Error reading kybers.json:', error);
        });
}

function toggleCardActive(cardId) {
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

// Populate the card list when the page loads
window.addEventListener('load', populateCardListFromJson);

