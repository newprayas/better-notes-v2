// Subject reference type
export interface SubjectReference {
  _type: 'reference';
  _ref: string;
}

// Subject document type
export interface Subject {
  _id: string;
  _type: 'subject';
  name: string;
  value: {
    _type: 'slug';
    current: string;
  };
  description?: string;
}

// Note types
export interface Note {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  pageNumber?: number;
  images?: {
    _key?: string;
    _type: string;
    asset?: {
      _id: string;
      _type: string;
      url?: string;
      metadata?: any;
    };
  }[];
  academicYear?: string;
  subject?: SubjectReference | Subject; // Can be reference or populated subject
  tags?: string[];
  featured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Discount code types
export interface DiscountCode {
  _id: string;
  code: string;
  discountPercentage: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
}

// Cart types
export interface CartItem {
  note: Note;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  discountCode?: string;
  discountAmount?: number;
  quantityDiscount?: number;
  finalTotal: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Filter types
export interface NoteFilters {
  academicYear?: string;
  subject?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  search?: string;
}

// Slideshow types
export interface SlideshowImage {
  _key?: string;
  _type: string;
  asset?: {
    _id: string;
    _type: string;
    url?: string;
    metadata?: any;
  };
  alt?: string;
  caption?: string;
}

export interface Slideshow {
  _id: string;
  _type: 'slideshow';
  title?: string;
  images?: SlideshowImage[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// YouTube video types
export interface YouTubeVideo {
  _id: string;
  _type: 'youtubeVideo';
  title: string;
  youtubeUrl: string;
  description?: string;
  order?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Contact information
export interface ContactInfo {
  telegram: string;
  email?: string;
  phone?: string;
}

// Site configuration
export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    telegram: string;
    email?: string;
  };
}