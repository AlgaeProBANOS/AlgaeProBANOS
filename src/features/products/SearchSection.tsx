import AgricultureIcon from '@mui/icons-material/Agriculture';
import AppsIcon from '@mui/icons-material/Apps';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import FactoryIcon from '@mui/icons-material/Factory';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ParkIcon from '@mui/icons-material/Park';
import PublicIcon from '@mui/icons-material/Public';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import RoomIcon from '@mui/icons-material/Room';
import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  Paper,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type L from 'leaflet'; // Import Leaflet type
import type React from 'react';
import { useEffect, useRef, useState } from 'react';

import type { MapSectionHandle } from './MapSection';
// import MapSection from './MapSection';
import { useRouter } from 'next/router';

// --- Constants for Map View Control ---
const DEFAULT_CENTER: L.LatLngTuple = [54, 15]; // Europe overview
const DEFAULT_ZOOM = 3; // Adjusted to match initial refresh zoom

// Coordinates and zoom levels for countries (Add more as needed)
const countryCoordinates: { [key: string]: { center: L.LatLngTuple; zoom: number } } = {
  // Example entries - replace with accurate data
  Germany: { center: [51.1657, 10.4515], zoom: 6 },
  France: { center: [46.6034, 1.8883], zoom: 6 },
  'United Kingdom': { center: [55.3781, -3.436], zoom: 5 },
  Spain: { center: [40.4637, -3.7492], zoom: 6 },
  Italy: { center: [41.8719, 12.5674], zoom: 6 },
  Norway: { center: [60.472, 8.4689], zoom: 5 },
  Sweden: { center: [60.1282, 18.6435], zoom: 5 },
  Finland: { center: [61.9241, 25.7482], zoom: 5 },
  Poland: { center: [51.9194, 19.1451], zoom: 6 },
  Denmark: { center: [56.2639, 9.5018], zoom: 7 },
  Netherlands: { center: [52.1326, 5.2913], zoom: 7 },
  Belgium: { center: [50.5039, 4.4699], zoom: 8 },
  Ireland: { center: [53.4129, -8.2439], zoom: 7 },
  Portugal: { center: [39.3999, -8.2245], zoom: 7 },
  Greece: { center: [39.0742, 21.8243], zoom: 7 },
  Croatia: { center: [45.1, 15.2], zoom: 7 },
  Estonia: { center: [58.5953, 25.0136], zoom: 7 },
  Latvia: { center: [56.8796, 24.6032], zoom: 7 },
  Lithuania: { center: [55.1694, 23.8813], zoom: 7 },
  Iceland: { center: [64.9631, -19.0208], zoom: 5 },
  Albania: { center: [41.1533, 20.1683], zoom: 8 },
  'Bosnia and Herzegovina': { center: [43.9159, 17.6791], zoom: 8 },
  Cyprus: { center: [35.1264, 33.4299], zoom: 9 },
  Malta: { center: [35.9375, 14.3754], zoom: 11 },
  Monaco: { center: [43.7384, 7.4246], zoom: 13 },
  Montenegro: { center: [42.7087, 19.3744], zoom: 9 },
  Slovenia: { center: [46.1512, 14.9955], zoom: 8 },
  Turkey: { center: [38.9637, 35.2433], zoom: 6 },
  Russia: { center: [61.524, 105.3188], zoom: 3 }, // Very large, low zoom
};

// Coordinates and zoom levels for regions
const regionCoordinates: { [key: string]: { center: L.LatLngTuple; zoom: number } } = {
  'North Sea': { center: [55.0, 3.0], zoom: 6 },
  'Baltic Sea': { center: [58.0, 20.0], zoom: 6 },
  Mediterranean: { center: [38.0, 15.0], zoom: 5 },
  'British Isles & Ireland': { center: [54.5, -4.5], zoom: 6 },
  'Adriatic Sea': { center: [43.0, 16.0], zoom: 7 },
  'White Sea': { center: [65.5, 37.5], zoom: 6 },
  'North Atlantic': { center: [45.0, -20.0], zoom: 4 }, // Wider view for N. Atlantic
};

// Define which countries belong to each region (MUST match button labels/Autocomplete options exactly)
const regionCountries: { [key: string]: Array<string> } = {
  'North Sea': [
    'Belgium',
    'Denmark',
    'France',
    'Germany',
    'Netherlands',
    'Norway',
    'United Kingdom',
  ],
  'Baltic Sea': [
    'Denmark',
    'Estonia',
    'Finland',
    'Germany',
    'Latvia',
    'Lithuania',
    'Poland',
    'Russia',
    'Sweden',
  ],
  Mediterranean: [
    'Albania',
    'Bosnia and Herzegovina',
    'Croatia',
    'Cyprus',
    'France',
    'Greece',
    'Italy',
    'Malta',
    'Monaco',
    'Montenegro',
    'Slovenia',
    'Spain',
    'Turkey',
  ],
  'British Isles & Ireland': ['Ireland', 'United Kingdom'],
  'Adriatic Sea': [
    'Albania',
    'Bosnia and Herzegovina',
    'Croatia',
    'Italy',
    'Montenegro',
    'Slovenia',
  ],
  'White Sea': ['Russia'],
  'North Atlantic': [
    'Belgium',
    'Denmark',
    'France',
    'Germany',
    'Iceland',
    'Ireland',
    'Netherlands',
    'Norway',
    'Portugal',
    'Spain',
    'United Kingdom',
  ],
};

// Application categories with their descriptions
const applicationCategories = [
  {
    key: 'industrial',
    title: 'Industrial',
    description: 'Industrial applications and processes',
    color: '#2196f3',
    icon: FactoryIcon,
  },
  {
    key: 'agriculture',
    title: 'Agriculture',
    description: 'Agricultural and farming uses',
    color: '#4caf50',
    icon: AgricultureIcon,
  },
  {
    key: 'medicinal',
    title: 'Medicinal',
    description: 'Medical and pharmaceutical applications',
    color: '#f44336',
    icon: MedicalServicesIcon,
  },
  {
    key: 'cosmetics',
    title: 'Cosmetics',
    description: 'Beauty and personal care products',
    color: '#e91e63',
    icon: FaceRetouchingNaturalIcon,
  },
  {
    key: 'environmental',
    title: 'Environmental',
    description: 'Environmental solutions and applications',
    color: '#009688',
    icon: ParkIcon,
  },
  {
    key: 'humanConsumption',
    title: 'Human Consumption',
    description: 'Food and nutritional products',
    color: '#ff9800',
    icon: RestaurantIcon,
  },
];

// Add this color mapping object after the applicationCategories constant
const colorMap = {
  'blue-green': '#00CEC8', // Updated blue-green color
  brown: '#795548',
  red: '#d32f2f',
  green: '#2e7d32',
  // Add other colors as needed
};

// Export interfaces
export interface Applications {
  industrial: string | null;
  agriculture: string | null;
  medicinal: string | null;
  cosmetics: string | null;
  environmental: string | null;
  humanConsumption: string | null;
}

export interface Risks {
  medicinalHealth: string | null;
  flavorDiet: string | null;
  other: string | null;
}

