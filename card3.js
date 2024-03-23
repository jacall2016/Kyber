import Scene from './main2.js';

import { CART, updateCart } from './globals.js';

class Cards {
    constructor() {
        this.cards = [];
    }

    addCard(card) {

        this.cards.push(card);
        const cardHTML = card.generateHTML();
        document.getElementById('card-container').insertAdjacentHTML('beforeend', cardHTML);
    }

    removeCard(card) {
        const index = this.cards.indexOf(card);
        if (index !== -1) {
            this.cards.splice(index, 1);
        }
    }

    getCardById(id) {
        return this.cards.find(card => card.id === id);
    }

    async getAndPopulateCards() {
        try {
            const response = await fetch('https://kyberapi.onrender.com/kyberData');
            
            const jsonData = await response.json();
            
            jsonData.forEach(cardData => {
                const card = new Card(
                    cardData._id,
                    cardData.title,
                    cardData.description,
                    cardData.price,
                    cardData.gltfFileName,
                    cardData.thumbnailImageName
                );
                this.addCard(card);
                
                const cardHTML = card.generateHTML();
                document.getElementById('card-container').insertAdjacentHTML('beforeend', cardHTML);
            });

            return this.cards;
        } catch (error) {
            console.error('Error reading kyber.json:', error);
            return [];
        }
    }
}

const cards = new Cards();

class Card {
    constructor(id, title, description, price, gltfFileName, thumbnailImageName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.gltfFileName = gltfFileName;
        this.thumbnailImageName = thumbnailImageName;
    }

    generateHTML() {
        return `
        <div class="card" id="card_${this.id}">
            <img src="assets/images/thumbnails/${this.thumbnailImageName}" alt="${this.title}">
            <h2 class="title">${this.title}</h2>
            <div class="details inactive" id="details_${this.id}">
                <p id="description_${this.id}">${this.description}</p>
                <p id="price_${this.id}">Price: $${this.price}</p>
                <p id="file-name_${this.id}">File Name: ${this.gltfFileName}</p>
                <button class="add-to-cart">&#x1F6D2;</button>
                <button class="edit-details">&#x1F527;</button>
                <button class="delete-card">&#x1F5D1;</button>
            </div>
        </div>`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await cards.getAndPopulateCards();

    let scene; // Declare scene variable outside the event listeners

    // Add event listener to each card element
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach(cardElement => {
        const addToCartButton = cardElement.querySelector('.add-to-cart');

        // Add event listener for add-to-cart button
        addToCartButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the click event from bubbling up
            // Get the parent card element
            const parentCardElement = event.target.closest('.card');
            
            // Find the card object associated with this card element
            const cardId = parentCardElement.getAttribute('id').replace('card_', '');

            const selectedCard = cards.getCardById(cardId);

            if (!selectedCard) {
                console.error(`Card with ID ${cardId} not found in cards array`);
                return;
            } else {
                CART.push(selectedCard);
                updateCart(CART);
                // Set the value of the cart number
                if (CART.length > 0) {
                    document.getElementById('cartNumber').textContent = CART.length;
                } else {
                    document.getElementById('cartNumber').textContent = 0;
                }
            }
        });
        
        // Add click event listener to toggle card details
        cardElement.addEventListener('click', () => {
            // Get the details div for the clicked card
            const detailsDiv = cardElement.querySelector('.details');

            // Check if the details div is already active
            if (!detailsDiv.classList.contains('active')) {
                // Iterate through all card elements
                cardElements.forEach(otherCardElement => {
                    // Remove active class from other details divs
                    const otherDetailsDiv = otherCardElement.querySelector('.details');
                    if (otherDetailsDiv !== detailsDiv) {
                        otherDetailsDiv.classList.remove('active');
                        otherDetailsDiv.classList.add('inactive');
                    }
                });

                // Toggle active and inactive classes for the clicked card's details div
                detailsDiv.classList.toggle('active');
                detailsDiv.classList.toggle('inactive');
                const threeScreenElement = document.querySelector('.three-screen');
                threeScreenElement.innerHTML = '';
                // Get the ID of the current card element
                const cardId = cardElement.getAttribute('id').replace('card_', '');

                // Get the value of the <p> element with the ID file-name_${cardId}
                let fileName = document.getElementById(`file-name_${cardId}`).innerHTML;

                fileName = fileName.toString();
                console.log("fileName", fileName);
                scene = new Scene("earth.gltf");
                threeScreenElement.appendChild(scene.renderer.domElement);
            }
        });
    });

    // Start the animation loop
    function animate() {
        requestAnimationFrame(animate);
        if (scene) {
            scene.animate();
        }
    }
    animate(); 
});
