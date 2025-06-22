import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import useDebounce from '../../hooks/useDebounce';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  
  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
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
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load products');
      console.error('Product fetch error:', err);
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

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-warning">
          <h4 className="alert-heading">⚠️ Error Loading Products</h4>
          <p>{error}</p>
          <p>Server may be down or uninitialized.</p>
          <div className="mt-3">
            <button 
              className="btn btn-outline-warning"
              onClick={() => fetchProducts()}
            >
              Retry Loading Products
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <em>Try search terms with SQL injection like: &apos; OR 1=1 --</em>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="row">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="col-md-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="skeleton-loader h5 w-75"></div>
                  <div className="skeleton-loader w-25 mt-2"></div>
                  <div className="skeleton-loader w-100 mt-3"></div>
                  <div className="skeleton-loader w-100 mt-2"></div>
                </div>
              </div>
            </div>
          ))}
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
