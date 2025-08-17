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

export const algaeColors = {
  green: { color: '#33a02c', name: 'Green', value: 'green' },
  brown: { color: '#b15928', name: 'Brown', value: 'brown' },
  red: { color: '#e31a1c', name: 'Red', value: 'red' },
  unknown: { color: '#ad03fc', name: 'Unknown', value: 'unknown' },
};

export const applicationCategories = [
  {
    key: 'industrial' as ApplicationType,
    title: 'Industrial',
    description: 'Industrial applications and processes',
    color: '#2196f3',
    icon: FactoryIcon,
  },
  {
    key: 'agriculture' as ApplicationType,
    title: 'Agriculture',
    description: 'Agricultural and farming uses',
    color: '#4caf50',
    icon: AgricultureIcon,
  },
  {
    key: 'medicinal' as ApplicationType,
    title: 'Medicinal',
    description: 'Medical and pharmaceutical applications',
    color: '#f44336',
    icon: MedicalServicesIcon,
  },
  {
    key: 'cosmetics' as ApplicationType,
    title: 'Cosmetics',
    description: 'Beauty and personal care products',
    color: '#e91e63',
    icon: FaceRetouchingNaturalIcon,
  },
  {
    key: 'environmental' as ApplicationType,
    title: 'Environmental',
    description: 'Environmental solutions and applications',
    color: '#009688',
    icon: ParkIcon,
  },
  {
    key: 'humanConsumption' as ApplicationType,
    title: 'Human Consumption',
    description: 'Food and nutritional products',
    color: '#ff9800',
    icon: RestaurantIcon,
  },
];