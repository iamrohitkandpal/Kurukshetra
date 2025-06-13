import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // A03: SQL Injection vulnerability in the API
        const res = await axios.get(`/api/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError('Failed to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      // A01: Broken Access Control - Any authenticated user can delete
      await axios.delete(`/api/products/${id}`);
      navigate('/products');
    } catch (err) {
      setError('Failed to delete product');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center my-5">Loading product details...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!product) {
    return <div className="alert alert-warning">Product not found</div>;
  }

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12 mb-4">
          <Link to="/products" className="btn btn-secondary">
            &larr; Back to Products
          </Link>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="row">
            <div className="col-md-4">
              {product.image_url ? (
                <img 
                  src={`/images/products/${product.image_url}`} // Updated path
                  alt={product.name} 
                  className="img-fluid rounded" 
                />
              ) : (
                <img
                  src="/images/default/product-placeholder.png" // Default image
                  alt="Product placeholder"
                  className="img-fluid rounded"
                />
              )}
            </div>
            <div className="col-md-8">
              <h2 className="card-title">{product.name}</h2>
              <p className="text-muted">{product.category}</p>
              <p className="display-6 mb-4">${product.price.toFixed(2)}</p>
              <p className="card-text">{product.description}</p>
              <div className="d-flex align-items-center mb-4">
                <span className="me-3">Available Stock: {product.stock}</span>
                {product.stock > 0 ? (
                  <span className="badge bg-success">In Stock</span>
                ) : (
                  <span className="badge bg-danger">Out of Stock</span>
                )}
              </div>

              <div className="d-flex">
                <button className="btn btn-primary me-2" disabled={product.stock <= 0}>
                  Add to Cart
                </button>
                
                {user && (user.role === 'admin' || user.role === 'manager') && (
                  <>
                    <Link to={`/products/edit/${product.id}`} className="btn btn-secondary me-2">
                      Edit
                    </Link>
                    <button onClick={handleDelete} className="btn btn-danger">
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
