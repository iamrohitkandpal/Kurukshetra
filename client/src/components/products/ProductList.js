import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // A03: SQL Injection vulnerability in the API
        let url = '/api/products';
        if (searchTerm && category) {
          url += `?search=${searchTerm}&category=${category}`;
        } else if (searchTerm) {
          url += `?search=${searchTerm}`;
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
    };

    fetchProducts();
  }, [searchTerm, category]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by the useEffect dependency
  };

  if (loading) {
    return <div className="text-center my-5">Loading products...</div>;
  }

  return (
    <div className="container">
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
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        {products.length > 0 ? (
          products.map(product => (
            <div className="col-md-4 mb-4" key={product.id}>
              <div className="card h-100">
                <div className="card-body">
                  <h5 className="card-title">{product.name}</h5>
                  <h6 className="card-subtitle mb-2 text-muted">${product.price.toFixed(2)}</h6>
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
    </div>
  );
};

export default ProductList;
