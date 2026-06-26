// In-memory data storage for development
// Replace with actual database in production

const bcrypt = require('bcryptjs');

// Pre-populate with admin and doctor accounts
const users = [
  {
    id: 1,
    name: ' Admin',
    email: 'admin@niramay.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin',
    phone: '+91-9876543210',
    specialization: 'System Administration',
    status: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 2,
    name: 'Dr. Priya Sharma',
    email: 'doctor@niramay.com',
    password: bcrypt.hashSync('doctor123', 10),
    role: 'doctor',
    phone: '+91-9876543211',
    specialization: 'Panchakarma Specialist',
    experience: '8 years',
    qualifications: 'BAMS, MD (Ayurveda)',
    about: 'Experienced Ayurvedic doctor specializing in Panchakarma treatments and detoxification therapies.',
    status: 'active',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  },
  {
    id: 3,
    name: 'Dr. Rajesh Kumar',
    email: 'doctor2@niramay.com',
    password: bcrypt.hashSync('doctor123', 10),
    role: 'doctor',
    phone: '+91-9876543212',
    specialization: 'Ayurvedic Medicine',
    experience: '12 years',
    qualifications: 'BAMS, PhD (Ayurveda)',
    about: 'Senior consultant with expertise in traditional Ayurvedic treatments and wellness programs.',
    status: 'active',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03')
  }
];
const appointments = [];
const therapies = [
  {
    id: 1,
    name: 'Vamana',
    description: 'Therapeutic emesis to expel aggravated Kapha dosha from the body',
    duration: '1 day (procedure 2–4 hours)',
    price: 4000,
    benefits: ['Cleanses Kapha', 'Improves respiration', 'Reduces allergies', 'Enhances digestion'],
    procedures: ['Poorva Karma (Snehana & Swedana)', 'Medicated emesis', 'Samsarjana Krama (diet regimen)'],
    image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?ixlib=rb-4.0.3',
    category: 'Panchakarma',
    availability: true
  },
  {
    id: 2,
    name: 'Virechana',
    description: 'Medicated purgation to eliminate aggravated Pitta dosha',
    duration: '1 day (procedure 2–3 hours)',
    price: 4500,
    benefits: ['Liver detox', 'Skin purification', 'Relieves acidity', 'Improves metabolism'],
    procedures: ['Poorva Karma (Snehana & Swedana)', 'Medicated purgation', 'Samsarjana Krama'],
    image: 'https://images.unsplash.com/photo-1505575972945-280c4f1e0b2f?ixlib=rb-4.0.3',
    category: 'Panchakarma',
    availability: true
  },
  {
    id: 3,
    name: 'Basti',
    description: 'Medicated enema therapy effective for Vata disorders',
    duration: '60 minutes',
    price: 3000,
    benefits: ['Relieves constipation', 'Back & joint pain relief', 'Nervine strengthening', 'Improves mobility'],
    procedures: ['Anuvasana (oil basti)', 'Niruha (decoction basti)'],
    image: 'https://images.unsplash.com/photo-1604908553977-8b9c77540182?ixlib=rb-4.0.3',
    category: 'Panchakarma',
    availability: true
  },
  {
    id: 4,
    name: 'Nasya',
    description: 'Medicated nasal instillation to cleanse and nourish the head region',
    duration: '45 minutes',
    price: 2000,
    benefits: ['Relieves sinusitis', 'Improves memory', 'Reduces headaches', 'Enhances clarity of senses'],
    procedures: ['Face & head massage', 'Mild steam', 'Medicated drops instillation'],
    image: 'https://images.unsplash.com/photo-1621839673705-cb2c050f3d17?ixlib=rb-4.0.3',
    category: 'Panchakarma',
    availability: true
  },
  {
    id: 5,
    name: 'Raktamokshana',
    description: 'Therapeutic bloodletting to eliminate aggravated Rakta (blood) and Pitta',
    duration: '60 minutes',
    price: 5000,
    benefits: ['Improves skin disorders', 'Reduces inflammation', 'Relieves varicose veins discomfort', 'Detoxifies blood'],
    procedures: ['Pracchana (scarification) / Siravyadha (venesection) as indicated'],
    image: 'https://images.unsplash.com/photo-1516542076529-1ea3854896e1?ixlib=rb-4.0.3',
    category: 'Panchakarma',
    availability: true
  }
];
const notifications = [];
const therapySessions = [];
const doctorSchedules = [];

module.exports = {
  users,
  appointments,
  therapies,
  notifications,
  therapySessions,
  doctorSchedules
};