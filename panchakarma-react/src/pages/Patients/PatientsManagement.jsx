import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Users, Search, Filter, Eye, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../types';

// 🌿 Styled Components (same as before)
const Container = styled.div`
  padding: 2rem;
`;

// ✅ --- (rest of your styled components remain the same, no change) ---

const PatientsManagement = () => {
  const { user } = useAuth();
  const isDoctorOrAdmin = user?.role === USER_ROLES.DOCTOR || user?.role === USER_ROLES.ADMIN;

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalPatients: 0,
    activePatients: 0,
    newThisMonth: 0,
    totalAppointments: 0
  });

  useEffect(() => {
    // Only doctors/admins should call the doctor API
    if (!isDoctorOrAdmin) {
      setLoading(false);
      return;
    }

    const loadPatients = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/doctor/my-patients');
        setPatients(data?.patients || []);
        setStats(data?.stats || {
          totalPatients: 0,
          activePatients: 0,
          newThisMonth: 0,
          totalAppointments: 0,
        });
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [isDoctorOrAdmin]);

  const handleViewPatient = (id) => {
    toast.success(`Viewing patient ${id}`);
  };

  const handleEditPatient = (id) => {
    toast(`Editing patient ${id}`, { icon: '✏️' });
  };

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.phone.includes(searchQuery)
  );

  const getInitials = (name) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  if (!isDoctorOrAdmin) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          This page is only available for doctors and admins.
        </div>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Loading patients...
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <h1 style={{ color: '#007a5f', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Users size={32} /> Patients Management
      </h1>

      {/* 🌿 Stats Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', borderLeft: '4px solid #007a5f' }}>
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-label">Total Patients</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', borderLeft: '4px solid #28a745' }}>
          <div className="stat-value">{stats.activePatients}</div>
          <div className="stat-label">Active Patients</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', borderLeft: '4px solid #007bff' }}>
          <div className="stat-value">{stats.newThisMonth}</div>
          <div className="stat-label">New This Month</div>
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', borderLeft: '4px solid #ffa500' }}>
          <div className="stat-value">{stats.totalAppointments}</div>
          <div className="stat-label">Total Appointments</div>
        </div>
      </div>

      {/* 🌿 Search and Filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 300 }}>
          <Search className="search-icon" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#999' }} />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem 0.75rem 3rem',
              border: '2px solid #e0e0e0',
              borderRadius: 8,
              fontSize: '1rem'
            }}
          />
        </div>
        <button style={{
          padding: '0.75rem 1.5rem',
          background: 'white',
          border: '2px solid #e0e0e0',
          borderRadius: 8,
          color: '#333',
          fontWeight: 500
        }}>
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* 🌿 Patients Table */}
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.08)' }}>
        {filteredPatients.map(p => (
          <div key={p.id} style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr 1.5fr',
            padding: '1rem 1.5rem',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'linear-gradient(135deg, #007a5f, #00b88a)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
              }}>{getInitials(p.name)}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={{ color: '#999', fontSize: '0.85rem' }}>ID: {p.id}</div>
              </div>
            </div>
            <div>{p.phone}</div>
            <div>{p.email}</div>
            <div>{p.therapyCount}</div>
            <div>
              <span style={{
                padding: '0.25rem 0.75rem',
                borderRadius: 12,
                background: p.status === 'Active' ? '#d4edda' : '#f8d7da',
                color: p.status === 'Active' ? '#155724' : '#721c24',
                fontWeight: 500
              }}>
                {p.status}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => handleViewPatient(p.id)} style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: '0.5rem', cursor: 'pointer' }}>
                <Eye size={18} />
              </button>
              <button onClick={() => handleEditPatient(p.id)} style={{ border: '1px solid #e0e0e0', borderRadius: 6, padding: '0.5rem', cursor: 'pointer' }}>
                <Edit size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default PatientsManagement;
