/**
 * =============================================================================
 * NEPAL LOCATION UTILITIES
 * =============================================================================
 * 
 * This file provides helper functions for working with Nepal's administrative
 * divisions: Provinces, Districts, and Municipalities.
 * 
 * NEPAL'S ADMINISTRATIVE STRUCTURE:
 * 
 *   Province (7 total)
 *      └── Districts (77 total)
 *           └── Municipalities/Rural Municipalities (753 total)
 *                └── Wards (numbered 1, 2, 3, etc.)
 * 
 * This file uses the 'nepal-administrative-data' package which contains
 * official data from the Government of Nepal.
 * 
 * HOW TO USE:
 * 
 *   import { getProvinces, getDistricts, getMunicipalities } from './nepalLocation';
 *   
 *   // Get all provinces
 *   const provinces = getProvinces();
 *   
 *   // Get districts in Province 1
 *   const districts = getDistricts(1);
 *   
 *   // Get municipalities in Jhapa district (code 111)
 *   const municipalities = getMunicipalities(111);
 */

import { 
  getProvinces as fetchProvinces, 
  getDistrictsByProvince, 
  getGaPasByDistrict 
} from 'nepal-administrative-data';


// =============================================================================
// GET PROVINCES
// =============================================================================

/**
 * Get a list of all 7 provinces in Nepal.
 * 
 * @returns {Array} Array of province objects
 * 
 * Each province object contains:
 *   - id: Province code (1-7)
 *   - name: Province name in English
 *   - nameNp: Province name in Nepali
 * 
 * EXAMPLE:
 *   const provinces = getProvinces();
 *   // Returns: [{ id: 1, name: "Koshi", nameNp: "कोशी" }, ...]
 */
export function getProvinces() {
  try {
    // Fetch provinces from the data package
    const provinces = fetchProvinces();
    
    // Transform to our preferred format
    const formattedProvinces = [];
    
    for (let i = 0; i < provinces.length; i++) {
      const province = provinces[i];
      formattedProvinces.push({
        id: province.code,
        name: province.name,
        nameNp: province.name  // Package doesn't have Nepali names
      });
    }
    
    return formattedProvinces;
    
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
}


// =============================================================================
// GET DISTRICTS
// =============================================================================

/**
 * Get a list of districts within a specific province.
 * 
 * @param {string|number} provinceId - The province code (1-7)
 * @returns {Array} Array of district objects
 * 
 * Each district object contains:
 *   - id: District code
 *   - name: District name
 *   - nameNp: District name in Nepali
 *   - provinceId: Parent province code
 * 
 * EXAMPLE:
 *   const districts = getDistricts(1);  // Get districts in Province 1
 *   // Returns: [{ id: 111, name: "Jhapa", ... }, { id: 112, name: "Ilam", ... }, ...]
 */
export function getDistricts(provinceId) {
  // Return empty array if no province selected
  if (!provinceId) {
    return [];
  }
  
  try {
    // Fetch districts from the data package
    // Convert provinceId to number in case it's a string
    const districts = getDistrictsByProvince(Number(provinceId));
    
    // Transform to our preferred format
    const formattedDistricts = [];
    
    for (let i = 0; i < districts.length; i++) {
      const district = districts[i];
      formattedDistricts.push({
        id: district.code,
        name: district.name,
        nameNp: district.name,
        provinceId: provinceId
      });
    }
    
    return formattedDistricts;
    
  } catch (error) {
    console.error('Error fetching districts:', error);
    return [];
  }
}


// =============================================================================
// GET MUNICIPALITIES
// =============================================================================

/**
 * Get a list of municipalities within a specific district.
 * 
 * @param {string|number} districtId - The district code
 * @returns {Array} Array of municipality objects
 * 
 * Each municipality object contains:
 *   - id: Municipality code
 *   - name: Municipality name
 *   - nameNp: Municipality name in Nepali
 *   - type: 'Municipality' or 'Rural Municipality'
 *   - districtId: Parent district code
 *   - totalWard: Number of wards in this municipality
 * 
 * EXAMPLE:
 *   const municipalities = getMunicipalities(111);  // Jhapa district
 *   // Returns: [{ id: 11107, name: "Damak", totalWard: 10, ... }, ...]
 */
export function getMunicipalities(districtId) {
  // Return empty array if no district selected
  if (!districtId) {
    return [];
  }
  
  try {
    // Fetch municipalities from the data package
    // GaPa = Gaunpalika (Rural Municipality) or Nagarpalika (Municipality)
    const municipalities = getGaPasByDistrict(Number(districtId));
    
    // Transform to our preferred format
    const formattedMunicipalities = [];
    
    for (let i = 0; i < municipalities.length; i++) {
      const municipality = municipalities[i];
      
      // Determine if it's a Municipality or Rural Municipality
      let type = 'Rural Municipality';
      if (municipality.name.includes('Municipality')) {
        type = 'Municipality';
      }
      
      formattedMunicipalities.push({
        id: municipality.code,
        name: municipality.name,
        nameNp: municipality.name,
        type: type,
        districtId: districtId,
        totalWard: municipality.totalWard
      });
    }
    
    return formattedMunicipalities;
    
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    return [];
  }
}

// =============================================================================
// GET LOCATION FROM COORDINATES (Reverse Geocoding)
// =============================================================================

/**
 * Convert GPS coordinates (latitude/longitude) into a human-readable address.
 * 
 * This process is called "reverse geocoding" - the opposite of geocoding
 * (which converts addresses to coordinates).
 * 
 * WHAT IT DOES:
 * 1. Takes GPS coordinates (like 26.6619, 87.6909)
 * 2. Sends them to OpenStreetMap's free API
 * 3. Returns address details (province, district, municipality, etc.)
 * 
 * @param {number} latitude - The latitude coordinate (e.g., 26.6619 for Damak)
 * @param {number} longitude - The longitude coordinate (e.g., 87.6909 for Damak)
 * @returns {Promise<Object>} Location details object
 * 
 * EXAMPLE:
 *   const location = await getLocationFromCoordinates(26.6619, 87.6909);
 *   // Returns: { province: "Province 1", district: "Jhapa", municipality: "Damak", ... }
 * 
 * NOTE: This uses OpenStreetMap's free Nominatim API.
 * For production, consider using a paid service for reliability.
 */
export async function getLocationFromCoordinates(latitude, longitude) {
  try {
    // Step 1: Build the API URL
    // We're using OpenStreetMap's free Nominatim reverse geocoding service
    const apiUrl = 'https://nominatim.openstreetmap.org/reverse';
    const fullUrl = apiUrl + '?format=json&lat=' + latitude + '&lon=' + longitude + '&addressdetails=1';
    
    // Step 2: Make the API request
    const response = await fetch(fullUrl);
    
    // Step 3: Check if the request was successful
    if (!response.ok) {
      throw new Error('Failed to fetch location from coordinates');
    }
    
    // Step 4: Parse the JSON response
    const data = await response.json();
    
    // Step 5: Extract the address details
    // The API returns an 'address' object with various fields
    let address = data.address;
    if (!address) {
      address = {};
    }
    
    // Step 6: Map the API response to our format
    // The API uses different field names for different locations
    // We need to check multiple possible fields for each value
    
    // Get province (OpenStreetMap calls it 'state')
    let province = '';
    if (address.state) {
      province = address.state;
    }
    
    // Get district (could be 'county' or 'state_district')
    let district = '';
    if (address.county) {
      district = address.county;
    } else if (address.state_district) {
      district = address.state_district;
    }
    
    // Get municipality (could be city, town, village, or municipality)
    let municipality = '';
    if (address.city) {
      municipality = address.city;
    } else if (address.town) {
      municipality = address.town;
    } else if (address.village) {
      municipality = address.village;
    } else if (address.municipality) {
      municipality = address.municipality;
    }
    
    // Get ward (OpenStreetMap sometimes puts this in 'suburb')
    let ward = '';
    if (address.suburb) {
      ward = address.suburb;
    }
    
    // Get full address (human-readable combined address)
    let fullAddress = '';
    if (data.display_name) {
      fullAddress = data.display_name;
    }
    
    // Step 7: Return the formatted location object
    const locationDetails = {
      province: province,
      district: district,
      municipality: municipality,
      ward: ward,
      fullAddress: fullAddress
    };
    
    return locationDetails;
    
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    throw error;
  }
}

// =============================================================================
// MATCH LOCATION TO NEPAL ADMINISTRATIVE DATA
// =============================================================================

/**
 * Match a geocoded location to Nepal's official administrative data.
 * 
 * WHAT IT DOES:
 * The geocoding API (OpenStreetMap) returns location names as text.
 * But our database uses official Nepal government codes (like 11107 for Damak).
 * This function finds the matching codes for province, district, and municipality.
 * 
 * HOW IT WORKS:
 * 1. Searches all provinces for a name match
 * 2. If found, searches districts within that province
 * 3. If found, searches municipalities within that district
 * 4. Returns the matching codes for each level
 * 
 * @param {Object} geocodedLocation - Location object from getLocationFromCoordinates()
 * @param {string} language - 'en' for English or 'np' for Nepali names
 * @returns {Object} Object with provinceId, districtId, municipalityId
 * 
 * EXAMPLE:
 *   const geocoded = { province: "Province 1", district: "Jhapa", municipality: "Damak" };
 *   const matched = matchLocationToNepalData(geocoded);
 *   // Returns: { provinceId: 1, districtId: 111, municipalityId: 11107 }
 */
export function matchLocationToNepalData(geocodedLocation, language) {
  // Set default language to English if not provided
  if (!language) {
    language = 'en';
  }
  
  // Initialize result with null values
  // These will be filled in as we find matches
  const result = {
    provinceId: null,
    districtId: null,
    municipalityId: null
  };
  
  // Return empty result if no geocoded location provided
  if (!geocodedLocation) {
    return result;
  }
  
  // Determine which name field to use (English or Nepali)
  let nameKey = 'name';
  if (language === 'np') {
    nameKey = 'nameNp';
  }
  
  // Get all provinces
  const provinces = getProvinces();
  
  // -------------------------------------------------------------------------
  // STEP 1: Find matching province
  // -------------------------------------------------------------------------
  let matchedProvince = null;
  
  // Loop through all provinces to find a match
  for (let i = 0; i < provinces.length; i++) {
    const province = provinces[i];
    
    // Skip if geocoded location doesn't have province info
    if (!geocodedLocation.province) {
      continue;
    }
    
    // Convert both names to lowercase for case-insensitive comparison
    const provinceName = province[nameKey].toLowerCase();
    const geocodedProvinceName = geocodedLocation.province.toLowerCase();
    
    // Check if either name contains the other
    // This handles partial matches like "Province 1" vs "Province No. 1"
    const provinceContainsGeocoded = provinceName.includes(geocodedProvinceName);
    const geocodedContainsProvince = geocodedProvinceName.includes(provinceName);
    
    if (provinceContainsGeocoded || geocodedContainsProvince) {
      matchedProvince = province;
      break;  // Stop searching once we find a match
    }
  }
  
  // If no province match found, return empty result
  if (!matchedProvince) {
    return result;
  }
  
  // Save the matched province ID
  result.provinceId = matchedProvince.id;
  
  // -------------------------------------------------------------------------
  // STEP 2: Find matching district within the matched province
  // -------------------------------------------------------------------------
  const districts = getDistricts(matchedProvince.id);
  let matchedDistrict = null;
  
  // Loop through all districts to find a match
  for (let i = 0; i < districts.length; i++) {
    const district = districts[i];
    
    // Skip if geocoded location doesn't have district info
    if (!geocodedLocation.district) {
      continue;
    }
    
    // Convert both names to lowercase for comparison
    const districtName = district[nameKey].toLowerCase();
    const geocodedDistrictName = geocodedLocation.district.toLowerCase();
    
    // Check if either name contains the other
    const districtContainsGeocoded = districtName.includes(geocodedDistrictName);
    const geocodedContainsDistrict = geocodedDistrictName.includes(districtName);
    
    if (districtContainsGeocoded || geocodedContainsDistrict) {
      matchedDistrict = district;
      break;
    }
  }
  
  // If no district match found, return result with just province
  if (!matchedDistrict) {
    return result;
  }
  
  // Save the matched district ID
  result.districtId = matchedDistrict.id;
  
  // -------------------------------------------------------------------------
  // STEP 3: Find matching municipality within the matched district
  // -------------------------------------------------------------------------
  const municipalities = getMunicipalities(matchedDistrict.id);
  let matchedMunicipality = null;
  
  // Loop through all municipalities to find a match
  for (let i = 0; i < municipalities.length; i++) {
    const municipality = municipalities[i];
    
    // Skip if geocoded location doesn't have municipality info
    if (!geocodedLocation.municipality) {
      continue;
    }
    
    // Convert both names to lowercase for comparison
    const municipalityName = municipality[nameKey].toLowerCase();
    const geocodedMunicipalityName = geocodedLocation.municipality.toLowerCase();
    
    // Check if either name contains the other
    const municipalityContainsGeocoded = municipalityName.includes(geocodedMunicipalityName);
    const geocodedContainsMunicipality = geocodedMunicipalityName.includes(municipalityName);
    
    if (municipalityContainsGeocoded || geocodedContainsMunicipality) {
      matchedMunicipality = municipality;
      break;
    }
  }
  
  // If municipality match found, save the ID
  if (matchedMunicipality) {
    result.municipalityId = matchedMunicipality.id;
  }
  
  // Return the result with all matched IDs
  return result;
}

// =============================================================================
// GET CURRENT LOCATION (Using Browser's GPS)
// =============================================================================

/**
 * Get the user's current location using the browser's Geolocation API.
 * 
 * WHAT IT DOES:
 * 1. Asks the browser for GPS coordinates
 * 2. Converts coordinates to an address (reverse geocoding)
 * 3. Matches the address to Nepal's official administrative codes
 * 4. Returns everything in one convenient object
 * 
 * BROWSER PERMISSION:
 * The first time this runs, the browser will ask the user:
 * "This site wants to know your location. Allow / Block?"
 * 
 * If the user clicks "Block", this function will throw an error.
 * 
 * @returns {Promise<Object>} Location data with coordinates and matched IDs
 * 
 * EXAMPLE:
 *   try {
 *     const location = await getCurrentLocation();
 *     console.log(location.coordinates);  // { latitude: 26.6619, longitude: 87.6909 }
 *     console.log(location.matched);      // { provinceId: 1, districtId: 111, municipalityId: 11107 }
 *   } catch (error) {
 *     console.log('Could not get location:', error.message);
 *   }
 * 
 * RETURN VALUE:
 * {
 *   coordinates: { latitude, longitude },
 *   geocoded: { province, district, municipality, ward, fullAddress },
 *   matched: { provinceId, districtId, municipalityId },
 *   success: true/false,
 *   error: "error message" (only if success is false)
 * }
 */
export function getCurrentLocation() {
  // We wrap everything in a Promise because geolocation is asynchronous
  // (it takes time for the browser to get GPS coordinates)
  
  return new Promise(function(resolve, reject) {
    
    // -------------------------------------------------------------------------
    // STEP 1: Check if browser supports geolocation
    // -------------------------------------------------------------------------
    if (!navigator.geolocation) {
      // Old browsers don't have geolocation API
      const error = new Error('Geolocation is not supported by your browser');
      reject(error);
      return;
    }
    
    // -------------------------------------------------------------------------
    // STEP 2: Configure geolocation options
    // -------------------------------------------------------------------------
    const geolocationOptions = {
      // enableHighAccuracy: Use GPS if available (more accurate but uses more battery)
      enableHighAccuracy: true,
      
      // timeout: Maximum time to wait for location (10 seconds)
      timeout: 10000,
      
      // maximumAge: Don't use cached location (always get fresh coordinates)
      maximumAge: 0
    };
    
    // -------------------------------------------------------------------------
    // STEP 3: Request location from browser
    // -------------------------------------------------------------------------
    // getCurrentPosition takes 3 arguments:
    // 1. Success callback - called when location is found
    // 2. Error callback - called when location fails
    // 3. Options object - configuration
    
    navigator.geolocation.getCurrentPosition(
      
      // SUCCESS CALLBACK: Called when browser gets the location
      async function(position) {
        // Extract latitude and longitude from the position object
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        try {
          // ---------------------------------------------------------------
          // STEP 4: Convert coordinates to address (reverse geocoding)
          // ---------------------------------------------------------------
          const geocodedLocation = await getLocationFromCoordinates(latitude, longitude);
          
          // ---------------------------------------------------------------
          // STEP 5: Match address to Nepal administrative codes
          // ---------------------------------------------------------------
          const matchedIds = matchLocationToNepalData(geocodedLocation);
          
          // ---------------------------------------------------------------
          // STEP 6: Return the complete location data
          // ---------------------------------------------------------------
          const result = {
            coordinates: {
              latitude: latitude,
              longitude: longitude
            },
            geocoded: geocodedLocation,
            matched: matchedIds,
            success: true
          };
          
          resolve(result);
          
        } catch (error) {
          // Geocoding failed, but we still have coordinates
          // Return partial data with success = false
          const result = {
            coordinates: {
              latitude: latitude,
              longitude: longitude
            },
            geocoded: null,
            matched: {
              provinceId: null,
              districtId: null,
              municipalityId: null
            },
            success: false,
            error: error.message
          };
          
          resolve(result);
        }
      },
      
      // ERROR CALLBACK: Called when browser can't get location
      function(error) {
        // Create a user-friendly error message based on the error code
        let errorMessage = 'Unable to retrieve your location';
        
        // Check which specific error occurred
        if (error.code === error.PERMISSION_DENIED) {
          // User clicked "Block" when asked for permission
          errorMessage = 'Location permission denied. Please enable location access.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          // GPS signal lost or device doesn't have GPS
          errorMessage = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          // Took too long to get location (more than 10 seconds)
          errorMessage = 'Location request timed out.';
        }
        
        // Reject the promise with the error
        const locationError = new Error(errorMessage);
        reject(locationError);
      },
      
      // OPTIONS: Configuration for geolocation
      geolocationOptions
    );
  });
}
