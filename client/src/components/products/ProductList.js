import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useDebounce from '../../hooks/useDebounce';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      // A03: SQL Injection vulnerability in the API
      let url = '/api/products';
      if (debouncedSearchTerm && category) {
        url += `?search=${debouncedSearchTerm}&category=${category}`;
      } else if (debouncedSearchTerm) {
        url += `?search=${debouncedSearchTerm}`;
      } else if (category) {
        url += `?category=${category}`;
      }
      
      const res = await axios.get(url);
      setProducts(res.data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(res.data.map(product => product.category))];
      setCategories(uniqueCategories);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, category]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by the debounced effect
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Product Catalog</h2>
      
      <div className="row mb-4">
        <div className="col">
          <form onSubmit={handleSearch} className="d-flex">
            <input
              type="text"
              className="form-control me-2"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="form-select me-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
          <div className="text-muted small mt-2">
            <em>Try search terms with SQL injection like: ' OR 1=1 --</em>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading products...</p>
        </div>
      ) : (
        <div className="row">
          {products.length > 0 ? (
            products.map(product => (
              <div className="col-md-4 mb-4" key={product.id}>
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <h6 className="card-subtitle mb-2 text-muted">${product.price?.toFixed(2) || '0.00'}</h6>
                    <p className="card-text">{product.description}</p>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-secondary">{product.category}</span>
                      <span>Stock: {product.stock}</span>
                    </div>
                  </div>
                  <div className="card-footer">
                    <Link to={`/products/${product.id}`} className="btn btn-primary btn-sm">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-12 text-center">
              <p>No products found matching your criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductList;
