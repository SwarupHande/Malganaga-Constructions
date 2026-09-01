// Location hierarchy: State -> District -> Taluka. Village is free text.
// App defaults to Maharashtra / Pune per the product brief.
export const LOCATIONS = {
  Maharashtra: {
    Pune: ['Pune City', 'Haveli', 'Pimpri-Chinchwad', 'Maval', 'Mulshi', 'Shirur', 'Baramati', 'Daund', 'Indapur', 'Bhor', 'Velha (Velhe)', 'Purandar', 'Khed', 'Junnar', 'Ambegaon', 'Loni Kalbhor'],
    Nashik: ['Nashik', 'Malegaon', 'Niphad', 'Sinnar', 'Baglan (Satana)', 'Dindori', 'Nandgaon', 'Kalwan', 'Yeola', 'Igatpuri', 'Chandwad', 'Surgana', 'Trimbakeshwar', 'Deola', 'Peth (Peint)'],
    Ahmednagar: ['Nagar', 'Newasa', 'Karjat', 'Jamkhed', 'Pathardi', 'Shevgaon', 'Shrigonda', 'Parner', 'Sangamner', 'Akole', 'Rahata', 'Kopargaon', 'Shrirampur', 'Rahuri'],
  },
};

export const DEFAULT_LOCATION = {
  state: 'Maharashtra',
  district: 'Pune',
  taluka: 'Junnar',
  village: 'Umbraj No. 1',
};

// Ordered construction-stage workflow. Color is a CSS variable suffix (see index.css).
const STAGE_COLORS = ['gray', 'blue', 'amber', 'indigo', 'teal', 'green', 'red', 'purple'];
const STAGE_NAMES = [
  'Excavation',
  'Filling',
  'Rubber soling',
  'Plum concert',
  'Rcc work',
  'Brick work',
  'Plaster',
  'Waterproof',
  'Flooring',
  'Tiling',
  'Wiring',
  'Plumbing',
  'Sliding',
  'Grilling',
  'Railing',
  'Color',
  'Pop fall sealing',
  'Gypsum plaster',
  'Color texture plaster',
  'Stone cliding',
  'Slanting Roofing',
];

export const DEFAULT_STATUSES = STAGE_NAMES.map((name, i) => ({
  id: `st-${i + 1}`,
  name,
  color: STAGE_COLORS[i % STAGE_COLORS.length],
}));

export const SEED_WORKERS = [
  { id: 'w-1', name: 'Vikram Salunkhe', role: 'Mason', dailyRate: 700 },
  { id: 'w-2', name: 'Anita More', role: 'Helper', dailyRate: 450 },
  { id: 'w-3', name: 'Suresh Jadhav', role: 'Carpenter', dailyRate: 750 },
  { id: 'w-4', name: 'Ramesh Pawar', role: 'Electrician', dailyRate: 800 },
  { id: 'w-5', name: 'Deepak Shinde', role: 'Plumber', dailyRate: 780 },
  { id: 'w-6', name: 'Kavita Bhosale', role: 'Helper', dailyRate: 450 },
  { id: 'w-7', name: 'Santosh Kale', role: 'Site Supervisor', dailyRate: 950 },
];

export const SEED_PROJECTS = [
  {
    id: 'p-1',
    name: 'Green Acres Villa',
    description: '3BHK bungalow with attached garden and car porch.',
    location: { state: 'Maharashtra', district: 'Pune', taluka: 'Mulshi', village: 'Sus' },
    startDate: '2026-06-01',
    budget: 4200000,
    statusId: 'st-5',
    manager: 'Ramesh Patil',
  },
  {
    id: 'p-2',
    name: 'Sunrise Farmhouse',
    description: '2BHK weekend farmhouse with veranda.',
    location: { state: 'Maharashtra', district: 'Pune', taluka: 'Maval', village: 'Kamshet' },
    startDate: '2026-07-10',
    budget: 2800000,
    statusId: 'st-2',
    manager: 'Sunita Deshmukh',
  },
  {
    id: 'p-3',
    name: 'Riverside Bungalow',
    description: '4BHK duplex bungalow near the riverbank.',
    location: { state: 'Maharashtra', district: 'Nashik', taluka: 'Sinnar', village: 'Vadangali' },
    startDate: '2026-04-15',
    budget: 6100000,
    statusId: 'st-10',
    manager: 'Ramesh Patil',
  },
  {
    id: 'p-4',
    name: 'Willow Court Cottage',
    description: 'Compact 1BHK cottage for a retired couple.',
    location: { state: 'Maharashtra', district: 'Pune', taluka: 'Junnar', village: 'Umbraj No. 1' },
    startDate: '2026-08-01',
    budget: 1600000,
    statusId: 'st-1',
    manager: 'Sunita Deshmukh',
  },
];

