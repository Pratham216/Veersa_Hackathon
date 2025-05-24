export interface HospitalProperties {
  name?: string;
  address_line1?: string;
  city?: string;
  website?: string;
  distance?: number;
}

export interface Hospital {
  properties: HospitalProperties;
  geometry: {
    coordinates: [number, number];
  };
}

export interface LocationOption {
  name: string;
  lat: number;
  lon: number;
} 