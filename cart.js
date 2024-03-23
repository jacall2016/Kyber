import { CART, updateCart } from './globals.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("hi",CART);

    if (CART && CART.length > 0) {
        document.getElementById('cartNumber').textContent = CART.length;
    } else {
        document.getElementById('cartNumber').textContent = 0;
    }
});
