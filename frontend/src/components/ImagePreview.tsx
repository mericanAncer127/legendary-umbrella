// src/components/ImagePreview.tsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ImageModal from './ImageModal'; // Import the ImageModal component
import './ImagePreview.css';

const baseUrl = `https://legendary-umbrella.onrender.com`;

// Update the interface to match the new server response
interface ImageData {
  imageUrl: string;
  thumbnail: string;
  loaded: boolean;
}

const ImagePreview: React.FC = () => {
  const [imageUrls, setImageUrls] = useState<ImageData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [imagesPerPage, setImagesPerPage] = useState<number>(20); 
  const [totalPages, setTotalPages] = useState(0);

  // State for Modal
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ref to store the triggering element for accessibility
  const triggerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadImages();
  }, [currentPage, imagesPerPage]);

  const loadImages = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/images?page=${currentPage}&limit=${imagesPerPage}&password=2&confirm=2`
      );

      if (response.data.msg) {
        alert('Error: ' + response.data.msg);
        return;
      }

      // Now the response data format is:
      // {
      //   currentPage: number,
      //   totalItems: number,
      //   totalPages: number,
      //   itemsPerPage: number,
      //   images: [{ imageUrl: string; thumbnail: string }]
      // }

      const fetchedImages: { imageUrl: string; thumbnail: string }[] = response.data.images;

      const imagesWithLoading = fetchedImages.map((img) => ({
        imageUrl: img.imageUrl,
        thumbnail: img.thumbnail,
        loaded: false,
      }));

      setImageUrls(imagesWithLoading);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching images:', error);
      alert('Failed to load images. Please try again later.');
    }
  };

  const handleImageLoad = (index: number) => {
    setImageUrls((prevImages) => {
      const updatedImages = [...prevImages];
      updatedImages[index].loaded = true;
      return updatedImages;
    });
  };

  const handleImageClick = (image: ImageData, event: React.MouseEvent<HTMLDivElement>) => {
    setSelectedImage(image);
    setIsModalOpen(true);
    triggerRef.current = event.currentTarget; // Store the triggering element
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    // Return focus to the triggering element for accessibility
    triggerRef.current?.focus();
  };

  const handleImagesPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setImagesPerPage(value);
      setCurrentPage(1); // Reset to first page when imagesPerPage changes
    }
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url, {
        mode: 'cors',
      });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Error downloading the image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="image-preview-container">
      <h1>Image Preview</h1>

      {/* Images Per Page Input */}
      <div className="controls">
        <label htmlFor="imagesPerPage">Images per page:</label>
        <input
          type="number"
          id="imagesPerPage"
          min="1"
          value={imagesPerPage}
          onChange={handleImagesPerPageChange}
        />
      </div>

      <div>
        {imageUrls.length > 0 ? (
          <div className="image-container">
            {imageUrls.map((image, index) => (
              <div
                key={index}
                className="image-wrapper"
                onClick={(e) => handleImageClick(image, e)}
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleImageClick(image, e as any);
                  }
                }}
              >
                {!image.loaded && <div className="loader"></div>}
                <img
                  src={image.thumbnail} // Use the thumbnail URL here
                  alt={`Thumbnail ${index + 1}`}
                  className={`image ${image.loaded ? 'visible' : 'hidden'}`}
                  onLoad={() => handleImageLoad(index)}
                  onError={() => handleImageLoad(index)} // Treat errors as loaded to remove loader
                  loading="lazy"
                />
                {/* Download Button */}
                <button
                  className="download-button"
                  aria-label={`Download Image ${index + 1}`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering image click
                    downloadImage(image.imageUrl, `image-${currentPage}-${index + 1}.jpg`);
                  }}
                >
                  {/* SVG Download Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    className="download-icon"
                    viewBox="0 0 16 16"
                  >
                    <path d="M.5 9.9V14a.5.5 0 0 0 .5.5h14a.5.5 0 0 0 .5-.5V9.9a.5.5 0 0 0-.146-.354l-7-7a.5.5 0 0 0-.708 0l-7 7A.5.5 0 0 0 .5 9.9zm7 2.3a.5.5 0 0 1 .5.5v3.5H8V12.7a.5.5 0 0 1 .5-.5zm-7-7.3l7-7 7 7H.5z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p>Loading images...</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="pagination">
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        imageUrl={selectedImage?.imageUrl || ''}
        altText={`Image ${selectedImage ? imageUrls.indexOf(selectedImage) + 1 : ''}`}
        onClose={closeModal}
      />
    </div>
  );
};

export default ImagePreview;
