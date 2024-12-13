import React, { useState, useEffect } from 'react';

import Header from './components/Header/Header';
import NewProduct from './components/Products/NewProduct';
import ProductList from './components/Products/ProductList';
import './App.css';
import ImagePreview from './components/ImagePreview';
interface Product {
  id: string;
  title: string;
  price: number; // "+" to convert string to number
}

function App() {
  const [loadedProducts, setLoadedProducts] = useState<Product[]>();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      const response = await fetch('http://localhost:5000/products');

      const responseData = await response.json();

      setLoadedProducts(responseData.products);
      setIsLoading(false);
    };

    fetchProducts();
  }, []);

  const addProductHandler = async (productName: string, productPrice: string) => {
    try {
      const newProduct = {
        title: productName,
        price: +productPrice // "+" to convert string to number
      };
      let hasError = false;
      const response = await fetch('http://localhost:5000/product', {
        method: 'POST',
        body: JSON.stringify(newProduct),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        hasError = true;
      }

      const responseData = await response.json();

      if (hasError) {
        throw new Error(responseData.message);
      }

      setLoadedProducts(prevProducts => {
        return prevProducts!.concat({
          ...newProduct,
          id: responseData.product.id
        });
      });
    } catch (error) {
      alert((error as Error).message || 'Something went wrong!');
    }
  };

  return (
    <React.Fragment>
      <Header />
      <main className="container">
        {/* <NewProduct onAddProduct={addProductHandler} /> */}
        {/* {isLoading && <p className="loader">Loading...</p>} */}
        {/* {!isLoading && <ProductList items={loadedProducts} />} */}
        <ImagePreview />
      </main>
    </React.Fragment>
  );
}

export default App;
