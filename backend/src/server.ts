import express, { NextFunction, Response, Request } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import csvParser from 'csv-parser';
import axios from 'axios';
import sharp from 'sharp';

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
app.get('/images', async (req: Request, res: Response, next: NextFunction) => {
  const page: number = parseInt(req.query.page as string) || 1; // Default to page 1
  const limit: number = parseInt(req.query.limit as string) || 20; // Default to 20 items per page
  const password: string = req.query.password?.toLocaleString() || "123";
  const confirm: string = req.query.password?.toLocaleString() || "2";

  if(password !== confirm) return res.status(500).json({msg: "Hey, 2 options here. Guess the password 😂, otherwise contact telegram @myidealdev"});

  // Calculate the offset
  const offset = (page - 1) * limit;

  // Get the images slice based on pagination
  const paginatedImages = URLs.slice(offset, offset + limit);

  
  try {
    // For each image, fetch the original, generate thumbnail, and encode it
    const imagesWithThumbnails = await Promise.all(
      paginatedImages.map(async (imageUrl) => {
        try {
          // Fetch the image
          const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
          const imageBuffer = Buffer.from(response.data, 'binary');

          // Generate a thumbnail using sharp
          const thumbnailBuffer = await sharp(imageBuffer)
            .resize({ width: 200 }) // adjust thumbnail width as needed
            .jpeg({ quality: 80 })
            .toBuffer();

          // Convert thumbnail to base64 data URL
          const thumbnailBase64 = `data:image/jpeg;base64,${thumbnailBuffer.toString('base64')}`;

          return {
            imageUrl,
            thumbnail: thumbnailBase64
          };
        } catch (error) {
          console.error(`Error processing image ${imageUrl}: ${error}`);
          return {
            imageUrl,
            thumbnail: null // or a placeholder
          };
        }
      })
    );

    // Return the response
    return res.status(200).json({
      currentPage: page,
      totalItems: URLs.length,
      totalPages: Math.ceil(URLs.length / limit),
      itemsPerPage: limit,
      images: imagesWithThumbnails,
    });
  } catch (err) {
    console.error(`Error generating thumbnails: ${err}`);
    return res.status(500).json({ msg: 'Error generating thumbnails' });
  }
});

// Sample product endpoints (not affected by CSV logic)
app.get('/products', (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({ message: 'Product list endpoint (untouched)' });
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
