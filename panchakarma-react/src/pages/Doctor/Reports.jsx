import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/authService';
import './Reports.css'; // create this CSS file in same folder

function Reports() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        // For doctors this returns only their appointments; for admin it returns all
        const res = await api.get('/appointments', { params: { status: 'all', page: 1, limit: 200 } });
        setItems(res.data?.appointments || []);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = useMemo(() => {
    const s = { total: items.length, pending: 0, scheduled: 0, completed: 0, cancelled: 0 };
    const byTherapy = {};
    items.forEach((a) => {
      if (a.status === 'confirmed') {
        s.scheduled += 1; // treat confirmed as scheduled in UI
      } else if (s[a.status] !== undefined) {
        s[a.status] += 1;
      }
      const name = a.therapy_name || a?.therapy?.name || 'Unknown therapy';
      byTherapy[name] = (byTherapy[name] || 0) + 1;
    });
    return { ...s, byTherapy };
  }, [items]);

  return (
    <div className="reports-container">
      <h2 className="reports-title">📊 Reports Dashboard</h2>

      {loading && <div className="loading">Loading data...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && (
        <>
          <div className="stats-grid">
            <Stat label="Total Appointments" value={stats.total} color="#007bff" />
            <Stat label="Pending" value={stats.pending} color="#ffc107" />
            <Stat label="Scheduled" value={stats.scheduled} color="#17a2b8" />
            <Stat label="Completed" value={stats.completed} color="#28a745" />
            <Stat label="Cancelled" value={stats.cancelled} color="#dc3545" />
          </div>

          <h3 className="sub-heading">🧘 Appointments by Therapy</h3>

          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Therapy</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(stats.byTherapy).map(([name, count]) => (
                  <tr key={name}>
                    <td>{name}</td>
                    <td>{count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div className="stat-card" style={{ borderTop: `5px solid ${color}` }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
    </div>
  );
}

export default Reports;