export interface Certifications {
  onMarket: boolean;
  inNovelFoodCatalogue: boolean;
  inUnionNovelFoodList: boolean;
  canBeGrownInPolyculture: boolean;
}

export interface AlgaeData {
  species: string;
  commonName: string;
  color: string;
  division: string;
  microMacro: string;
  waterType: string;
  geographicPosition: string;
  habitat: string;
  invasive: string;
  waterTemp: string;
  optimalTemp: string;
  salinity: string;
  depthRange: string;
  applications: Applications | null;
  risks: Risks | null;
  certifications: Certifications;
  companiesAndProducts?: string;
  nutritionalProfile?: string;

  // EMODnet specific fields
  emodnet_points?: Array<any>;
  match_score?: number;
  match_name?: string;
  preprocessed_name?: string; // Keep if useful for debugging EMODnet
  base_name?: string; // Keep if useful for debugging EMODnet

  // GBIF specific fields
  gbif_points?: Array<any>;

  // Data source indicator
  dataSource?: 'emodnet' | 'gbif';

  // Recommendation specific fields (keep separate)
  recommendation?: ProductRecommendation;
}

// Add new interface for product recommendations
interface ProductRecommendation {
  matchScore: number;
  matchReasons: Array<string>;
  cultivationInfo: Array<string>;
  regionalConstraints: Array<string>;
  scalabilityInfo: Array<string>;
  nutritionalProfile?: string;
}

interface AlgaeDataWithRecommendation extends AlgaeData {
  recommendation?: ProductRecommendation;
}

function SearchSection() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<AlgaeDataWithRecommendation>>([]);
  const [mapData, setMapData] = useState<Array<AlgaeData>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [productQuery, setProductQuery] = useState('');
  const [filters, setFilters] = useState<Certifications>({
    onMarket: false,
    inNovelFoodCatalogue: false,
    inUnionNovelFoodList: false,
    canBeGrownInPolyculture: false,
  });
  const [searchMode, setSearchMode] = useState<'general' | 'product'>('general');
  const [countries, setCountries] = useState<Array<string>>([]);
  const [selectedCountries, setSelectedCountries] = useState<Array<string>>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [mapDataSource, setMapDataSource] = useState<'emodnet' | 'gbif'>('emodnet');
  const [mapIsLoading, setMapIsLoading] = useState<boolean>(false);
  const mapRef = useRef<MapSectionHandle>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [activeRightPanelTab, setActiveRightPanelTab] = useState<'search' | 'browse'>('search');

  // --- State for Map View Control ---
  const [mapCenter, setMapCenter] = useState<L.LatLngTuple>(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState<number>(DEFAULT_ZOOM);

  // Fetch available countries on component mount
  useEffect(() => {
    const fetchCountries = async () => {
      setCountriesLoading(true);
      try {
        const response = await fetch('/api/countries');
        if (!response.ok) {
          throw new Error('Failed to fetch countries');
        }
        const data = await response.json();
        setCountries(data);
      } catch (err) {
        console.error('Error fetching countries:', err);
      } finally {
        setCountriesLoading(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch results based on search query or selected application
  useEffect(() => {
    // Debounce mechanism
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      // Fetch main search results (list view)
      fetchSearchResults();
      // Fetch map data (now potentially separate or triggered differently)
      // We trigger map fetch based on search results change OR mapDataSource change
      // fetchMapData(); // Remove direct call from here? See below.
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // Depend on searchQuery, selectedApplication, filters, searchMode
    // Do NOT depend on mapDataSource here, it triggers its own fetch
  }, [searchQuery, selectedApplication, filters, searchMode, selectedCountries]);

  // --- Fetch MAP data when list results OR map-specific controls change ---
  useEffect(() => {
    // Only fetch map data if there are results or country filters active,
    // otherwise, the fetchMapData function clears the map anyway.
    if (searchResults.length > 0 || selectedCountries.length > 0) {
      console.log(
        'Triggering map fetch due to searchResults, selectedCountries, or mapDataSource change.',
      );
      fetchMapData();
    } else {
      // Explicitly clear map data if there are no results and no country filters
      // This handles cases like clearing the search query
      setMapData([]);
    }
  }, [searchResults, selectedCountries, mapDataSource]);

  // --- Effect to control map zoom/center based on country selection ---
  useEffect(() => {
    if (selectedCountries.length === 1) {
      // Single country selected
      const countryName = selectedCountries[0];
      const countryData = countryCoordinates[countryName];
      if (countryData) {
        setMapCenter(countryData.center);
        setMapZoom(countryData.zoom);
      } else {
        // Country not found in our data, reset view
        setMapCenter(DEFAULT_CENTER);
        setMapZoom(DEFAULT_ZOOM);
      }
    } else if (selectedCountries.length > 1) {
      // Multiple countries selected - check if it matches a region
      let matchedRegion = null;
      const selectedSet = new Set(selectedCountries.slice().sort()); // Use sorted set for comparison

      for (const regionName in regionCountries) {
        const regionSet = new Set(regionCountries[regionName].slice().sort());
        if (
          selectedSet.size === regionSet.size &&
          Array.from(selectedSet).every((country) => {
            return regionSet.has(country);
          })
        ) {
          matchedRegion = regionName;
          break;
        }
      }

      if (matchedRegion && regionCoordinates[matchedRegion]) {
        // Matched a region
        setMapCenter(regionCoordinates[matchedRegion].center);
        setMapZoom(regionCoordinates[matchedRegion].zoom);
      } else {
        // Multiple individual countries selected, reset view
        setMapCenter(DEFAULT_CENTER);
        setMapZoom(DEFAULT_ZOOM);
      }
    } else {
      // No countries selected, reset view
      setMapCenter(DEFAULT_CENTER);
      setMapZoom(DEFAULT_ZOOM);
    }
  }, [selectedCountries]);

  // --- Fetch Search Results (List) Function ---
  const fetchSearchResults = async () => {
    // Check if fetching is necessary (based on general/product mode logic)
    const isGeneralSearch = searchMode === 'general' && (searchQuery.trim() || selectedApplication);
    const isProductSearch = searchMode === 'product' && searchQuery.trim();

    if (!isGeneralSearch && !isProductSearch) {
      setSearchResults([]); // Clear results if no query/app
      // Also clear map data? Maybe, depends on desired behavior
      // setMapData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      if (searchMode === 'general') {
        if (searchQuery.trim()) {
          queryParams.append('q', searchQuery);
        }
        if (selectedApplication) {
          queryParams.append('application', selectedApplication);
        }
      } else {
        // Product search mode
        queryParams.append('product', searchQuery); // Using 'q' as product query based on prev logic?
        // If backend expects 'product', use queryParams.append('product', searchQuery);
      }

      // NOTE: Main search does NOT use country filter based on previous analysis
      // selectedCountries.forEach(country => {
      //   queryParams.append('countries', country);
      // });

      // CRUCIAL: Add the selected data source
      queryParams.append('dataSource', mapDataSource);

      // --- Add active certification filters ---
      if (searchMode === 'general') {
        // Only apply cert filters in general search mode
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            // Only send filters that are active (true)
            queryParams.append(key, 'true');
          }
        });
      }

      const url = `/api/search?${queryParams.toString()}`;
      console.log('Fetching Search Results from URL:', url);

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }
      let data = await response.json();

      // Apply client-side certification filters ONLY in general mode
      if (searchMode === 'general') {
        data = data.filter((algae: AlgaeData) => {
          return Object.entries(filters).every(([key, value]) => {
            return !value || (algae.certifications as any)[key as keyof Certifications];
          });
        });
      }

      setSearchResults(data);
    } catch (err: any) {
      console.error('Error fetching search results:', err);
      setError('Failed to fetch results. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fetch Map Data Function (Update loading state) ---
  const fetchMapData = async () => {
    if (searchResults.length === 0 && selectedCountries.length === 0) {
      setMapData([]);
      return;
    }

    setMapIsLoading(true); // Set loading true before fetch
    // setError(null); // Reset error if needed

    try {
      const queryParams = new URLSearchParams();

      // Pass the current search query and application/product context
      if (searchMode === 'general') {
        if (searchQuery.trim()) queryParams.append('q', searchQuery);
        if (selectedApplication) queryParams.append('application', selectedApplication);
      } else {
        // searchMode === 'product'
        if (searchQuery.trim()) {
          // Add the product query parameter for the map endpoint
          queryParams.append('product', searchQuery);
        }
      }

      // Add selected countries
      selectedCountries.forEach((country) => {
        queryParams.append('countries', country);
      });

      // CRUCIAL: Add the selected data source
      queryParams.append('dataSource', mapDataSource);

      // --- Add active certification filters ---
      if (searchMode === 'general') {
        // Only apply cert filters in general search mode
        Object.entries(filters).forEach(([key, value]) => {
          if (value) {
            // Only send filters that are active (true)
            queryParams.append(key, 'true');
          }
        });
      }

      const mapUrl = `/api/map-data?${queryParams.toString()}`;
      console.log('Fetching MAP Data from URL:', mapUrl);

      const response = await fetch(mapUrl);
      if (!response.ok) {
        const errorData = await response.json().catch(() => {
          return { message: 'Failed to fetch map data' };
        });
        throw new Error(errorData.message || 'Failed to fetch map data');
      }
      const data = await response.json();
      setMapData(data);
    } catch (err: any) {
      console.error('Error fetching map data:', err);
      // setError('Failed to fetch map data. Please try again.');
      setMapData([]);
    } finally {
      setMapIsLoading(false); // Set loading false after fetch completes or fails
    }
  };

  const handleApplicationSelect = (applicationKey: string) => {
    if (selectedApplication === applicationKey) {
      setSelectedApplication(null);
      // Clear map data and fetch empty data when deselecting an application
      setMapData([]);
      // Reset search results to empty
      setSearchResults([]);
    } else {
      setSelectedApplication(applicationKey);
      setSearchQuery(''); // Clear search query when selecting an application
      setMapData([]); // Clear existing map data first to avoid duplicate markers

      // Fetch map data for the selected application
      const fetchApplicationMapData = async () => {
        try {
          const queryParams = new URLSearchParams();
          queryParams.append('application', applicationKey);

          // Add selected countries to query params
          selectedCountries.forEach((country) => {
            queryParams.append('countries', country);
          });

          const mapUrl = `/api/map-data?${queryParams.toString()}`;
          console.log('Fetching application map data from URL:', mapUrl);

          const mapResponse = await fetch(mapUrl);
          if (!mapResponse.ok) {
            throw new Error('Failed to fetch application map data');
          }

          const mapData = await mapResponse.json();
          console.log('Application map data fetched:', mapData.length, 'entries');
          setMapData(mapData);
        } catch (err) {
          console.error('Error fetching application map data:', err);
          setMapData([]);
        }
      };

      fetchApplicationMapData();
    }
  };

  const handleFilterChange = (filterName: keyof Certifications) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => {
        return {
          ...prev,
          [filterName]: event.target.checked,
        };
      });
    };
  };

  const renderApplications = (applications: Applications | null) => {
    if (!applications) return null;

    return Object.entries(applications)
      .filter(([_, value]) => {
        return value !== null;
      })
      .map(([key, value]) => {
        return (
          <Typography key={key} variant="body2" sx={{ mt: 1 }}>
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
          </Typography>
        );
      });
  };

  const renderRisks = (risks: Risks | null) => {
    if (!risks) return null;

    return Object.entries(risks)
      .filter(([_, value]) => {
        return value !== null;
      })
      .map(([key, value]) => {
        return (
          <Typography key={key} variant="body2" sx={{ mt: 1 }}>
            <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}
          </Typography>
        );
      });
  };

  const handleLocationClick = (index: number) => {
    if (mapRef.current) {
      console.log(`Attempting to open popup for algae at index ${index}`);

      // Get the selected species from search results
      const searchItem = searchResults[index];
      if (!searchItem) {
        console.error('No search result at index', index);
        return;
      }

      console.log(`Looking for species "${searchItem.species}" in map data`);

      // Only find exact species matches in map data
      if (mapData && mapData.length > 0) {
        const mapIndex = mapData.findIndex((item) => {
          return item.species === searchItem.species;
        });

        if (mapIndex !== -1) {
          console.log(`Found exact match at mapData index ${mapIndex}`);
          mapRef.current.openPopup(mapIndex, 0);
        } else {
          console.log('No exact match found for this species');
        }
      } else {
        console.log('No map data available');
      }
    }
  };

  // Function to navigate to algae details page
  const handleViewDetails = (species: string) => {
    void router.push(`/algae/${encodeURIComponent(species)}`);
  };

  // Add renderProductResults function
  const renderProductResults = (result: AlgaeDataWithRecommendation) => {
    if (!result.recommendation) return null;

    return (
      <Card
        sx={{
          mb: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            transition: 'box-shadow 0.3s ease-in-out',
          },
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    color:
                      result.color.toLowerCase() === 'blue-green'
                        ? colorMap['blue-green']
                        : result.color.toLowerCase(),
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {result.species}
                </Typography>
                <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  gutterBottom
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                  }}
                >
                  {result.commonName}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {/* Fixed conditional rendering for Tooltip */}
                {algaeExistsOnMap(result.species) ? (
                  <Tooltip title="Show location on map">
                    <IconButton
                      size="small"
                      onClick={() => {
                        return handleLocationClick(searchResults.indexOf(result));
                      }}
                      sx={{
                        color: '#1a4c59',
                        bgcolor: 'rgba(26, 76, 89, 0.1)',
                        '&:hover': {
                          bgcolor: 'rgba(26, 76, 89, 0.2)',
                        },
                      }}
                    >
                      <RoomIcon />
                    </IconButton>
                  </Tooltip>
                ) : null}
                <Tooltip title="View full details">
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      return handleViewDetails(result.species);
                    }}
                    sx={{
                      color: '#1a4c59',
                      borderColor: '#1a4c59',
                      '&:hover': {
                        backgroundColor: 'rgba(26, 76, 89, 0.08)',
                        borderColor: '#1a4c59',
                      },
                    }}
                  >
                    Read More
                  </Button>
                </Tooltip>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(26, 76, 89, 0.05)',
                  border: '1px solid',
                  borderColor: 'rgba(26, 76, 89, 0.1)',
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: '#1a4c59',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  Why this species is recommended:
                </Typography>
                {result.recommendation.matchReasons.map((reason, index) => {
                  return (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        mb: 0.5,
                      }}
                    >
                      • {reason}
                    </Typography>
                  );
                })}
              </Box>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(26, 76, 89, 0.05)',
                  border: '1px solid',
                  borderColor: 'rgba(26, 76, 89, 0.1)',
                  mb: 2,
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: '"Poppins", sans-serif',
                    color: '#1a4c59',
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  Cultivation Requirements:
                </Typography>
                {result.recommendation.cultivationInfo.map((info, index) => {
                  return (
                    <Typography
                      key={index}
                      variant="body2"
                      sx={{
                        fontFamily: '"Poppins", sans-serif',
                        mb: 0.5,
                      }}
                    >
                      • {info}
                    </Typography>
                  );
                })}
              </Box>

              {result.recommendation.nutritionalProfile && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'rgba(26, 76, 89, 0.05)',
                    border: '1px solid',
                    borderColor: 'rgba(26, 76, 89, 0.1)',
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: '#1a4c59',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Nutritional Profile:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {result.recommendation.nutritionalProfile}
                  </Typography>
                </Box>
              )}

              {result.companiesAndProducts && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'rgba(103, 58, 183, 0.05)',
                    border: '1px solid',
                    borderColor: 'rgba(103, 58, 183, 0.1)',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: '#673ab7',
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Companies & Products:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      whiteSpace: 'pre-line',
                    }}
                  >
                    {result.companiesAndProducts}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Function to check if an algae species exists in mapData
  const algaeExistsOnMap = (species: string): boolean => {
    if (!mapData || mapData.length === 0) return false;

    // Only check for direct species matches
    return mapData.some((item) => {
      return item.species === species;
    });

    // Remove the genus-level matching to prevent showing location icons
    // for species that don't have their own markers
  };

  // --- Handler for Map Data Source Toggle (Stays here) ---
  const handleDataSourceChange = (
    event: React.MouseEvent<HTMLElement>,
    newDataSource: 'emodnet' | 'gbif' | null,
  ) => {
    if (newDataSource !== null) {
      console.log('Map data source changed to:', newDataSource);
      setMapDataSource(newDataSource);
    }
  };

  // Handle switching between Search and Browse Applications tabs in the right panel
  const handleRightPanelTabChange = (
    event: React.SyntheticEvent,
    newValue: 'search' | 'browse',
  ) => {
    setActiveRightPanelTab(newValue);
    // Optionally clear search/results when switching, if desired
    // if (newValue === 'browse') {
    //   setSearchQuery('');
    //   setSearchResults([]);
    // } else {
    //   setSelectedApplication(null);
    //   setSearchResults([]); // Or refetch based on current query?
    // }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh', // Ensure it's at least viewport height
        display: 'flex', // Use flexbox for layout
        flexDirection: 'column', // Stack children vertically (Header, then Content Grid)
        bgcolor: '#f5f7f7',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#1a4c59',
          color: 'white',
          py: 4,
          mb: 4,
          borderRadius: 0,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              fontWeight: 600,
              color: '#ffffff',
              mb: 1,
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Algea Pro BANOS Dashboard
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            align="center"
            sx={{
              color: '#88c5d3',
              fontWeight: 400,
              fontFamily: '"Poppins", sans-serif',
            }}
          >
            Algae Products Database
          </Typography>
        </Container>
      </Paper>

      <Container
        maxWidth="xl"
        sx={{
          mb: 4,
          position: 'relative',
          zIndex: 1,
          flexGrow: 1, // Allow container to fill remaining vertical space
          display: 'flex', // Use flex for internal grid stretching
          flexDirection: 'column', // Stack grid vertically
        }}
      >
        <Grid
          container
          spacing={2}
          sx={{ alignItems: 'flex-start', flexGrow: 1 /* Allow grid to fill container */ }}
        >
          {/* Left side - Map */}
          <Grid item xs={12} md={8} sx={{ overflow: 'hidden' }}>
            {' '}
            {/* Map takes ~67% width */}
            {/* <MapSection
              ref={mapRef}
              algaeData={mapData}
              dataSource={mapDataSource}
              onDataSourceChange={handleDataSourceChange}
              mapIsLoading={mapIsLoading}
              center={mapCenter}
              zoom={mapZoom}
            /> */}
          </Grid>

          {/* Right side - Search / Browse Applications and Results */}
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column' }}>
            {' '}
            {/* Search takes ~33% width */}
            <Paper
              sx={{
                p: 2,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              {/* Tabs to switch between Search and Browse Applications */}
              <Tabs
                value={activeRightPanelTab}
                onChange={handleRightPanelTabChange}
                indicatorColor="primary"
                textColor="primary"
                variant="fullWidth"
                sx={{
                  mb: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  '& .MuiTabs-indicator': {
                    backgroundColor: '#1a4c59',
                  },
                }}
              >
                <Tab
                  icon={<SearchIcon />}
                  iconPosition="start"
                  label="Search"
                  value="search"
                  sx={{
                    textTransform: 'none',
                    fontFamily: '"Poppins", sans-serif',
                    color: activeRightPanelTab === 'search' ? '#1a4c59' : 'text.secondary',
                    '&.Mui-selected': {
                      // Ensure selected style overrides default
                      color: '#1a4c59',
                      fontWeight: 600,
                    },
                  }}
                />
                <Tab
                  icon={<AppsIcon />}
                  iconPosition="start"
                  label="Browse Applications"
                  value="browse"
                  sx={{
                    textTransform: 'none',
                    fontFamily: '"Poppins", sans-serif',
                    color: activeRightPanelTab === 'browse' ? '#1a4c59' : 'text.secondary',
                    '&.Mui-selected': {
                      // Ensure selected style overrides default
                      color: '#1a4c59',
                      fontWeight: 600,
                    },
                  }}
                />
              </Tabs>

              {/* Conditional Rendering based on active tab */}
              {activeRightPanelTab === 'search' && (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}
                >
                  {' '}
                  {/* Search container takes remaining space */}
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, mb: 2 }}
                  >
                    <Tabs
                      value={searchMode}
                      onChange={(_, newValue) => {
                        setSearchMode(newValue);
                        setSearchQuery(''); // Clear search when switching modes
                        // Clear results immediately when switching search modes
                        setSearchResults([]);
                        setMapData([]);
                      }}
                      sx={{
                        minHeight: '36px',
                        mb: 2,
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#1a4c59',
                        },
                        '& .MuiTab-root': {
                          minHeight: '36px',
                          textTransform: 'none',
                          fontSize: '0.875rem',
                          fontFamily: '"Poppins", sans-serif',
                          color: 'text.secondary',
                          '&.Mui-selected': {
                            color: '#1a4c59',
                          },
                        },
                      }}
                    >
                      <Tab
                        label="General Search"
                        value="general"
                        sx={{
                          fontSize: '0.875rem',
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      />
                      <Tab
                        label="Find Algae for my Product"
                        value="product"
                        sx={{
                          fontSize: '0.875rem',
                          fontFamily: '"Poppins", sans-serif',
                        }}
                      />
                    </Tabs>
                    <TextField
                      fullWidth
                      size="small"
                      label={
                        searchMode === 'general'
                          ? 'Search by species, common name, or application'
                          : 'What product are you looking to create? (e.g., fish feed, biofuel)'
                      }
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        // Removed setSelectedApplication(null) here, handled by useEffect now
                      }}
                      variant="outlined"
                      disabled={isLoading}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&:hover fieldset': {
                            borderColor: '#1a4c59',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#1a4c59',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#1a4c59',
                        },
                      }}
                    />

                    {searchMode === 'general' && (
                      <FormGroup
                        row
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1.5,
                          ml: 0.5,
                          mt: 2,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={filters.onMarket}
                              onChange={handleFilterChange('onMarket')}
                              sx={{
                                '&.Mui-checked': {
                                  color: '#1a4c59',
                                },
                                '& .MuiSwitch-track': {
                                  backgroundColor: '#88c5d3',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{
                                color: filters.onMarket ? '#1a4c59' : 'text.secondary',
                                fontSize: '0.875rem',
                                transition: 'color 0.2s',
                                fontFamily: '"Poppins", sans-serif',
                                '&:hover': {
                                  color: '#1a4c59',
                                },
                              }}
                            >
                              Already on Market
                            </Typography>
                          }
                          sx={{
                            bgcolor: filters.onMarket ? 'rgba(26, 76, 89, 0.05)' : 'transparent',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(26, 76, 89, 0.05)',
                            },
                          }}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={filters.inNovelFoodCatalogue}
                              onChange={handleFilterChange('inNovelFoodCatalogue')}
                              sx={{
                                '&.Mui-checked': {
                                  color: '#1a4c59',
                                },
                                '& .MuiSwitch-track': {
                                  backgroundColor: '#88c5d3',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{
                                color: filters.inNovelFoodCatalogue ? '#1a4c59' : 'text.secondary',
                                fontSize: '0.875rem',
                                transition: 'color 0.2s',
                                fontFamily: '"Poppins", sans-serif',
                                '&:hover': {
                                  color: '#1a4c59',
                                },
                              }}
                            >
                              Listed in EU Novel Food Catalogue
                            </Typography>
                          }
                          sx={{
                            bgcolor: filters.inNovelFoodCatalogue
                              ? 'rgba(26, 76, 89, 0.05)'
                              : 'transparent',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(26, 76, 89, 0.05)',
                            },
                          }}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={filters.inUnionNovelFoodList}
                              onChange={handleFilterChange('inUnionNovelFoodList')}
                              sx={{
                                '&.Mui-checked': {
                                  color: '#1a4c59',
                                },
                                '& .MuiSwitch-track': {
                                  backgroundColor: '#88c5d3',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{
                                color: filters.inUnionNovelFoodList ? '#1a4c59' : 'text.secondary',
                                fontSize: '0.875rem',
                                transition: 'color 0.2s',
                                fontFamily: '"Poppins", sans-serif',
                                '&:hover': {
                                  color: '#1a4c59',
                                },
                              }}
                            >
                              Food Supplement at Union List
                            </Typography>
                          }
                          sx={{
                            bgcolor: filters.inUnionNovelFoodList
                              ? 'rgba(26, 76, 89, 0.05)'
                              : 'transparent',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(26, 76, 89, 0.05)',
                            },
                          }}
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              size="small"
                              checked={filters.canBeGrownInPolyculture}
                              onChange={handleFilterChange('canBeGrownInPolyculture')}
                              sx={{
                                '&.Mui-checked': {
                                  color: '#1a4c59',
                                },
                                '& .MuiSwitch-track': {
                                  backgroundColor: '#88c5d3',
                                },
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{
                                color: filters.canBeGrownInPolyculture
                                  ? '#1a4c59'
                                  : 'text.secondary',
                                fontSize: '0.875rem',
                                transition: 'color 0.2s',
                                fontFamily: '"Poppins", sans-serif',
                                '&:hover': {
                                  color: '#1a4c59',
                                },
                              }}
                            >
                              Can be Grown in Polyculture
                            </Typography>
                          }
                          sx={{
                            bgcolor: filters.canBeGrownInPolyculture
                              ? 'rgba(26, 76, 89, 0.05)'
                              : 'transparent',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            transition: 'background-color 0.2s',
                            '&:hover': {
                              bgcolor: 'rgba(26, 76, 89, 0.05)',
                            },
                          }}
                        />
                      </FormGroup>
                    )}
                  </Box>
                  {/* Intentionally empty - Results are now in the bottom panel */}
                </Box>
              )}

              {activeRightPanelTab === 'browse' && (
                <Box
                  sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}
                >
                  {' '}
                  {/* Browse container takes remaining space */}
                  {/* Moved "Browse by Application" Section Content */}
                  <Box sx={{ flexShrink: 0, mb: 2 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{
                        color: '#1a4c59',
                        mb: 2,
                        fontWeight: 500,
                        fontFamily: '"Poppins", sans-serif',
                      }}
                    >
                      {' '}
                      Select an Application Category{' '}
                    </Typography>
                    <Grid container spacing={2} sx={{}}>
                      {' '}
                      {/* Grid for App Cards */}
                      {applicationCategories.map((category) => {
                        /* Application Cards */
                        const Icon = category.icon;
                        const isSelected = selectedApplication === category.key;

                        return (
                          // Change grid item sizing to xs={6} for 2 columns
                          <Grid item xs={6} key={category.key}>
                            <Card
                              sx={{
                                cursor: 'pointer',
                                bgcolor: isSelected ? `${category.color}22` : 'white',
                                borderLeft: `4px solid ${category.color}`,
                                transition: 'all 0.3s ease',
                                height: '100%', // Keep height 100%
                                display: 'flex',
                                flexDirection: 'column',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)', // Softer shadow
                                '&:hover': {
                                  transform: 'translateY(-2px)',
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                },
                              }}
                              onClick={() => {
                                handleApplicationSelect(category.key);
                                // Optionally switch back to search tab after selection?
                                // setActiveRightPanelTab('search');
                              }}
                            >
                              <CardContent
                                sx={{
                                  flex: 1,
                                  display: 'flex',
                                  flexDirection: 'column',
                                  height: '100%', // Ensure content fills card
                                  p: 1.5, // Adjust padding for tighter space
                                }}
                              >
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    mb: 1,
                                  }}
                                >
                                  <Icon
                                    sx={{
                                      color: category.color,
                                      mr: 1,
                                      mt: '4px',
                                    }}
                                  />
                                  <Typography
                                    variant="subtitle1" // Adjusted from h6
                                    sx={{
                                      // fontSize: '1rem', // Adjusted font size
                                      lineHeight: 1.2,
                                      mt: '5px', // Keep margin?
                                      fontWeight: 500, // Slightly bolder title
                                      fontFamily: '"Poppins", sans-serif',
                                    }}
                                  >
                                    {category.title}
                                  </Typography>
                                </Box>
                                <Typography
                                  variant="caption" // Adjusted from body2
                                  color="text.secondary"
                                  sx={{
                                    mt: 'auto', // Pushes description down
                                    fontFamily: '"Poppins", sans-serif',
                                    // fontSize: '0.75rem' // Smaller font size
                                  }}
                                >
                                  {category.description}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </Box> // End of Browse tab content
              )}
              {/* Moved Country Filter Section (Now at Bottom) */}
              <Box
                sx={{
                  // Removed background/border styles
                  p: 2, // Standardize padding
                  borderRadius: 1,
                  mt: 2, // Keep margin top
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <PublicIcon sx={{ color: '#1a4c59' }} />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontFamily: '"Poppins", sans-serif',
                      color: '#1a4c59',
                      fontWeight: 600,
                    }}
                  >
                    Browse & Filter by Country
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{ mb: 1, display: 'block', color: 'text.secondary' }}
                >
                  Select one or more countries to see all available algae species in those regions.
                </Typography>

                <Autocomplete
                  multiple
                  id="countries-filter"
                  options={countries}
                  value={selectedCountries}
                  loading={countriesLoading}
                  renderInput={(params) => {
                    return (
                      <TextField
                        {...params}
                        variant="outlined"
                        label="Filter by country"
                        placeholder="Select countries"
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                              borderColor: '#1a4c59',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#1a4c59',
                            },
                          },
                          '& .MuiInputLabel-root.Mui-focused': {
                            color: '#1a4c59',
                          },
                        }}
                      />
                    );
                  }}
                  renderTags={(value, getTagProps) => {
                    return value.map((option, index) => {
                      return (
                        <Chip
                          label={option}
                          {...getTagProps({ index })}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(26, 76, 89, 0.1)',
                            color: '#1a4c59',
                            '& .MuiChip-deleteIcon': {
                              color: '#1a4c59',
                              '&:hover': {
                                color: '#9c3030',
                              },
                            },
                          }}
                        />
                      );
                    });
                  }}
                  onChange={(event, newValue) => {
                    setSelectedCountries(newValue);
                  }}
                  size="small"
                  sx={{ mb: 1 }}
                />

                {/* Quick Select Buttons for Regions */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mt: 1, mb: 1 }}>
                  <Typography
                    variant="caption"
                    sx={{ width: '100%', color: 'text.secondary', mb: 0.5 }}
                  >
                    Quick Select Regions:
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      return setSelectedCountries([
                        'Belgium',
                        'Denmark',
                        'France',
                        'Germany',
                        'Netherlands',
                        'Norway',
                        'United Kingdom',
                      ]);
                    }}
                    sx={quickSelectButtonStyle}
                  >
                    North Sea
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      return setSelectedCountries([
                        'Denmark',
                        'Estonia',
                        'Finland',
                        'Germany',
                        'Latvia',
                        'Lithuania',
                        'Poland',
                        'Russia',
                        'Sweden',
                      ]);
                    }}
                    sx={quickSelectButtonStyle}
                  >
                    Baltic Sea
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      return setSelectedCountries([
                        'Albania',
                        'Bosnia and Herzegovina',
                        'Croatia',
                        'Cyprus',
                        'France',
                        'Greece',
                        'Italy',
                        'Malta',
                        'Monaco',
                        'Montenegro',
                        'Slovenia',
                        'Spain',
                        'Turkey',
                      ]);
                    }}
                    sx={quickSelectButtonStyle}
                  >
                    Mediterranean
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      return setSelectedCountries(['Ireland', 'United Kingdom']);
                    }}
                    sx={quickSelectButtonStyle}
                  >
                    British Isles & Ireland
                  </Button>
                  {/* Added Adriatic Sea */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      return setSelectedCountries([
                        'Albania',
                        'Bosnia and Herzegovina',
                        'Croatia',
                        'Italy',
                        'Montenegro',
                        'Slovenia',
                      ]);
                    }}
                    sx={quickSelectButtonStyle}
                  >
                    Adriatic Sea
                  </Button>
                  {/* Added White Sea */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      return setSelectedCountries(['Russia']);
                    }}
                    sx={quickSelectButtonStyle}
                  >
                    White Sea
                  </Button>
                  {/* Added North Atlantic */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      return setSelectedCountries([
                        'Belgium',
                        'Denmark',
                        'France',
                        'Germany',
                        'Iceland',
                        'Ireland',
                        'Netherlands',
                        'Norway',
                        'Portugal',
                        'Spain',
                        'United Kingdom',
                      ]);
                    }}
                    sx={quickSelectButtonStyle}
                  >
                    North Atlantic
                  </Button>
                </Box>

                {selectedCountries.length > 0 && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      return setSelectedCountries([]);
                    }}
                    sx={{
                      alignSelf: 'flex-end',
                      color: '#1a4c59',
                      borderColor: '#1a4c59',
                      textTransform: 'none',
                      '&:hover': {
                        borderColor: '#1a4c59',
                        backgroundColor: 'rgba(26, 76, 89, 0.05)',
                      },
                    }}
                  >
                    Clear Country Filters
                  </Button>
                )}
              </Box>
            </Paper>{' '}
            {/* End of right panel Paper */}
          </Grid>
          {/* End of Top Row Grid Items (Map + Search Panel) */}

          {/* New Grid Item for Unified Results Below */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            {' '}
            {/* Increase margin top for separation */}
            <Paper
              sx={{
                p: 3,
                bgcolor: 'white',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {' '}
              {/* Keep p: 3 for main results */}
              {/* Title Area for Results - Updated Logic */}
              <Box sx={{ mb: 3 }}>
                {!isLoading &&
                  !error &&
                  (() => {
                    // Use IIFE for complex conditional rendering
                    const count = searchResults.length;
                    const hasActiveSearch = searchQuery || selectedApplication;
                    const hasCountryFilter = selectedCountries.length > 0;
                    const hasActiveFilter = hasActiveSearch || hasCountryFilter;

                    if (count > 0) {
                      let titleText = '';
                      if (searchMode === 'general' && searchQuery) {
                        titleText = `Found ${count} result${count > 1 ? 's' : ''} for "${searchQuery}"`;
                      } else if (searchMode === 'product' && searchQuery) {
                        titleText = `Found ${count} recommended species for "${searchQuery}"`;
                      } else if (selectedApplication && !searchQuery) {
                        const appTitle =
                          applicationCategories.find((c) => {
                            return c.key === selectedApplication;
                          })?.title || selectedApplication;
                        titleText = `Found ${count} result${count > 1 ? 's' : ''} for Application: ${appTitle}`;
                      } else if (hasCountryFilter && !hasActiveSearch) {
                        // Handle case where only country filter is active
                        titleText = `Found ${count} result${count > 1 ? 's' : ''} in selected countr${selectedCountries.length > 1 ? 'ies' : 'y'}`;
                      } else {
                        // Fallback title if results exist but context is unexpected
                        titleText = `Found ${count} result${count > 1 ? 's' : ''}`;
                      }
                      return <Typography variant="h6">{titleText}</Typography>;
                    } else if (hasActiveFilter) {
                      // Filter was active, but no results
                      return (
                        <Typography variant="h6" color="text.secondary">
                          No results found matching your criteria.
                        </Typography>
                      );
                    } else {
                      // Initial state, no filters active
                      return (
                        <Typography variant="h6" color="text.secondary">
                          Search, browse applications, or filter by country to see results.
                        </Typography>
                      );
                    }
                  })()}
              </Box>
              {/* Loading / Error State */}
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                  <CircularProgress />
                </Box>
              )}
              {error && (
                <Typography color="error" align="center" gutterBottom>
                  {error}
                </Typography>
              )}
              {/* Results Rendering Logic */}
              {!isLoading && !error && (
                <Box
                  sx={{
                    maxHeight: '65vh', // Limit height, adjust as needed
                    overflowY: 'auto', // Enable vertical scroll when needed
                    pr: 1, // Padding to prevent scrollbar overlap
                    mr: -1, // Negative margin to pull scrollbar out slightly
                  }}
                >
                  <Grid container spacing={3}>
                    {' '}
                    {/* Add Grid container */}
                    {searchQuery &&
                      searchMode === 'general' &&
                      searchResults.map((result, index) => {
                        return (
                          // Wrap Card in Grid item
                          <Grid item xs={12} lg={6} key={`${index}-general`}>
                            <Card
                              sx={{
                                mb: 3, // Keep margin bottom between result cards
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                '&:hover': {
                                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                                  transition: 'box-shadow 0.3s ease-in-out',
                                },
                                height: '100%', // Ensure cards in a row have same height
                              }}
                            >
                              <CardContent>
                                {' '}
                                {/* Use default CardContent padding */}
                                <Grid container spacing={2}>
                                  {' '}
                                  {/* Keep spacing={2} */}
                                  <Grid
                                    item
                                    xs={12}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                          color:
                                            result.color?.toLowerCase() === 'blue-green'
                                              ? colorMap['blue-green']
                                              : result.color?.toLowerCase() || 'inherit',
                                          fontFamily: '"Poppins", sans-serif',
                                        }}
                                      >
                                        {result.species}
                                      </Typography>
                                      <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        gutterBottom
                                        sx={{
                                          fontFamily: '"Poppins", sans-serif',
                                        }}
                                      >
                                        {result.commonName}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                      {/* Fixed conditional rendering for Tooltip */}
                                      {algaeExistsOnMap(result.species) ? (
                                        <Tooltip title="Show location on map">
                                          <IconButton
                                            size="small"
                                            onClick={() => {
                                              return handleLocationClick(index);
                                            }}
                                            sx={{
                                              color: '#1a4c59',
                                              bgcolor: 'rgba(26, 76, 89, 0.1)',
                                              '&:hover': {
                                                bgcolor: 'rgba(26, 76, 89, 0.2)',
                                              },
                                            }}
                                          >
                                            <RoomIcon />
                                          </IconButton>
                                        </Tooltip>
                                      ) : null}
                                      <Tooltip title="View full details">
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={() => {
                                            return handleViewDetails(result.species);
                                          }}
                                          sx={{
                                            color: '#1a4c59',
                                            borderColor: '#1a4c59',
                                            '&:hover': {
                                              backgroundColor: 'rgba(26, 76, 89, 0.08)',
                                              borderColor: '#1a4c59',
                                            },
                                          }}
                                        >
                                          Read More
                                        </Button>
                                      </Tooltip>
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Typography
                                      variant="subtitle1"
                                      gutterBottom
                                      sx={{
                                        fontFamily: '"Poppins", sans-serif',
                                        color: '#1a4c59',
                                        fontWeight: 500,
                                        fontSize: '0.95rem',
                                        mb: 2, // Add explicit margin bottom
                                      }}
                                    >
                                      Industrial Applications & Uses
                                    </Typography>
                                    {result.applications &&
                                      Object.entries(result.applications)
                                        .filter(([_, value]) => {
                                          return value !== null;
                                        })
                                        .map(([key, value]) => {
                                          const category = applicationCategories.find((cat) => {
                                            return cat.key === key;
                                          });
                                          const Icon = category?.icon;
                                          return (
                                            <Box
                                              key={key}
                                              sx={{
                                                display: 'flex',
                                                alignItems: 'flex-start',
                                                gap: 1.5,
                                                mb: 2,
                                                p: 2,
                                                borderRadius: 1,
                                                bgcolor: `${category?.color}11`,
                                                border: '1px solid',
                                                borderColor: `${category?.color}22`,
                                              }}
                                            >
                                              {Icon && (
                                                <Icon sx={{ color: category?.color, mt: '2px' }} />
                                              )}
                                              <Box>
                                                <Typography
                                                  variant="subtitle2"
                                                  sx={{
                                                    fontFamily: '"Poppins", sans-serif',
                                                    color: '#1a4c59',
                                                    fontWeight: 600,
                                                    mb: 0.5,
                                                  }}
                                                >
                                                  {category?.title}
                                                </Typography>
                                                <Typography
                                                  variant="body2"
                                                  sx={{
                                                    fontFamily: '"Poppins", sans-serif',
                                                  }}
                                                >
                                                  {value}
                                                </Typography>
                                              </Box>
                                            </Box>
                                          );
                                        })}
                                  </Grid>
                                  <Grid item xs={12} md={6}>
                                    <Typography
                                      variant="subtitle1"
                                      gutterBottom
                                      sx={{
                                        fontFamily: '"Poppins", sans-serif',
                                        color: '#1a4c59',
                                        fontWeight: 500,
                                        fontSize: '0.95rem',
                                        mb: 2, // Add explicit margin bottom
                                      }}
                                    >
                                      Geographic & Growth Information
                                    </Typography>
                                    <Box
                                      sx={{
                                        p: 2, // Standardize padding
                                        borderRadius: 1,
                                        bgcolor: 'rgba(26, 76, 89, 0.05)',
                                        border: '1px solid',
                                        borderColor: 'rgba(26, 76, 89, 0.1)',
                                        mb: 2, // Add margin bottom HERE
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          fontFamily: '"Poppins", sans-serif',
                                          color: '#1a4c59',
                                          fontWeight: 600,
                                          mb: 1,
                                        }}
                                      >
                                        Regional Availability
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontFamily: '"Poppins", sans-serif',
                                        }}
                                      >
                                        <strong>Location:</strong> {result.geographicPosition}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontFamily: '"Poppins", sans-serif',
                                        }}
                                      >
                                        <strong>Habitat:</strong> {result.habitat}
                                      </Typography>
                                    </Box>

                                    <Box
                                      sx={{
                                        p: 2,
                                        borderRadius: 1,
                                        bgcolor: 'rgba(26, 76, 89, 0.05)',
                                        border: '1px solid',
                                        borderColor: 'rgba(26, 76, 89, 0.1)',
                                      }}
                                    >
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          fontFamily: '"Poppins", sans-serif',
                                          color: '#1a4c59',
                                          fontWeight: 600,
                                          mb: 1,
                                        }}
                                      >
                                        Growth Conditions
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontFamily: '"Poppins", sans-serif',
                                        }}
                                      >
                                        <strong>Water Temperature:</strong> {result.waterTemp}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontFamily: '"Poppins", sans-serif',
                                        }}
                                      >
                                        <strong>Optimal Temperature:</strong> {result.optimalTemp}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontFamily: '"Poppins", sans-serif',
                                        }}
                                      >
                                        <strong>Salinity:</strong> {result.salinity}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontFamily: '"Poppins", sans-serif',
                                        }}
                                      >
                                        <strong>Depth Range:</strong> {result.depthRange}
                                      </Typography>
                                    </Box>
                                  </Grid>
                                  {result.risks && (
                                    <Grid item xs={12}>
                                      <Divider sx={{ my: 2 }} />
                                      <Typography variant="h6" gutterBottom>
                                        Risks and Concerns
                                      </Typography>
                                      {renderRisks(result.risks)}
                                    </Grid>
                                  )}
                                </Grid>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    {searchQuery &&
                      searchMode === 'product' &&
                      searchResults.map((result, index) => {
                        return (
                          // Wrap product results in Grid item
                          <Grid item xs={12} lg={6} key={`${index}-product`}>
                            {renderProductResults(result)}
                          </Grid>
                        );
                      })}
                    {selectedApplication &&
                      !searchQuery &&
                      searchResults.map((result, index) => {
                        return (
                          // Wrap Application Result Card in Grid item
                          <Grid item xs={12} lg={6} key={`${index}-app`}>
                            <Card
                              sx={{
                                mb: 3, // Increase margin bottom between result cards
                                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
                                height: '100%', // Ensure cards in a row have same height
                              }}
                            >
                              <CardContent>
                                {' '}
                                {/* Use default padding */}
                                <Grid container spacing={2}>
                                  {' '}
                                  {/* Keep spacing={2} */}
                                  <Grid
                                    item
                                    xs={12}
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'flex-start',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    <Box>
                                      <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{
                                          color:
                                            result.color?.toLowerCase() === 'blue-green'
                                              ? colorMap['blue-green']
                                              : result.color?.toLowerCase() || 'inherit',
                                          fontFamily: '"Poppins", sans-serif',
                                        }}
                                      >
                                        {result.species}
                                      </Typography>
                                      <Typography
                                        variant="subtitle1"
                                        color="text.secondary"
                                        gutterBottom
                                        sx={{ fontFamily: '"Poppins", sans-serif' }}
                                      >
                                        {result.commonName}
                                      </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                      {/* Fixed conditional rendering for Tooltip */}
                                      {algaeExistsOnMap(result.species) ? (
                                        <Tooltip title="Show location on map">
                                          <IconButton
                                            size="small"
                                            onClick={() => {
                                              return handleLocationClick(index);
                                            }}
                                            sx={{
                                              color: '#1a4c59',
                                              bgcolor: 'rgba(26, 76, 89, 0.1)',
                                              '&:hover': { bgcolor: 'rgba(26, 76, 89, 0.2)' },
                                            }}
                                          >
                                            <RoomIcon />
                                          </IconButton>
                                        </Tooltip>
                                      ) : null}
                                      <Tooltip title="View full details">
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={() => {
                                            return handleViewDetails(result.species);
                                          }}
                                          sx={{
                                            color: '#1a4c59',
                                            borderColor: '#1a4c59',
                                            '&:hover': {
                                              backgroundColor: 'rgba(26, 76, 89, 0.08)',
                                              borderColor: '#1a4c59',
                                            },
                                          }}
                                        >
                                          Read More
                                        </Button>
                                      </Tooltip>
                                    </Box>
                                  </Grid>
                                  {/* Display DETAILED info for Application results, restoring previous fields */}
                                  <Grid item xs={12}>
                                    <Grid container spacing={2}>
                                      {' '}
                                      {/* Use nested grid for two columns */}
                                      <Grid item xs={12} md={6}>
                                        {' '}
                                        {/* Left Column */}
                                        <Typography
                                          variant="body2"
                                          sx={{ fontFamily: '"Poppins", sans-serif', mb: 0.5 }}
                                        >
                                          <strong>Division:</strong> {result.division || 'N/A'}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{ fontFamily: '"Poppins", sans-serif', mb: 0.5 }}
                                        >
                                          <strong>Type:</strong> {result.microMacro || 'N/A'}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{ fontFamily: '"Poppins", sans-serif', mb: 0.5 }}
                                        >
                                          <strong>Water Type:</strong> {result.waterType || 'N/A'}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{ fontFamily: '"Poppins", sans-serif' }}
                                        >
                                          <strong>Location:</strong>{' '}
                                          {result.geographicPosition || 'N/A'}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} md={6}>
                                        {' '}
                                        {/* Right Column */}
                                        {(() => {
                                          // Immediately invoked function to get category safely
                                          const category = applicationCategories.find((cat) => {
                                            return cat.key === selectedApplication;
                                          });
                                          const applicationValue =
                                            result.applications?.[
                                              selectedApplication as keyof Applications
                                            ];
                                          return (
                                            <Typography
                                              variant="body2"
                                              sx={{ fontFamily: '"Poppins", sans-serif', mb: 0.5 }}
                                            >
                                              <strong>{category?.title || 'Application'}:</strong>{' '}
                                              {applicationValue || 'N/A'}
                                            </Typography>
                                          );
                                        })()}
                                        <Typography
                                          variant="body2"
                                          sx={{ fontFamily: '"Poppins", sans-serif', mb: 0.5 }}
                                        >
                                          <strong>Habitat:</strong> {result.habitat || 'N/A'}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{ fontFamily: '"Poppins", sans-serif' }}
                                        >
                                          <strong>Invasive:</strong> {result.invasive || 'N/A'}
                                        </Typography>
                                      </Grid>
                                    </Grid>
                                  </Grid>
                                </Grid>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    {/* No Results Scenarios */}
                    {searchQuery && searchResults.length === 0 && (
                      <Grid item xs={12}>
                        {' '}
                        {/* No results message needs grid item too */}
                        <Typography align="center" color="text.secondary">
                          No results found for "{searchQuery}"
                        </Typography>
                      </Grid>
                    )}
                    {selectedApplication && !searchQuery && searchResults.length === 0 && (
                      <Grid item xs={12}>
                        {/* No results message needs grid item too */}
                        <Typography align="center" color="text.secondary">
                          No results found for the selected application.
                        </Typography>
                      </Grid>
                    )}
                  </Grid>{' '}
                  {/* End Grid container */}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// Helper style for Quick Select buttons
const quickSelectButtonStyle = {
  px: 1, // Keep tighter horizontal padding for buttons
  py: 0.2, // Keep tighter vertical padding
  fontSize: '0.75rem',
  color: '#1a4c59',
  borderColor: '#88c5d3',
  textTransform: 'none',
  '&:hover': {
    borderColor: '#1a4c59',
    backgroundColor: 'rgba(26, 76, 89, 0.05)',
  },
};

export default SearchSection;
