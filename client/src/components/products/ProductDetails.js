import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../context/AuthContext';
import Toast from '../common/Toast';

const ProductDetails = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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

    setDeleting(true);
    try {
      // A01: Still vulnerable - No proper authorization check
      await axios.delete(`/api/products/${id}`);
      showToast('Product deleted successfully', 'success');
      navigate('/products');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete product';
      showToast(errorMessage, 'error');
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="card">
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <div className="skeleton-image"></div>
              </div>
              <div className="col-md-8">
                <div className="skeleton-title"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-text"></div>
                <div className="skeleton-price"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4>Error Loading Product</h4>
          <p>{error}</p>
          <button 
            className="btn btn-outline-danger"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
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
                  src={`${process.env.REACT_APP_API_URL}/images/products/${product.image_url}`}
                  alt={product.name} 
                  className="img-fluid rounded" 
                />
              ) : (
                <img
                  src={`${process.env.REACT_APP_API_URL}/images/default/product-placeholder.png`}
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
                <button type="button" className="btn btn-primary me-2" disabled={product.stock <= 0}>
                  Add to Cart
                </button>
                
                {user && (user.role === 'admin' || user.role === 'manager') && (
                  <>
                    <Link to={`/products/edit/${product.id}`} className="btn btn-secondary me-2">
                      Edit
                    </Link>
                    <button 
                      onClick={handleDelete} 
                      className="btn btn-danger"
                      disabled={deleting}
                    >
                      {deleting ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Deleting...
                        </>
                      ) : (
                        'Delete'
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default ProductDetails;