export const SEED_PROJECT_WORKERS = [
  { id: 'pw-1', projectId: 'p-1', workerId: 'w-1', assignedDate: '2026-06-05' },
  { id: 'pw-2', projectId: 'p-1', workerId: 'w-2', assignedDate: '2026-06-05' },
  { id: 'pw-3', projectId: 'p-1', workerId: 'w-3', assignedDate: '2026-06-20' },
  { id: 'pw-4', projectId: 'p-1', workerId: 'w-7', assignedDate: '2026-06-01' },
  { id: 'pw-5', projectId: 'p-2', workerId: 'w-2', assignedDate: '2026-07-10' },
  { id: 'pw-6', projectId: 'p-2', workerId: 'w-6', assignedDate: '2026-07-10' },
  { id: 'pw-7', projectId: 'p-3', workerId: 'w-1', assignedDate: '2026-04-15' },
  { id: 'pw-8', projectId: 'p-3', workerId: 'w-4', assignedDate: '2026-05-20' },
  { id: 'pw-9', projectId: 'p-3', workerId: 'w-5', assignedDate: '2026-05-25' },
  { id: 'pw-10', projectId: 'p-3', workerId: 'w-7', assignedDate: '2026-04-15' },
];

// A week of demo attendance for the two most active projects, so Reports/Dashboard have real data to show.
function lastNDays(n) {
  const out = [];
  const base = new Date('2026-08-15');
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}
const DAYS = lastNDays(7);

export const SEED_ATTENDANCE = [];
let attId = 1;
DAYS.forEach((date, i) => {
  [
    { projectId: 'p-1', workerId: 'w-1' },
    { projectId: 'p-1', workerId: 'w-2' },
    { projectId: 'p-1', workerId: 'w-7' },
  ].forEach((a) => {
    if (i === 2) return; // one day off mid-week for variety
    SEED_ATTENDANCE.push({
      id: `att-${attId++}`,
      projectId: a.projectId,
      workerId: a.workerId,
      date,
      present: true,
      hours: 8,
    });
  });
  [
    { projectId: 'p-3', workerId: 'w-4' },
    { projectId: 'p-3', workerId: 'w-5' },
    { projectId: 'p-3', workerId: 'w-7' },
  ].forEach((a) => {
    if (i === 5) return;
    SEED_ATTENDANCE.push({
      id: `att-${attId++}`,
      projectId: a.projectId,
      workerId: a.workerId,
      date,
      present: true,
      hours: i === 6 ? 6 : 8,
    });
  });
});

export const SEED_ESTIMATES = [
  {
    id: 'est-1',
    projectId: 'p-1',
    version: 1,
    createdDate: '2026-05-20',
    items: [
      { id: 'ei-1', category: 'Material', description: 'Cement (OPC 43)', quantity: 200, unitRate: 400 },
      { id: 'ei-2', category: 'Material', description: 'TMT Steel Bars (Fe 500)', quantity: 3.5, unitRate: 62000 },
      { id: 'ei-3', category: 'Material', description: 'Bricks', quantity: 18000, unitRate: 8 },
      { id: 'ei-4', category: 'Labor', description: 'Mason work', quantity: 60, unitRate: 700 },
      { id: 'ei-5', category: 'Labor', description: 'Helper work', quantity: 90, unitRate: 450 },
      { id: 'ei-6', category: 'Overhead', description: 'Contingency (5%)', quantity: 1, unitRate: 43000 },
    ],
  },
  {
    id: 'est-2',
    projectId: 'p-3',
    version: 1,
    createdDate: '2026-04-25',
    items: [
      { id: 'ei-7', category: 'Material', description: 'Cement (OPC 43)', quantity: 340, unitRate: 400 },
      { id: 'ei-8', category: 'Material', description: 'TMT Steel Bars (Fe 500)', quantity: 5.2, unitRate: 61500 },
      { id: 'ei-9', category: 'Labor', description: 'Mason + Carpenter work', quantity: 140, unitRate: 730 },
      { id: 'ei-10', category: 'Overhead', description: 'Contingency (5%)', quantity: 1, unitRate: 65000 },
    ],
  },
];

export const SEED_EXPENSES = [
  { id: 'exp-1', projectId: 'p-1', category: 'Material', description: 'Cement delivery - batch 1', amount: 78500, date: '2026-06-18' },
  { id: 'exp-2', projectId: 'p-1', category: 'Material', description: 'Bricks - batch 1', amount: 142000, date: '2026-07-02' },
  { id: 'exp-3', projectId: 'p-1', category: 'Overhead', description: 'Site fencing & misc', amount: 18000, date: '2026-06-10' },
  { id: 'exp-4', projectId: 'p-3', category: 'Material', description: 'Steel bars - full order', amount: 318000, date: '2026-05-02' },
  { id: 'exp-5', projectId: 'p-3', category: 'Material', description: 'Cement - batch 1 & 2', amount: 132000, date: '2026-05-28' },
];

export const MANAGERS = ['Ramesh Patil', 'Sunita Deshmukh', 'Ajay Kulkarni'];
