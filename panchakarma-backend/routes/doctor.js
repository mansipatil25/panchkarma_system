const express = require('express');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// Doctor-only guard
const requireDoctorRole = (req, res, next) => {
  if (req.user.role !== 'doctor') {
    return res.status(403).json({ message: 'Doctor access required' });
  }
  next();
};

// Get patients of the logged-in doctor with basic stats
router.get('/my-patients', authenticateToken, requireDoctorRole, async (req, res) => {
  try {
    const doctorId = req.user.userId;

    const [rows] = await pool.query(`
      SELECT 
        p.id AS patient_id,
        p.name AS patient_name,
        p.email AS patient_email,
        p.phone AS patient_phone,
        p.status AS patient_status,
        COUNT(a.id) AS total_appointments,
        SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) AS completed_appointments,
        MIN(a.appointment_date) AS first_appointment_date,
        MAX(a.appointment_date) AS last_appointment_date
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      WHERE a.doctor_id = ?
      GROUP BY p.id, p.name, p.email, p.phone, p.status
      ORDER BY last_appointment_date DESC
    `, [doctorId]);

    const patients = rows.map(row => ({
      id: row.patient_id,
      name: row.patient_name,
      email: row.patient_email,
      phone: row.patient_phone,
      therapyCount: row.total_appointments,
      status: row.patient_status === 'active' ? 'Active' : 'Inactive',
      firstAppointmentDate: row.first_appointment_date,
      lastAppointmentDate: row.last_appointment_date,
      completedAppointments: row.completed_appointments || 0,
    }));

    const totalPatients = patients.length;
    const activePatients = patients.filter(p => p.status === 'Active').length;
    const totalAppointments = patients.reduce((sum, p) => sum + (p.therapyCount || 0), 0);

    // New this month = patients whose first appointment is in the current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const newThisMonth = patients.filter(p => {
      if (!p.firstAppointmentDate) return false;
      const d = new Date(p.firstAppointmentDate);
      return d >= startOfMonth && d <= now;
    }).length;

    return res.json({
      patients,
      stats: {
        totalPatients,
        activePatients,
        newThisMonth,
        totalAppointments,
      },
    });
  } catch (error) {
    console.error('Doctor my-patients error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
