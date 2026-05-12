import { ApplicationType } from '@/api/apb.client';
import { ContactSupport } from '@mui/icons-material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import FaceRetouchingNaturalIcon from '@mui/icons-material/FaceRetouchingNatural';
import FactoryIcon from '@mui/icons-material/Factory';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ParkIcon from '@mui/icons-material/Park';
import RestaurantIcon from '@mui/icons-material/Restaurant';

export const replaceSpecialCharacters = (input: string) => {
  return input.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '_');
};

export const all_colors = [
  '#fff3e0',
  '#ffe0b2',
  '#ffcc80',
  '#ffb74d',
  '#ffa726',
  '#fb8c00',
  '#f57c00',
  '#ef6c00',
  '#e65100',
  '#d84315',
  '#bf360c',
  '#8d1f12',
];

export const algaeColors = {
  green: { color: '#33a02c', name: 'Green', value: 'green' },
  brown: { color: '#b15928', name: 'Brown', value: 'brown' },
  red: { color: '#e31a1c', name: 'Red', value: 'red' },
  purple: { color: '#ad03fc', name: 'Purple', value: 'purple' },
  unknown: { color: '#000000', name: 'Unknown', value: 'unknown' },
};

export const applicationCategories = [
  {
    key: 'industrial' as ApplicationType,
    title: 'Industrial',
    description: 'Industrial applications and processes',
    color: '#3b5bdb',
    icon: FactoryIcon,
  },
  {
    key: 'agriculture' as ApplicationType,
    title: 'Agriculture',
    description: 'Agricultural and farming uses',
    color: '#2f9e44',
    icon: AgricultureIcon,
  },
  {
    key: 'medicinal' as ApplicationType,
    title: 'Medicinal',
    description: 'Medical and pharmaceutical applications',
    color: '#c2255c',
    icon: MedicalServicesIcon,
  },
  {
    key: 'cosmetics' as ApplicationType,
    title: 'Cosmetics',
    description: 'Beauty and personal care products',
    color: '#9c36b5',
    icon: FaceRetouchingNaturalIcon,
  },
  {
    key: 'environmental' as ApplicationType,
    title: 'Environmental',
    description: 'Environmental solutions and applications',
    color: '#0b7285',
    icon: ParkIcon,
  },
  {
    key: 'humanConsumption' as ApplicationType,
    title: 'Human Consumption',
    description: 'Food and nutritional products',
    color: '#e67700',
    icon: RestaurantIcon,
  },
];
