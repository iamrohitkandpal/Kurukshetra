import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WebhookManager = () => {
  const [webhooks, setWebhooks] = useState([]);
  const [newWebhook, setNewWebhook] = useState({
    name: '',
    url: '',
    events: [],
    secret: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availableEvents = ['user.created', 'user.updated', 'order.created', 'product.updated'];

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const res = await axios.get('/api/webhooks');
      setWebhooks(res.data);
    } catch (err) {
      setError('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/webhooks', newWebhook);
      setSuccess('Webhook created successfully');
      fetchWebhooks();
      setNewWebhook({ name: '', url: '', events: [], secret: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create webhook');
    }
  };

  const testWebhook = async (id) => {
    try {
      // A10: SSRF vulnerability in the API
      await axios.post(`/api/webhooks/test/${id}`, {
        payload: { event: 'test', timestamp: new Date().toISOString() }
      });
      setSuccess('Webhook tested successfully');
    } catch (err) {
      setError('Webhook test failed');
    }
  };

  const deleteWebhook = async (id) => {
    try {
      // A01: IDOR vulnerability in the API
      await axios.delete(`/api/webhooks/${id}`);
      setSuccess('Webhook deleted successfully');
      fetchWebhooks();
    } catch (err) {
      setError('Failed to delete webhook');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h3>Webhook Management</h3>
      </div>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-3">
            <label className="form-label">Webhook Name</label>
            <input
              type="text"
              className="form-control"
              value={newWebhook.name}
              onChange={(e) => setNewWebhook({...newWebhook, name: e.target.value})}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">URL</label>
            <input
              type="url"
              className="form-control"
              value={newWebhook.url}
              onChange={(e) => setNewWebhook({...newWebhook, url: e.target.value})}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Events</label>
            <div>
              {availableEvents.map(event => (
                <div key={event} className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={newWebhook.events.includes(event)}
                    onChange={(e) => {
                      const events = e.target.checked 
                        ? [...newWebhook.events, event]
                        : newWebhook.events.filter(e => e !== event);
                      setNewWebhook({...newWebhook, events});
                    }}
                  />
                  <label className="form-check-label">{event}</label>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Secret (Optional)</label>
            <input
              type="text"
              className="form-control"
              value={newWebhook.secret}
              onChange={(e) => setNewWebhook({...newWebhook, secret: e.target.value})}
            />
          </div>
          <button type="submit" className="btn btn-primary">Create Webhook</button>
        </form>

        <h4>Active Webhooks</h4>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>URL</th>
                <th>Events</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((webhook) => (
                <tr key={webhook.id}>
                  <td>{webhook.name}</td>
                  <td>{webhook.url}</td>
                  <td>
                    {webhook.events.map(event => (
                      <span key={event} className="badge bg-secondary me-1">
                        {event}
                      </span>
                    ))}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-1"
                      onClick={() => testWebhook(webhook.id)}
                    >
                      Test
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WebhookManager;