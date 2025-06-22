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
  const [selectedEvent, setSelectedEvent] = useState('user.created');
  const [updateUrl, setUpdateUrl] = useState('');

  const availableEvents = [
    { type: 'user', events: ['user.created', 'user.updated', 'user.deleted'] },
    { type: 'product', events: ['product.created', 'product.updated', 'product.deleted'] },
    { type: 'feedback', events: ['feedback.created'] }
  ];

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const fetchWebhooks = async () => {
    try {
      const response = await axios.get('/api/webhooks');
      setWebhooks(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/webhooks', newWebhook);
      setWebhooks([...webhooks, response.data]);
      setNewWebhook({ name: '', url: '', events: [], secret: '' });
      setSuccess('Webhook created successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create webhook');
    }
  };

  const handleTestWebhook = async (id) => {
    try {
      await axios.post(`/api/webhooks/test/${id}`);
      setSuccess('Webhook tested successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to test webhook');
    }
  };

  const handleDeleteWebhook = async (id) => {
    try {
      await axios.delete(`/api/webhooks/${id}`);
      setWebhooks(webhooks.filter(webhook => webhook.id !== id));
      setSuccess('Webhook deleted successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete webhook');
    }
  };

  const handleUpdateUrl = async () => {
    try {
      await axios.post('/api/webhooks/update-url', { url: updateUrl });
      setSuccess('Server URL updated successfully');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update server URL');
    }
  };

  if (loading) return <div className="text-center p-5"><div className="spinner-border"></div></div>;

  return (
    <div className="container-fluid px-4">
      <h2 className="my-4">Webhook Manager</h2>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError('')}></button>
        </div>
      )}
      {success && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {success}
          <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h3 className="h5 mb-0">Create New Webhook</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="webhookName" className="form-label">Name</label>
                  <input
                    type="text"
                    id="webhookName"
                    className="form-control"
                    value={newWebhook.name}
                    onChange={e => setNewWebhook({...newWebhook, name: e.target.value})}
                    placeholder="Webhook name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="webhookUrl" className="form-label">URL</label>
                  <input
                    type="url"
                    id="webhookUrl"
                    className="form-control"
                    value={newWebhook.url}
                    onChange={e => setNewWebhook({...newWebhook, url: e.target.value})}
                    placeholder="https://your-endpoint.com/webhook"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="webhookSecret" className="form-label">Secret Key</label>
                  <input
                    type="text"
                    id="webhookSecret"
                    className="form-control"
                    value={newWebhook.secret}
                    onChange={e => setNewWebhook({...newWebhook, secret: e.target.value})}
                    placeholder="Webhook secret key"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Events</label>
                  {availableEvents.map(group => (
                    <div key={group.type} className="mb-2">
                      <small className="text-muted text-uppercase">{group.type} Events</small>
                      <div className="d-flex flex-wrap gap-2">
                        {group.events.map(event => (
                          <div key={event} className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`event-${event}`}
                              checked={newWebhook.events.includes(event)}
                              onChange={e => {
                                const events = e.target.checked
                                  ? [...newWebhook.events, event]
                                  : newWebhook.events.filter(e => e !== event);
                                setNewWebhook({...newWebhook, events});
                              }}
                            />
                            <label className="form-check-label" htmlFor={`event-${event}`}>
                              {event}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button type="submit" className="btn btn-primary w-100">
                  Create Webhook
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h3 className="h5 mb-0">Active Webhooks</h3>
              <span className="badge bg-primary">{webhooks.length} Total</span>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="px-4">Name</th>
                      <th>URL</th>
                      <th>Events</th>
                      <th className="text-end px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {webhooks.map(webhook => (
                      <tr key={webhook.id}>
                        <td className="px-4">{webhook.name}</td>
                        <td className="text-truncate" style={{maxWidth: '200px'}}>
                          <code>{webhook.url}</code>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {webhook.events.map(event => (
                              <span key={event} className="badge bg-info">
                                {event}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="text-end px-4">
                          <div className="btn-group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleTestWebhook(webhook.id)}
                            >
                              Test
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteWebhook(webhook.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {webhooks.length === 0 && (
                      <tr>
                        <td colSpan="4" className="text-center py-4 text-muted">
                          No webhooks configured yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h3 className="h5 mb-0">Update Server URL</h3>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label htmlFor="updateUrl" className="form-label">Update Server URL</label>
                <input
                  type="text"
                  id="updateUrl"
                  className="form-control"
                  value={updateUrl}
                  onChange={(e) => setUpdateUrl(e.target.value)}
                />
              </div>

              <button className="btn btn-primary w-100" onClick={handleUpdateUrl}>
                Update URL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebhookManager;