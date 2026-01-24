import { 
  getProvinces as fetchProvinces, 
  getDistrictsByProvince, 
  getGaPasByDistrict 
} from 'nepal-administrative-data';

/**
 * Get all provinces in Nepal
 * @returns {Array} Array of provinces with id and name
 */
export const getProvinces = () => {
  try {
    const provinces = fetchProvinces();
    return provinces.map(province => ({
      id: province.code,
      name: province.name,
      nameNp: province.name
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

/**
 * Get districts for a specific province
 * @param {string|number} provinceId - Province ID
 * @returns {Array} Array of districts with id and name
 */
export const getDistricts = (provinceId) => {
  if (!provinceId) return [];
  
  try {
    const districts = getDistrictsByProvince(Number(provinceId));
    return districts.map(district => ({
      id: district.code,
      name: district.name,
      nameNp: district.name,
      provinceId: provinceId
    }));
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
};

/**
 * Get municipalities/VDCs for a specific district
 * @param {string|number} districtId - District ID
 * @returns {Array} Array of municipalities with id, name and type
 */
export const getMunicipalities = (districtId) => {
  if (!districtId) return [];
  
  try {
    const municipalities = getGaPasByDistrict(Number(districtId));
    return municipalities.map(municipality => ({
      id: municipality.code,
      name: municipality.name,
      nameNp: municipality.name,
      type: municipality.name.includes('Municipality') ? 'Municipality' : 'Rural Municipality',
      districtId: districtId,
      totalWard: municipality.totalWard
    }));
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    return [];
  }
};

/**
 * Get location name from coordinates using reverse geocoding
 * This is a simplified version - for production use a proper geocoding service
 * @param {number} latitude 
 * @param {number} longitude 
 * @returns {Promise<Object>} Location details
 */
export const getLocationFromCoordinates = async (latitude, longitude) => {
  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    
    const data = await response.json();
    
    // Extract relevant information
    const address = data.address || {};
    
    return {
      province: address.state || '',
      district: address.county || address.state_district || '',
      municipality: address.city || address.town || address.village || address.municipality || '',
      ward: address.suburb || '',
      fullAddress: data.display_name || ''
    };
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    throw error;
  }
};

/**
 * Match location name from geocoding to Nepal administrative data
 * @param {Object} geocodedLocation - Location from geocoding
 * @param {string} language - 'en' or 'np'
 * @returns {Object} Matched IDs for province, district, municipality
 */
export const matchLocationToNepalData = (geocodedLocation, language = 'en') => {
  const result = {
    provinceId: null,
    districtId: null,
    municipalityId: null
  };
  
  if (!geocodedLocation) return result;
  
  const provinces = getProvinces();
  const nameKey = language === 'np' ? 'nameNp' : 'name';
  
  // Try to match province
  const matchedProvince = provinces.find(p => 
    geocodedLocation.province && 
    (p[nameKey].toLowerCase().includes(geocodedLocation.province.toLowerCase()) ||
     geocodedLocation.province.toLowerCase().includes(p[nameKey].toLowerCase()))
  );
  
  if (matchedProvince) {
    result.provinceId = matchedProvince.id;
    
    // Try to match district
    const districts = getDistricts(matchedProvince.id);
    const matchedDistrict = districts.find(d => 
      geocodedLocation.district && 
      (d[nameKey].toLowerCase().includes(geocodedLocation.district.toLowerCase()) ||
       geocodedLocation.district.toLowerCase().includes(d[nameKey].toLowerCase()))
    );
    
    if (matchedDistrict) {
      result.districtId = matchedDistrict.id;
      
      // Try to match municipality
      const municipalities = getMunicipalities(matchedDistrict.id);
      const matchedMunicipality = municipalities.find(m => 
        geocodedLocation.municipality && 
        (m[nameKey].toLowerCase().includes(geocodedLocation.municipality.toLowerCase()) ||
         geocodedLocation.municipality.toLowerCase().includes(m[nameKey].toLowerCase()))
      );
      
      if (matchedMunicipality) {
        result.municipalityId = matchedMunicipality.id;
      }
    }
  }
  
  return result;
};

/**
 * Request user's current location using browser geolocation API
 * @returns {Promise<Object>} Coordinates and matched location data
 */
export const getCurrentLocation = async () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Get location name from coordinates
          const geocodedLocation = await getLocationFromCoordinates(latitude, longitude);
          
          // Match to Nepal administrative data
          const matchedIds = matchLocationToNepalData(geocodedLocation);
          
          resolve({
            coordinates: { latitude, longitude },
            geocoded: geocodedLocation,
            matched: matchedIds,
            success: true
          });
        } catch (error) {
          // Even if geocoding fails, return coordinates
          resolve({
            coordinates: { latitude, longitude },
            geocoded: null,
            matched: { provinceId: null, districtId: null, municipalityId: null },
            success: false,
            error: error.message
          });
        }
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};
