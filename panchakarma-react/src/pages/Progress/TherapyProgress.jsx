import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TrendingUp, Calendar, Activity, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import api from '../../services/authService';

// 🌿 Container Styling
const Container = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 2rem;
  h1 {
    color: #007a5f;
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  p {
    color: #666;
    font-size: 1.1rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${props => props.color || '#007a5f'};

  .stat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;

    .stat-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      background: ${props => props.color ? `${props.color}15` : 'rgba(0, 122, 95, 0.1)'};
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${props => props.color || '#007a5f'};
    }
  }

  .stat-value {
    font-size: 2rem;
    font-weight: bold;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .stat-label {
    color: #666;
    font-size: 0.9rem;
  }
`;

const ProgressSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  
  h2 {
    color: #007a5f;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ProgressItem = styled.div`
  margin-bottom: 2rem;
  &:last-child {
    margin-bottom: 0;
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;

    .therapy-name {
      font-weight: 600;
      color: #333;
    }

    .progress-percentage {
      color: #007a5f;
      font-weight: bold;
    }
  }

  .progress-bar {
    width: 100%;
    height: 10px;
    background: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007a5f 0%, #00b88a 100%);
      border-radius: 5px;
      transition: width 0.3s ease;
    }
  }

  .progress-info {
    display: flex;
    justify-content: space-between;
    margin-top: 0.5rem;
    font-size: 0.9rem;
    color: #666;
  }
`;

const TimelineSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);

  h2 {
    color: #007a5f;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  position: relative;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 19px;
    top: 40px;
    width: 2px;
    height: calc(100% + 1rem);
    background: #e0e0e0;
  }

  .timeline-marker {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => props.completed ? '#28a745' : '#007a5f'};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    z-index: 1;
  }

  .timeline-content {
    flex: 1;
    padding-bottom: 1rem;

    .timeline-date {
      color: #999;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }

    .timeline-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.25rem;
    }

    .timeline-description {
      color: #666;
      font-size: 0.95rem;
    }
  }
`;

// 🌱 Main Component
const TherapyProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState({
    totalSessions: 0,
    completedSessions: 0,
    upcomingSessions: 0,
    therapies: [],
    timeline: []
  });

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      // Use the same source as MyAppointments: patient's own appointments
      const res = await api.get('/appointments/my-appointments', {
        params: { status: 'all', page: 1, limit: 200 },
      });
      const appointments = res.data?.appointments || [];

      const totalSessions = appointments.filter(a => a.status !== 'cancelled').length;
      const completedSessions = appointments.filter(a => a.status === 'completed').length;

      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const upcomingSessions = appointments.filter(a => {
        if (a.status === 'cancelled' || a.status === 'completed') return false;
        const d = new Date(a.appointment_date);
        return d >= startOfToday;
      }).length;

      // Build per-therapy progress from appointments
      const byTherapy = {};
      appointments.forEach(a => {
        const name = a.therapy_name || 'Therapy';
        if (!byTherapy[name]) {
          byTherapy[name] = { completed: 0, total: 0 };
        }
        if (a.status !== 'cancelled') {
          byTherapy[name].total += 1;
        }
        if (a.status === 'completed') {
          byTherapy[name].completed += 1;
        }
      });

      const therapies = Object.entries(byTherapy).map(([name, stats]) => {
        const { completed, total } = stats;
        const progress = total ? Math.round((completed / total) * 100) : 0;
        return {
          name,
          progress,
          completed,
          total,
          remaining: total - completed,
        };
      });

      // Build a simple session timeline (most recent first)
      const timeline = [...appointments]
        .filter(a => a.status !== 'cancelled')
        .sort((a, b) => {
          const da = new Date(a.appointment_date).getTime();
          const db = new Date(b.appointment_date).getTime();
          return db - da;
        })
        .slice(0, 10)
        .map(a => {
          // Build a Date object safely from date + time fields
          const base = new Date(a.appointment_date);
          if (a.appointment_time) {
            const [hours, minutes] = a.appointment_time.split(':');
            const h = parseInt(hours, 10) || 0;
            const m = parseInt(minutes, 10) || 0;
            base.setHours(h, m, 0, 0);
          }

          const label = base.toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'Asia/Kolkata',
          });

          return {
            date: label,
            therapy: a.therapy_name || 'Therapy',
            notes: a.notes || (a.status === 'completed' ? 'Session completed' : 'Scheduled session'),
            completed: a.status === 'completed',
          };
        });

      setProgressData({
        totalSessions,
        completedSessions,
        upcomingSessions,
        therapies,
        timeline,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching progress:', error);
      toast.error('Failed to load progress data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
          Loading your progress...
        </div>
      </Container>
    );
  }

  const overallProgress = progressData.totalSessions > 0
    ? Math.round((progressData.completedSessions / progressData.totalSessions) * 100)
    : 0;

  return (
    <Container>
      <Header>
        <h1>My Therapy Progress 🌱</h1>
        <p>Track your healing journey and celebrate your progress over time</p>
      </Header>

      {/* Top Stats */}
      <StatsGrid>
        <StatCard color="#007a5f">
          <div className="stat-header"><div className="stat-icon"><Activity size={20} /></div></div>
          <div className="stat-value">{progressData.totalSessions}</div>
          <div className="stat-label">Total Sessions</div>
        </StatCard>

        <StatCard color="#28a745">
          <div className="stat-header"><div className="stat-icon"><Check size={20} /></div></div>
          <div className="stat-value">{progressData.completedSessions}</div>
          <div className="stat-label">Completed</div>
        </StatCard>

        <StatCard color="#ffa500">
          <div className="stat-header"><div className="stat-icon"><Calendar size={20} /></div></div>
          <div className="stat-value">{progressData.upcomingSessions}</div>
          <div className="stat-label">Upcoming</div>
        </StatCard>

        <StatCard color="#007bff">
          <div className="stat-header"><div className="stat-icon"><TrendingUp size={20} /></div></div>
          <div className="stat-value">{overallProgress}%</div>
          <div className="stat-label">Overall Progress</div>
        </StatCard>
      </StatsGrid>

      {/* Progress Section */}
      <ProgressSection>
        <h2><Activity size={24} />Therapy Progress</h2>
        {progressData.therapies.map((therapy, index) => (
          <ProgressItem key={index}>
            <div className="progress-header">
              <div className="therapy-name">{therapy.name}</div>
              <div className="progress-percentage">{therapy.progress}%</div>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${therapy.progress}%` }} />
            </div>
            <div className="progress-info">
              <span>{therapy.completed} of {therapy.total} sessions completed</span>
              <span>{therapy.remaining} remaining</span>
            </div>
          </ProgressItem>
        ))}
      </ProgressSection>

      {/* Timeline Section */}
      <TimelineSection>
        <h2><Calendar size={24} />Session History</h2>
        {progressData.timeline.map((item, index) => (
          <TimelineItem key={index} completed={item.completed}>
            <div className="timeline-marker">
              {item.completed ? <Check size={20} /> : <Calendar size={20} />}
            </div>
            <div className="timeline-content">
              <div className="timeline-date">{item.date}</div>
              <div className="timeline-title">{item.therapy}</div>
              <div className="timeline-description">{item.notes}</div>
            </div>
          </TimelineItem>
        ))}
      </TimelineSection>
    </Container>
  );
};

export default TherapyProgress;
