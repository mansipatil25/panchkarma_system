import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Calendar, Clock, User, CheckCircle, XCircle, Plus, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/authService';

const Container = styled.div`
  padding: 0;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #007a5f 0%, #00b88a 100%);
  color: white;
  padding: 2rem;
  border-radius: 15px;
  margin-bottom: 2rem;A

  h1 { margin: 0 0 0.5rem 0; font-size: 2rem; font-weight: 600; }
  p { margin: 0; opacity: 0.9; font-size: 1.1rem; }
`;

const FilterBar = styled.div`
  background: white;
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.08);
  margin-bottom: 1rem;
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SearchInput = styled.div`
  position: relative;
  input { width: 100%; padding: 0.75rem 1rem 0.75rem 2.5rem; border: 2px solid #e0e0e0; border-radius: 8px; }
  .icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #666; }
`;

const Select = styled.select`
  width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; background: white;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 1rem;
`;

const Card = styled.div`
  background: white; border-radius: 12px; padding: 1rem; box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border-left: 4px solid ${({ $status }) => (
    $status === 'pending' ? '#ffc107' : $status === 'confirmed' ? '#007a5f' : $status === 'completed' ? '#28a745' : '#dc3545'
  )};
`;

const Row = styled.div`
  display: flex; align-items: center; gap: 0.5rem; color: #555; margin: 0.4rem 0;
`;

const TitleRow = styled.div`
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;
  h3 { margin: 0; font-size: 1.1rem; color: #333; }
`;

const Badge = styled.span`
  padding: 0.25rem 0.6rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; text-transform: uppercase;
  background: ${({ $status }) => (
    $status === 'pending' ? 'rgba(255, 193, 7, 0.12)' : $status === 'confirmed' ? 'rgba(0, 122, 95, 0.12)' : $status === 'completed' ? 'rgba(40, 167, 69, 0.12)' : 'rgba(220, 53, 69, 0.12)'
  )};
  color: ${({ $status }) => (
    $status === 'pending' ? '#856404' : $status === 'confirmed' ? '#007a5f' : $status === 'completed' ? '#155724' : '#721c24'
  )};
`;

const Actions = styled.div`
  display: flex; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap;
`;

const Btn = styled.button`
  padding: 0.5rem 0.9rem; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; transition: all 0.2s;
  ${({ $variant }) => $variant === 'primary' && 'background:#007a5f;color:#fff;'}
  ${({ $variant }) => $variant === 'danger' && 'background:#dc3545;color:#fff;'}
  ${({ $variant }) => $variant === 'secondary' && 'background:#f8f9fa;color:#333;border:1px solid #e0e0e0;'}
`;

const Empty = styled.div`
  text-align: center; color:#666; padding: 2rem 1rem;
`;

const DoctorAppointments = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [q, setQ] = useState('');
  const [resched, setResched] = useState({}); // { [id]: { date, time } }

  useEffect(() => { fetchItems(); }, [filter]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/appointments', {
        params: { status: filter, page: 1, limit: 200 },
      });
      setItems(data?.appointments || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to fetch appointments');
    } finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
  try {
    await api.put(`/appointments/${id}/status`, { status });
    if (status === 'confirmed') {
      toast.success('Appointment approved');
    } else {
      toast.success(
        status === 'completed' ? 'Marked as completed' :
        status === 'cancelled' ? 'Appointment cancelled' :
        'Status updated'
      );
    }
    fetchItems();
  } catch (e) {
    toast.error(e?.response?.data?.message || 'Action failed');
  }
};


  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { year:'numeric', month:'long', day:'numeric' });
  const fmtTime = (t) => new Date(`2000-01-01T${t}`).toLocaleTimeString('en-IN', { hour:'numeric', minute:'2-digit', hour12:true });

  const setResVal = (id, field, value) => setResched(prev => ({ ...prev, [id]: { ...(prev[id] || {}), [field]: value } }));
  const doReschedule = async (id) => {
    const date = resched[id]?.date;
    const time = resched[id]?.time;
    if (!date || !time) {
      toast.error('Pick date and time');
      return;
    }
    try {
      await api.put(`/appointments/${id}`, { appointmentDate: date, appointmentTime: time });
      toast.success('Rescheduled');
      fetchItems();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to reschedule');
    }
  };

  const notifyPre = async (id) => {
    const subject = window.prompt('Pre Email Subject');
    if (!subject) return;
    const message = window.prompt('Pre Email Message (plain text)');
    if (!message) return;
    try {
      await api.post(`/appointments/${id}/notify-pre`, { subject, message });
      toast.success('Pre-session email sent');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to send pre-session email');
    }
  };

  const notifyPost = async (id) => {
    const subject = window.prompt('Post Email Subject');
    if (!subject) return;
    const message = window.prompt('Post Email Message (plain text)');
    if (!message) return;
    try {
      await api.post(`/appointments/${id}/notify-post`, { subject, message });
      toast.success('Post-session email sent');
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to send post-session email');
    }
  };

  const filtered = items.filter(a =>
    (a.therapy?.name || '').toLowerCase().includes(q.toLowerCase()) ||
    (a.patient?.name || '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <Container>
      <Header>
        <h1>Manage Appointments</h1>
        <p>Review requests, confirm sessions, and update outcomes</p>
      </Header>

      <FilterBar>
        <SearchInput>
          <Search className="icon" size={16} />
          <input placeholder="Search by patient or therapy..." value={q} onChange={e => setQ(e.target.value)} />
        </SearchInput>
        <Select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </FilterBar>

      {loading ? (
        <Empty>Loading...</Empty>
      ) : filtered.length === 0 ? (
        <Empty>No appointments to show.</Empty>
      ) : (
        <Grid>
          {filtered.map(a => (
            <Card key={a.id} $status={a.status}>
              <TitleRow>
                <h3>{a.therapy_name || a.therapy?.name}</h3>
                <Badge $status={a.status}>{a.status}</Badge>
              </TitleRow>

              <Row><Calendar size={16} /><span>{fmtDate(a.appointment_date || a._date)}</span></Row>
              <Row><Clock size={16} /><span>{fmtTime(a.appointment_time || a._time)}</span></Row>
              <Row><User size={16} /><span>Patient: {a.patient_name || a._patientName}</span></Row>

              <Actions>
                {(a.status === 'pending' || a.status === 'confirmed') && (
                  <>
                    {a.status === 'pending' && (
                      <Btn $variant="primary" onClick={() => updateStatus(a.id, 'confirmed')}>Approve</Btn>
                    )}
                    <Btn $variant="secondary" as="span" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <input type="date" onChange={e => setResVal(a.id, 'date', e.target.value)} style={{ padding: '6px', border: '1px solid #ddd', borderRadius: 6 }} />
                      <input type="time" onChange={e => setResVal(a.id, 'time', e.target.value)} style={{ padding: '6px', border: '1px solid #ddd', borderRadius: 6 }} />
                      <Btn $variant="primary" onClick={() => doReschedule(a.id)}>Reschedule</Btn>
                    </Btn>
                    <Btn $variant="danger" onClick={() => updateStatus(a.id, 'cancelled')}>Reject</Btn>
                  </>
                )}
                {a.status === 'confirmed' && (
                  <>
                    <Btn $variant="secondary" onClick={() => notifyPre(a.id)}>Send Pre Email</Btn>
                    <Btn $variant="primary" onClick={() => updateStatus(a.id, 'completed')}>Mark Completed</Btn>
                  </>
                )}
                {a.status === 'completed' && (
                  <Btn $variant="secondary" onClick={() => notifyPost(a.id)}>Send Post Email</Btn>
                )}
              </Actions>
            </Card>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default DoctorAppointments;
