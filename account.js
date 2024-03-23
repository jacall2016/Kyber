import CART from './globals.js';
document.addEventListener('DOMContentLoaded', async () => {

    // Set the value of the cart number
    document.getElementById('cartNumber').textContent = CART.length;

    // Add event listener to the edit button
    const editButton = document.querySelector('.edit-button');

    editButton.addEventListener('click', () => {
        // Logic to open a form or modal for editing account details
        // For demonstration purposes, let's create a form
        const accountDetails = document.querySelector('.account-details');
        accountDetails.innerHTML = `
            <form id="edit-form">
                <label for="edit-name">Name:</label>
                <input type="text" id="edit-name" value="John Doe">
                <label for="edit-email">Email:</label>
                <input type="email" id="edit-email" value="johndoe@example.com">
                <label for="edit-username">Username:</label>
                <input type="text" id="edit-username" value="johndoe123">
                <button type="submit">Save</button>
            </form>
        `;

        // Add event listener to the form for submitting edited details
        const editForm = document.getElementById('edit-form');
        editForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Get the edited values from the form
            const editedName = document.getElementById('edit-name').value;
            const editedEmail = document.getElementById('edit-email').value;
            const editedUsername = document.getElementById('edit-username').value;
            
            // Update the account details
            document.getElementById('name').textContent = editedName;
            document.getElementById('email').textContent = editedEmail;
            document.getElementById('username').textContent = editedUsername;

            // You can add logic here to save the edited details (e.g., send them to the server)
        });
    });
});