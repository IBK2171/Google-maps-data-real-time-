export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface GroundingUri {
  uri: string;
  title: string;
}

export interface GroundingMapsPlaceAnswerSource {
  title: string;
  uri: string;
}

export interface GroundingMapsChunk {
  maps: {
    uri: string;
    title: string;
    placeAnswerSources?: GroundingMapsPlaceAnswerSource[];
  };
}

export interface GroundingWebChunk {
  web: {
    uri: string;
    title: string;
  };
}

export type GroundingChunk = GroundingMapsChunk | GroundingWebChunk;
