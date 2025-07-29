import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import RoomIcon from '@mui/icons-material/Room';
import {
  Box,
  CircularProgress,
  Collapse,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import { AlgaeData } from './SearchSection';

// Define colorMap locally in this component
const colorMap = {
  'blue-green': '#00CEC8',
  brown: '#795548',
  red: '#d32f2f',
  green: '#2e7d32',
  // Add other colors corresponding to your data if needed
};

// Define marker colors and their corresponding icon URLs
const markerIcons = [
  {
    color: '#E41A1C',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  },
  {
    color: '#377EB8',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  },
  {
    color: '#4DAF4A',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  },
  {
    color: '#984EA3',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  },
  {
    color: '#FF7F00',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  },
  {
    color: '#FFFF33',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  },
  {
    color: '#A65628',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png',
  },
  {
    color: '#F781BF',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  },
  {
    color: '#1B9E77',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  },
  {
    color: '#D95F02',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  },
  {
    color: '#7570B3',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png',
  },
  {
    color: '#66A61E',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  },
  {
    color: '#E6AB02',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
  },
  {
    color: '#666666',
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  },
];

// Function to create a colored marker icon
const createColoredIcon = (index: number) => {
  return L.icon({
    iconUrl: markerIcons[index % markerIcons.length].url,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// Helper function to group algae by species to reduce marker clutter
const groupAlgaeBySpecies = (algaeData: AlgaeData[]): AlgaeData[] => {
  const groupedData: { [key: string]: AlgaeData } = {};

  algaeData.forEach((algae) => {
    const key = algae.species;
    if (!groupedData[key]) {
      groupedData[key] = { ...algae };
    }
  });

  return Object.values(groupedData);
};

interface MapSectionProps {
  algaeData: AlgaeData[];
  dataSource: 'emodnet' | 'gbif';
  onDataSourceChange: (
    event: React.MouseEvent<HTMLElement>,
    newValue: 'emodnet' | 'gbif' | null,
  ) => void;
  mapIsLoading: boolean;
  center: L.LatLngTuple;
  zoom: number;
}

export interface MapSectionHandle {
  openPopup: (algaeIndex: number, coordIndex: number) => void;
}

const MapSection = forwardRef<MapSectionHandle, MapSectionProps>(
  ({ algaeData, dataSource, onDataSourceChange, mapIsLoading, center, zoom }, ref) => {
    const markerRefs = React.useRef<{ [key: string]: L.CircleMarker }>({});
    const [showAlgaeList, setShowAlgaeList] = useState<boolean>(true);

    // Refs to store consistent color assignments per species
    const speciesColorMap = useRef<{ [species: string]: number }>({});
    const nextColorIndex = useRef<number>(0);

    // Ref for the Leaflet map instance
    const mapInstanceRef = useRef<L.Map | null>(null);

    // Use memoization to avoid recomputing on every render
    const groupedAlgaeData = useMemo(() => {
      return groupAlgaeBySpecies(algaeData);
    }, [algaeData]);

    useImperativeHandle(ref, () => ({
      openPopup: (algaeIndex: number, coordIndex: number = 0) => {
        // Get species name from the matched algae data
        const algae = groupedAlgaeData[algaeIndex];
        if (!algae) return;

        const speciesName = algae.species;
        console.log(`Trying to open popup for species: ${speciesName}`);

        // Try to find a marker for this species using the algaeIndex
        let foundMarker = false;
        const markerKey = `${algaeIndex}-${coordIndex}`;

        if (markerRefs.current[markerKey]) {
          console.log(`Found marker with key ${markerKey}`);
          markerRefs.current[markerKey].openPopup();
          foundMarker = true;
        }

        // If first approach failed, try finding by exact species name
        if (!foundMarker) {
          for (let i = 0; i < groupedAlgaeData.length; i++) {
            // Only consider exact species matches
            if (groupedAlgaeData[i].species === speciesName) {
              // Try each coordinate for this species
              const coordinates = getCoordinates(groupedAlgaeData[i]);
              for (let j = 0; j < coordinates.length; j++) {
                const key = `${i}-${j}`;
                if (markerRefs.current[key]) {
                  console.log(`Found marker with key ${key} by species name`);
                  markerRefs.current[key].openPopup();
                  foundMarker = true;
                  break;
                }
              }
              if (foundMarker) break;
            }
          }
        }

        if (!foundMarker) {
          console.log(`No marker found for species: ${speciesName}`);
        }
      },
    }));

    // Function to handle both single coordinates and arrays of coordinates
    const getCoordinates = (
      algae: AlgaeData,
    ): { coords: L.LatLngExpression; pointIndex: number }[] => {
      let points: any[] = [];
      if (algae.dataSource === 'gbif' && algae.gbif_points) {
        points = algae.gbif_points;
      } else if (algae.dataSource === 'emodnet' && algae.emodnet_points) {
        points = algae.emodnet_points;
      } else if (algae.emodnet_points) {
        // Fallback to EMODnet if dataSource is missing
        points = algae.emodnet_points;
      } else if (algae.gbif_points) {
        // Fallback to GBIF if dataSource is missing
        points = algae.gbif_points;
      }

      return points.map((point, index) => ({
        coords: point.coordinates as [number, number], // Assuming [lat, lng]
        pointIndex: index, // Pass the original index for popup data retrieval
      }));
    };

    // Helper to get specific point info for popups
    const getPointInfo = (algae: AlgaeData, pointIndex: number): any | null => {
      if (algae.dataSource === 'gbif' && algae.gbif_points) {
        return algae.gbif_points[pointIndex] || null;
      } else if (algae.dataSource === 'emodnet' && algae.emodnet_points) {
        return algae.emodnet_points[pointIndex] || null;
      } else if (algae.emodnet_points) {
        // Fallback
        return algae.emodnet_points[pointIndex] || null;
      } else if (algae.gbif_points) {
        // Fallback
        return algae.gbif_points[pointIndex] || null;
      }
      return null;
    };

    // Helper function to get consistent color index per species
    const getSpeciesColorIndex = (speciesName: string): number => {
      if (speciesColorMap.current[speciesName] === undefined) {
        // Assign the next available color index
        const assignedIndex = nextColorIndex.current;
        speciesColorMap.current[speciesName] = assignedIndex;
        // Cycle through the available colors in markerIcons
        nextColorIndex.current = (nextColorIndex.current + 1) % markerIcons.length;
        return assignedIndex;
      } else {
        // Return the previously assigned index
        return speciesColorMap.current[speciesName];
      }
    };

    // --- Helper function to determine text color based on algae data ---
    const getAlgaeTextColor = (algaeColorName: string | undefined | null): string => {
      const lowerCaseColor = algaeColorName?.toLowerCase();
      if (lowerCaseColor === 'blue-green') {
        return colorMap['blue-green'];
      } else if (lowerCaseColor && colorMap[lowerCaseColor as keyof typeof colorMap]) {
        return colorMap[lowerCaseColor as keyof typeof colorMap];
      } else if (lowerCaseColor) {
        // Basic CSS color names (like 'red', 'green') might work directly
        // Test if this is reliable or if a stricter allowlist/default is needed
        return lowerCaseColor;
      }
      return 'inherit'; // Default color if no valid color found
    };

    // --- Effect to update map view when center/zoom props change ---
    React.useEffect(() => {
      if (mapInstanceRef.current && center && zoom) {
        // Use flyTo for smooth animation
        mapInstanceRef.current.flyTo(center, zoom);
      }
    }, [center, zoom]); // Depend on center and zoom props

    return (
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 2,
          height: '100%',
          // display: 'flex', // Remove flex layout from Paper
          // flexDirection: 'column', // Remove flex layout from Paper
          overflow: 'hidden', // Prevent Paper itself from overflowing
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h5" sx={{ color: '#1a4c59' }}>
            Algae Distribution ({dataSource === 'gbif' ? 'GBIF Occurrences' : 'EMODnet Sites'})
          </Typography>
          <ToggleButtonGroup
            color="primary"
            value={dataSource}
            exclusive
            onChange={onDataSourceChange}
            aria-label="Map Data Source"
            size="small"
          >
            <ToggleButton value="emodnet" sx={{ px: 1, py: 0.2, fontSize: '0.75rem' }}>
              EMODnet
            </ToggleButton>
            <ToggleButton value="gbif" sx={{ px: 1, py: 0.2, fontSize: '0.75rem' }}>
              GBIF
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <Box
          sx={{
            // flexGrow: 1, // Remove flex grow
            // height: 0, // Remove flex grow height pattern
            height: '75vh', // Apply a fixed vh height (adjust as needed)
            width: '100%',
            position: 'relative', // Needed for loading overlay
            overflow: 'hidden', // Clip map tiles if they somehow overflow
            '& .leaflet-container': {
              height: '100%',
              width: '100%',
              borderRadius: 1,
              filter: mapIsLoading ? 'brightness(0.8)' : 'none',
              transition: 'filter 0.2s ease-in-out',
            },
          }}
        >
          {mapIsLoading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 10,
                borderRadius: 1,
              }}
            >
              <CircularProgress />
            </Box>
          )}
          <MapContainer
            center={[54, 15]}
            zoom={3}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            minZoom={2}
            ref={mapInstanceRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {groupedAlgaeData.map((algae, algaeIndex) => {
              const coordinatePoints = getCoordinates(algae);
              if (coordinatePoints.length === 0) return null;

              // --- Get color based on SPECIES NAME ---
              const speciesName = algae.species || 'Unknown species';
              const colorIndex = getSpeciesColorIndex(speciesName);
              const markerFillColor = markerIcons[colorIndex].color;
              // --- End color logic ---

              return coordinatePoints.map(({ coords, pointIndex }) => {
                const pointInfo = getPointInfo(algae, pointIndex);
                const markerKey = `${algaeIndex}-${pointIndex}`;

                const radius = 5;

                return (
                  <CircleMarker
                    key={markerKey}
                    center={coords as L.LatLngExpression}
                    radius={radius}
                    pathOptions={{
                      fillColor: markerFillColor,
                      fillOpacity: 0.85,
                      weight: 1,
                      color: '#fff',
                      opacity: 1,
                    }}
                    ref={(ref) => {
                      if (ref) {
                        markerRefs.current[markerKey] = ref;
                      }
                    }}
                  >
                    <Popup>
                      <Box sx={{ minWidth: '200px', maxWidth: '300px' }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: getAlgaeTextColor(algae.color),
                            fontWeight: 600,
                            wordBreak: 'break-word',
                          }}
                        >
                          {algae.species}
                        </Typography>
                        {algae.commonName && algae.commonName !== 'No common name' && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            ({algae.commonName})
                          </Typography>
                        )}
                        <Divider sx={{ my: 1 }} />

                        {algae.dataSource === 'gbif' && pointInfo && (
                          <Box sx={{ fontSize: '0.8rem' }}>
                            <Typography
                              variant="caption"
                              display="block"
                              gutterBottom
                              sx={{ fontWeight: 'bold' }}
                            >
                              GBIF Occurrence:
                            </Typography>
                            <Typography variant="caption" display="block">
                              <strong>Year:</strong> {pointInfo.year || 'N/A'}
                            </Typography>
                            <Typography variant="caption" display="block">
                              <strong>Country:</strong> {pointInfo.country_code || 'N/A'}
                            </Typography>
                            <Typography variant="caption" display="block">
                              <strong>Basis:</strong> {pointInfo.basis_of_record || 'N/A'}
                            </Typography>
                            {pointInfo.occurrence_id && (
                              <Link
                                href={`https://www.gbif.org/occurrence/${pointInfo.occurrence_id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="caption"
                                display="block"
                                sx={{ mt: 0.5 }}
                              >
                                View on GBIF
                              </Link>
                            )}
                          </Box>
                        )}

                        {(algae.dataSource === 'emodnet' || !algae.dataSource) && pointInfo && (
                          <Box sx={{ fontSize: '0.8rem' }}>
                            <Typography
                              variant="caption"
                              display="block"
                              gutterBottom
                              sx={{ fontWeight: 'bold' }}
                            >
                              EMODnet Site Info:
                            </Typography>
                            {algae.match_name && (
                              <Box sx={{ mb: 1, p: 0.5, borderRadius: 1, bgcolor: '#f5f5f5' }}>
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                  <strong>Match:</strong> {algae.match_name} (
                                  {Math.round(algae.match_score || 0)}%)
                                </Typography>
                              </Box>
                            )}
                            <Typography variant="caption" display="block">
                              <strong>Country:</strong> {pointInfo.country || 'N/A'}
                            </Typography>
                            {pointInfo.organism_group && (
                              <Typography variant="caption" display="block">
                                <strong>Type:</strong> {pointInfo.organism_group}
                              </Typography>
                            )}
                            {pointInfo.production_method && (
                              <Typography variant="caption" display="block">
                                <strong>Production:</strong> {pointInfo.production_method}
                              </Typography>
                            )}
                            {pointInfo.production_details && (
                              <Typography variant="caption" display="block">
                                <strong>Details:</strong> {pointInfo.production_details}
                              </Typography>
                            )}
                            {pointInfo.site_id && (
                              <Typography variant="caption" display="block">
                                <strong>Site ID:</strong> {pointInfo.site_id}
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Box>
                    </Popup>
                  </CircleMarker>
                );
              });
            })}
          </MapContainer>
        </Box>
        {algaeData.length === 0 && (
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              textAlign: 'center',
              color: 'text.secondary',
              flexShrink: 0,
            }}
          >
            Search for algae species or select countries/applications to see locations.
          </Typography>
        )}

        {groupedAlgaeData.length > 0 && (
          <Box
            sx={{
              mt: 1,
              // flexShrink: 0, // Not needed without flex parent
              // maxHeight: '35%', // Height will be determined by content or fixed value below
              display: 'flex', // Use flex to manage internal layout
              flexDirection: 'column', // Stack toggle header and list
              overflow: 'hidden', // Clip content if it exceeds maxHeight
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 1,
                cursor: 'pointer',
                bgcolor: 'rgba(26, 76, 89, 0.05)',
                borderRadius: '4px',
                '&:hover': {
                  bgcolor: 'rgba(26, 76, 89, 0.1)',
                },
              }}
              onClick={() => setShowAlgaeList(!showAlgaeList)}
            >
              <Typography variant="subtitle1" sx={{ color: '#1a4c59', fontWeight: 600 }}>
                Algae Species on Map ({groupedAlgaeData.length})
              </Typography>
              {showAlgaeList ? (
                <ExpandLessIcon sx={{ color: '#1a4c59' }} />
              ) : (
                <ExpandMoreIcon sx={{ color: '#1a4c59' }} />
              )}
            </Box>

            <Collapse in={showAlgaeList}>
              <Box
                sx={{
                  overflowY: 'auto', // Allow only vertical scrolling for list items
                  maxHeight: '250px', // Restore maxHeight for the inner list scroll area
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                  pr: 1,
                  mr: -1,
                  '&::-webkit-scrollbar': {
                    width: '6px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                    borderRadius: '3px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    background: '#cccccc',
                    borderRadius: '3px',
                    '&:hover': {
                      background: '#aaaaaa',
                    },
                  },
                }}
              >
                <List dense>
                  {groupedAlgaeData.map((algae, index) => {
                    // Get primary application (first non-empty one)
                    let primaryUse = 'Not specified';
                    // --- Robust check for algae.applications before accessing ---
                    if (algae.applications && typeof algae.applications === 'object') {
                      try {
                        // Add try-catch for extra safety, though check should suffice
                        const applications = Object.entries(algae.applications)
                          .filter(([_, value]) => value !== null && value !== '') // Ensure value check is safe
                          .map(([key, value]) => ({
                            key: key.charAt(0).toUpperCase() + key.slice(1),
                            // Ensure value is treated as string safely
                            value: String(value ?? ''),
                          }));

                        if (applications.length > 0) {
                          // Limit length of displayed primary use value
                          const displayValue =
                            applications[0].value.length > 50
                              ? applications[0].value.substring(0, 47) + '...'
                              : applications[0].value;
                          primaryUse = `${applications[0].key}: ${displayValue}`;
                        }
                      } catch (e) {
                        console.error('Error processing applications for:', algae.species, e);
                        primaryUse = 'Error processing uses'; // Indicate error
                      }
                    } // End robust check

                    // --- Get color based on SPECIES NAME for indicator ---
                    const speciesName = algae.species || 'Unknown species';
                    const colorIndex = getSpeciesColorIndex(speciesName);
                    const indicatorDotColor = markerIcons[colorIndex].color;
                    // --- End color logic ---

                    // --- Determine TEXT color using helper ---
                    const textColor = getAlgaeTextColor(algae.color);
                    // --- End text color logic ---

                    return (
                      <ListItem
                        key={index}
                        divider
                        secondaryAction={
                          <Box
                            onClick={() => {
                              // Logic to open the first point's popup for this species
                              if (markerRefs.current) {
                                const coordinates = getCoordinates(algae);
                                if (coordinates.length > 0) {
                                  // Use the algaeIndex (which is `index` here) and pointIndex 0
                                  const key = `${index}-0`;
                                  if (markerRefs.current[key]) {
                                    console.log(
                                      `Opening popup for ${algae.species} via list click (key: ${key})`,
                                    );
                                    markerRefs.current[key].openPopup();
                                  } else {
                                    console.warn(
                                      `Marker ref not found for key ${key} on list click`,
                                    );
                                  }
                                }
                              }
                            }}
                            sx={{
                              cursor: 'pointer',
                              color: '#1a4c59',
                              display: 'flex',
                              alignItems: 'center',
                              '&:hover': {
                                color: '#2c7a90',
                              },
                            }}
                          >
                            <RoomIcon fontSize="small" />
                          </Box>
                        }
                      >
                        {/* Color Indicator - Use consistent indicatorDotColor */}
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            bgcolor: indicatorDotColor, // Use consistent color
                            mr: 1.5,
                            flexShrink: 0,
                          }}
                        />
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 500,
                                lineHeight: 1.3,
                                color: textColor,
                              }}
                            >
                              {algae.species || 'Unknown species'}{' '}
                              {algae.commonName && algae.commonName !== 'No common name'
                                ? `(${algae.commonName})`
                                : ''}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                              {primaryUse}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            </Collapse>
          </Box>
        )}
      </Paper>
    );
  },
);

export default MapSection;
