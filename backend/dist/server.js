"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const app = (0, express_1.default)();
// Store parsed URLs in memory
const URLs = [];
// CSV file path
const csvFilePath = './images.csv'; // Adjust the file path as necessary
// Read and process the CSV file automatically when the server starts
fs_1.default.createReadStream(csvFilePath)
    .pipe((0, csv_parser_1.default)())
    .on('data', (row) => {
    // Assuming the CSV has a column called "url" for URLs
    if (row.image) {
        URLs.push(row.image); // Add each URL to the array
    }
})
    .on('end', () => {
    console.log(`CSV processed successfully. Found ${URLs.length} URLs.`);
})
    .on('error', (err) => {
    console.error(`Error reading CSV file: ${err.message}`);
});
console.log(URLs);
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// CORS Headers => Required for cross-origin/ cross-server communication
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    next();
});
// Endpoint to retrieve the URLs from the CSV
app.get('/images', (req, res, next) => {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const limit = parseInt(req.query.limit) || 20; // Default to 20 items per page
    // Calculate the offset
    const offset = (page - 1) * limit;
    // Get the images slice based on pagination
    const paginatedImages = URLs.slice(offset, offset + limit);
    // Return the response
    res.status(200).json({
        currentPage: page,
        totalItems: URLs.length,
        totalPages: Math.ceil(URLs.length / limit),
        itemsPerPage: limit,
        images: paginatedImages,
    });
});
// Sample product endpoints (not affected by CSV logic)
app.get('/products', (req, res, next) => {
    res.status(200).json({ message: 'Product list endpoint (untouched)' });
});
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
