/**
 * FarmMate Visual Assets Mapping
 * Resolves local high-resolution agricultural photos from public directories.
 */

const CROP_IMAGE_MAP: Record<string, string> = {
  rice: '/Crop_images/Paddy.jpg',
  paddy: '/Crop_images/Paddy.jpg',
  maize: '/Crop_images/Maize.jpg',
  corn: '/Crop_images/Maize.jpg',
  wheat: '/Crop_images/Wheat.jpg',
  barley: '/Crop_images/Barley.jpg',
  coffee: '/Crop_images/Coffee.jpg',
  cotton: '/Crop_images/Cotton Plant.jpg',
  apple: '/Crop_images/Apples.jpg',
  apples: '/Crop_images/Apples.jpg',
  banana: '/Crop_images/Banana.jpg',
  blackgram: '/Crop_images/Blackgram.jpg',
  brinjal: '/Crop_images/Brinjal.jpg',
  eggplant: '/Crop_images/Brinjal.jpg',
  cabbage: '/Crop_images/Cabbage.jpg',
  carrot: '/Crop_images/Carrot.jpg',
  cassava: '/Crop_images/Cassava.jpg',
  cauliflower: '/Crop_images/Cauliflower.jpg',
  chickpea: '/Crop_images/Chickpeas.jpg',
  chickpeas: '/Crop_images/Chickpeas.jpg',
  coconut: '/Crop_images/Coconut.jpg',
  grapes: '/Crop_images/Grapes.jpg',
  jute: '/Crop_images/Jute Plant.jpg',
  'kidney beans': '/Crop_images/Kidney beans.jpg',
  kidneybeans: '/Crop_images/Kidney beans.jpg',
  lentil: '/Crop_images/Lentil.jpg',
  mango: '/Crop_images/Mango.jpg',
  mothbeans: '/Crop_images/Mothbean.jpg',
  mothbean: '/Crop_images/Mothbean.jpg',
  mungbean: '/Crop_images/Mungbean.jpg',
  muskmelon: '/Crop_images/Musk melon.jpg',
  'musk melon': '/Crop_images/Musk melon.jpg',
  onion: '/Crop_images/Onion.jpg',
  orange: '/Crop_images/Orange.jpg',
  papaya: '/Crop_images/Papaya.jpg',
  'pigeon peas': '/Crop_images/Pigeon Peas.jpg',
  pigeonpeas: '/Crop_images/Pigeon Peas.jpg',
  pomegranate: '/Crop_images/Pomogranate.jpg',
  pomogranate: '/Crop_images/Pomogranate.jpg',
  potato: '/Crop_images/Potato.jpg',
  sorghum: '/Crop_images/Sorghum.jpg',
  soybean: '/Crop_images/Soybeans.jpg',
  soybeans: '/Crop_images/Soybeans.jpg',
  spinach: '/Crop_images/Spinach.jpg',
  sugarcane: '/Crop_images/Sugarcane.jpg',
  'sweet potato': '/Crop_images/Sweet Potato.jpg',
  sweetpotato: '/Crop_images/Sweet Potato.jpg',
  tea: '/Crop_images/Tea plant.jpg',
  tomato: '/Crop_images/Tomato.jpg',
  watermelon: '/Crop_images/Watermelon.jpg'
};

const FERTILIZER_IMAGE_MAP: Record<string, string> = {
  urea: '/Crop_images/Urea.jpg',
  dap: '/Crop_images/DAP.jpg',
  '14-35-14': '/Crop_images/Balanced NPK.jpg',
  '28-28': '/Crop_images/Balanced NPK.jpg',
  '17-17-17': '/Crop_images/Balanced NPK.jpg',
  '20-20': '/Crop_images/Balanced NPK.jpg',
  '10-26-26': '/Crop_images/Balanced NPK.jpg',
  mop: '/Crop_images/MOP.jpg',
  'muriate of potash': '/Crop_images/MOP.jpg',
  'single super phosphate': '/Crop_images/Single Super phosphate.jpg',
  ssp: '/Crop_images/Single Super phosphate.jpg',
  'ammonium sulphate': '/Crop_images/Ammonium sulphate.jpg',
  'agricultural lime': '/Crop_images/Agricultural lime.jpg',
  lime: '/Crop_images/Agricultural lime.jpg',
  gypsum: '/Crop_images/Gypsum.jpg',
  hydrogel: '/Crop_images/Hydrogel.jpg',
  'neem cake': '/Crop_images/Neem cake.jpg',
  'organic compost': '/Crop_images/Organic compost.jpg',
  compost: '/Crop_images/Organic compost.jpg',
  vermicompost: '/Crop_images/Vermicompost.jpg'
};

export function getCropImage(name?: string): string {
  if (!name) return '/Crop_images/Paddy.jpg';
  const clean = name.trim().toLowerCase();
  if (CROP_IMAGE_MAP[clean]) return CROP_IMAGE_MAP[clean];
  
  // Fuzzy match
  for (const [key, path] of Object.entries(CROP_IMAGE_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return path;
    }
  }
  return '/Crop_images/Paddy.jpg';
}

export function getFertilizerImage(name?: string): string {
  if (!name) return '/Crop_images/Urea.jpg';
  const clean = name.trim().toLowerCase();
  if (FERTILIZER_IMAGE_MAP[clean]) return FERTILIZER_IMAGE_MAP[clean];
  
  for (const [key, path] of Object.entries(FERTILIZER_IMAGE_MAP)) {
    if (clean.includes(key) || key.includes(clean)) {
      return path;
    }
  }
  return '/Crop_images/Balanced NPK.jpg';
}

/**
 * Returns the appropriate weather image path based on condition and current time.
 * At night (8 PM – 5 AM), uses night-specific images for rain, cloudy, and clear.
 */
export function getWeatherImage(conditionOrHour?: string | number): string {
  const currentHour = new Date().getHours();
  const isNightTime = currentHour >= 20 || currentHour < 5;

  if (typeof conditionOrHour === 'number') {
    const hour = conditionOrHour;
    if (hour >= 5 && hour < 12) return '/Agriculture images/Morning.png';
    if (hour >= 12 && hour < 17) return '/Agriculture images/Suuny.png';
    if (hour >= 17 && hour < 20) return '/Agriculture images/Evening.png';
    return '/Agriculture images/Night.png';
  }

  const cond = (conditionOrHour || 'sunny').toLowerCase();

  // Night-specific condition mapping
  if (isNightTime) {
    if (cond.includes('rain') || cond.includes('drizzle')) return '/Agriculture images/Night rain.png';
    if (cond.includes('storm') || cond.includes('thunder')) return '/Agriculture images/Night rain.png';
    if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('fog')) return '/Agriculture images/Night Cloudly.png';
    if (cond.includes('frost') || cond.includes('snow') || cond.includes('cold')) return '/Agriculture images/Late Night.png';
    return '/Agriculture images/Night.png';
  }

  // Daytime condition mapping
  if (cond.includes('rain') || cond.includes('drizzle')) return '/Agriculture images/Rainy.png';
  if (cond.includes('storm') || cond.includes('thunder')) return '/Agriculture images/thunderstorm.png';
  if (cond.includes('cloud') || cond.includes('overcast') || cond.includes('fog')) return '/Agriculture images/Cloudy.png';
  if (cond.includes('frost') || cond.includes('snow') || cond.includes('cold')) return '/Agriculture images/Late Night.png';
  if (cond.includes('evening') || cond.includes('sunset')) return '/Agriculture images/Evening.png';
  return '/Agriculture images/Suuny.png';
}
