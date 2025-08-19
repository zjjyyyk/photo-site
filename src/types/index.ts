export interface Photo {
  id: number;
  url: string;
  thumbnailUrl?: string;
  title: string;
  description?: string;
  tags: string[];
  exif?: ExifData;
  width?: number;
  height?: number;
}

export interface ExifData {
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutterSpeed?: string;
  focalLength?: string;
  dateTaken?: string;
  location?: string;
}

export interface PhotoCategory {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  photos: Photo[];
  totalCount: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
}

export interface LightboxState {
  isOpen: boolean;
  currentPhotoIndex: number;
  photos: Photo[];
}
