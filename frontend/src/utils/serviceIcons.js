export const serviceIcons = {
  cleaning: '🧹',
  plumbing: '🔧',
  electrical: '⚡',
  'elder care': '👵',
  gardening: '🌱'
};

export const getServiceIcon = (type) => serviceIcons[type] || '🛠';