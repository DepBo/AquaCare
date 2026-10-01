const defaults = {
  ph: { good: [6.5, 7.5], warn: [6, 8] },
  temp: { good: [24, 28], warn: [22, 30] },
  tds: { good: [150, 300], warn: [100, 400] },
};

function bounds(species, minKey, maxKey, fallback, lowerMargin, upperMargin = lowerMargin) {
  const min = Number(species?.[minKey]);
  const max = Number(species?.[maxKey]);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min >= max || species?.[minKey] == null || species?.[maxKey] == null) return fallback;
  return { good: [min, max], warn: [min - lowerMargin, max + upperMargin] };
}

async function getSpeciesThresholds(supabase, tankId) {
  try {
    const { data: tank, error: tankError } = await supabase.from('tanks').select('species_id').eq('id', tankId).single();
    if (tankError || !tank?.species_id) return defaults;
    const { data: species, error: speciesError } = await supabase.from('fish_species').select('ph_min, ph_max, temp_min, temp_max, tds_min, tds_max').eq('id', tank.species_id).single();
    if (speciesError || !species) return defaults;
    return {
      ph: bounds(species, 'ph_min', 'ph_max', defaults.ph, 0.5),
      temp: bounds(species, 'temp_min', 'temp_max', defaults.temp, 2),
      tds: bounds(species, 'tds_min', 'tds_max', defaults.tds, 50, 100),
    };
  } catch (error) {
    console.error('Không thể tải ngưỡng loài cá, dùng ngưỡng mặc định:', error);
    return defaults;
  }
}

module.exports = { getSpeciesThresholds };
