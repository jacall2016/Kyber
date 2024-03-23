const axios = require('axios');
const fs = require('fs');

// Function to fetch data from the API and write it to a JSON file
async function fetchDataAndWriteToFile(url, fileName) {
    try {
        // Fetching data from the API
        const response = await axios.get(url);
        const data = response.data;

        // Writing data to JSON file
        fs.writeFileSync(fileName, JSON.stringify(data, null, 4));

        console.log(`Data successfully written to ${fileName}`);
    } catch (error) {
        console.error(`An error occurred: ${error.message}`);
    }
}

// API URL
const apiUrl = 'https://kyberapi.onrender.com/kyberData/';

// File name to write data
const fileName = 'kybers.json';

// Call the function to fetch and write data
fetchDataAndWriteToFile(apiUrl, fileName);
