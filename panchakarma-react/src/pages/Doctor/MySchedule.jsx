import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../../services/authService';
import './MySchedule.css'; // CSS styling

function MySchedule() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [onlyConfirmed, setOnlyConfirmed] = useState(true);
  const [dateFilter, setDateFilter] = useState(() => format(new Date(), 'yyyy-MM-dd'));

  // 🔹 Load appointments (confirmed ones)
  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const statusParam = onlyConfirmed ? 'confirmed' : 'all';
      // For doctors, backend /appointments already filters by doctor_id
      const res = await api.get('/appointments', {
        params: { status: statusParam, page: 1, limit: 100 },
      });
      const data = res.data?.appointments || [];
      const normalized = data.map((a) => ({
        ...a,
        _date: a.appointment_date,
        _time: (a.appointment_time || '').slice(0, 5),
        _therapyName: a.therapy_name,
        _patientName: a.patient_name,
      }));
      setItems(normalized);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || 'Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlyConfirmed]);

  // 🔹 Filter by date
  const filtered = useMemo(() => {
    const start = new Date(`${dateFilter}T00:00:00`);
    return items
      .filter((a) => {
        try {
          const d = new Date(`${a._date}T${(a._time || '00:00')}:00`);
          return d >= start;
        } catch {
          return true;
        }
      })
      .sort((a, b) => {
        const da = new Date(`${a._date}T${(a._time || '00:00')}:00`).getTime();
        const db = new Date(`${b._date}T${(b._time || '00:00')}:00`).getTime();
        return da - db;
      });
  }, [items, dateFilter]);

  // 🔹 Mark as completed
  const markCompleted = async (id) => {
    try {
      await api.put(`/appointments/${id}/status`, { status: 'completed' });
      toast.success('✅ Marked as completed');
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to update');
    }
  };

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <div>
          <h2 className="schedule-title">🩺 My Therapy Schedule</h2>
          <p className="schedule-subtitle">View and manage all your upcoming sessions in one place</p>
        </div>
      </div>

      <div className="schedule-card">
        <div className="schedule-filters">
          <label>
            From date:
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </label>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={onlyConfirmed}
              onChange={(e) => setOnlyConfirmed(e.target.checked)}
            />
            Only confirmed
          </label>

          <button className="btn-refresh" onClick={load}>🔄 Refresh</button>
        </div>

        {loading && <div className="loading">Loading schedule...</div>}
        {error && <div className="error">{error}</div>}

        {!loading && filtered.length === 0 && (
          <div className="no-data">No therapies found for the selected filters.</div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="table-wrapper">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Therapy</th>
                  <th>Patient</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>{a._date || '-'}</td>
                    <td>{a._time || '-'}</td>
                    <td>{a._therapyName || '-'}</td>
                    <td>{a._patientName || '-'}</td>
                    <td>
                      <span className={`status ${a.status}`}>{a.status}</span>
                    </td>
                    <td>{a.notes || '-'}</td>
                    <td>
                      {a.status !== 'completed' ? (
                        <button
                          className="btn-complete"
                          onClick={() => markCompleted(a.id)}
                        >
                          ✅ Mark Completed
                        </button>
                      ) : (
                        <span className="completed">✔ Done</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default MySchedule;
