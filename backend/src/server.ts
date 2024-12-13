import express, { NextFunction, Response, Request } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import csvParser from 'csv-parser';

const app = express();

// Store parsed URLs in memory
const URLs: string[] = [];

// CSV file path
const csvFilePath = './images.csv'; // Adjust the file path as necessary

// Read and process the CSV file automatically when the server starts
fs.createReadStream(csvFilePath)
  .pipe(csvParser())
  .on('data', (row) => {
    
    // Assuming the CSV has a column called "url" for URLs
    if (row.image) {
      URLs.push(row.image);  // Add each URL to the array
    }
  })
  .on('end', () => {
    console.log(`CSV processed successfully. Found ${URLs.length} URLs.`);
  })
  .on('error', (err) => {
    console.error(`Error reading CSV file: ${err.message}`);
  });

console.log(URLs);

app.use(cors());
app.use(bodyParser.json());

// CORS Headers => Required for cross-origin/ cross-server communication
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PATCH, DELETE, OPTIONS'
  );
  next();
});

// Endpoint to retrieve the URLs from the CSV
app.get('/images', (req: Request, res: Response, next: NextFunction) => {
  const page: number = parseInt(req.query.page as string) || 1; // Default to page 1
  const limit: number = parseInt(req.query.limit as string) || 20; // Default to 20 items per page

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
app.get('/products', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ message: 'Product list endpoint (untouched)' });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
