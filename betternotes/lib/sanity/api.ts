import { client } from './client';
import { Note, DiscountCode, NoteFilters, Subject, Slideshow, YouTubeVideo } from '@/types';

// Get all notes with optional filtering
export async function getNotes(filters?: NoteFilters): Promise<Note[]> {
  let query = `*[_type == "note"`;
  
  if (filters) {
    const conditions = [];
    
    if (filters.academicYear) {
      conditions.push(`academicYear == "${filters.academicYear}"`);
    }
    
    if (filters.subject) {
      conditions.push(`subject->value.current == "${filters.subject}"`);
    }
    
    if (filters.priceRange) {
      conditions.push(`price >= ${filters.priceRange.min} && price <= ${filters.priceRange.max}`);
    }
    
    if (filters.search) {
      conditions.push(`title match "${filters.search}*" || description match "${filters.search}*"`);
    }
    
    if (conditions.length > 0) {
      query += ` && ${conditions.join(' && ')}`;
    }
  }
  
  query += `] | order(createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    price,
    originalPrice,
    pageNumber,
    images[]{
      _key,
      _type,
      asset->{
        _id,
        _type,
        url,
        metadata
      }
    },
    academicYear,
    subject->{
      _id,
      _type,
      name,
      value,
      description
    },
    tags,
    featured,
    createdAt,
    updatedAt
  }`;
  
  return await client.fetch(query);
}

// Get featured notes
export async function getFeaturedNotes(): Promise<Note[]> {
  const query = `*[_type == "note" && featured == true] | order(createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    price,
    originalPrice,
    pageNumber,
    images[]{
      _key,
      _type,
      asset->{
        _id,
        _type,
        url,
        metadata
      }
    },
    academicYear,
    subject->{
      _id,
      _type,
      name,
      value,
      description
    },
    tags,
    featured,
    createdAt,
    updatedAt
  }[0...6]`;
  
  return await client.fetch(query);
}

// Get a single note by slug
export async function getNoteBySlug(slug: string): Promise<Note | null> {
  const query = `*[_type == "note" && slug.current == "${slug}"][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    price,
    originalPrice,
    pageNumber,
    images[]{
      _key,
      _type,
      asset->{
        _id,
        _type,
        url,
        metadata
      }
    },
    academicYear,
    subject->{
      _id,
      _type,
      name,
      value,
      description
    },
    tags,
    featured,
    createdAt,
    updatedAt
  }`;
  
  return await client.fetch(query);
}

// Get all discount codes
export async function getDiscountCodes(): Promise<DiscountCode[]> {
  const query = `*[_type == "discountCode" && isActive == true && validFrom <= now() && validUntil >= now()] | order(validUntil desc) {
    _id,
    code,
    discountPercentage,
    validFrom,
    validUntil,
    isActive,
    usageLimit,
    usedCount
  }`;
  
  return await client.fetch(query);
}

// Validate a discount code
export async function validateDiscountCode(code: string): Promise<DiscountCode | null> {
  const query = `*[_type == "discountCode" && code == "${code}" && isActive == true && validFrom <= now() && validUntil >= now() && (usageLimit == null || usedCount < usageLimit)][0] {
    _id,
    code,
    discountPercentage,
    validFrom,
    validUntil,
    isActive,
    usageLimit,
    usedCount
  }`;
  
  return await client.fetch(query);
}

// Get all unique academic years
export async function getAcademicYears(): Promise<string[]> {
  const query = `*[_type == "note"] | distinct(academicYear)`;
  return await client.fetch(query);
}

// Get all subjects from subject documents
export async function getSubjects(): Promise<Subject[]> {
  const query = `*[_type == "subject"] | order(name asc) {
    _id,
    _type,
    name,
    value,
    description
  }`;
  return await client.fetch(query);
}

// Get all unique subject values (for backward compatibility)
export async function getSubjectValues(): Promise<string[]> {
  const query = `*[_type == "subject"] | order(name asc) {
    value.current
  }`;
  const subjects = await client.fetch(query);
  return subjects.map((s: any) => s.value.current);
}

// Get all unique subject-year combinations
export async function getSubjectYearCombinations(): Promise<{academicYear: string, subject: string}[]> {
  const query = `*[_type == "note"] {
    academicYear,
    "subject": subject->value.current
  } | order(academicYear asc, subject asc)`;
  
  const results = await client.fetch(query);
  
  // Get unique combinations
  const uniqueCombinations = results.reduce((acc: any[], note: any) => {
    const exists = acc.some(item =>
      item.academicYear === note.academicYear && item.subject === note.subject
    );
    if (!exists) {
      acc.push({
        academicYear: note.academicYear,
        subject: note.subject
      });
    }
    return acc;
  }, []);
  
  return uniqueCombinations;
}

// Helper function to get subject label from value
export function getSubjectLabel(subjectValue: string): string {
  const subjectLabels: Record<string, string> = {
    'anatomy': 'Anatomy',
    'physiology': 'Physiology',
    'biochemistry': 'Biochemistry',
    'pathology': 'Pathology',
    'pharmacology': 'Pharmacology',
    'microbiology': 'Microbiology',
    'forensic-medicine': 'Forensic Medicine',
    'community-medicine': 'Community Medicine',
    'ent': 'ENT',
    'ophthalmology': 'Ophthalmology',
    'medicine': 'Medicine',
    'surgery': 'Surgery',
    'obgyn': 'Obstetrics & Gynecology',
    'pediatrics': 'Pediatrics',
    'orthopedics': 'Orthopedics',
    'dermatology': 'Dermatology',
    'psychiatry': 'Psychiatry',
    'radiology': 'Radiology',
    'anesthesiology': 'Anesthesiology',
  };
  
  return subjectLabels[subjectValue] || subjectValue;
}

// Helper function to get subject value from subject object
export function getSubjectValue(subject: Subject | { _ref: string } | undefined): string {
  if (!subject) return '';
  
  // If it's a populated subject object
  if ('value' in subject && subject.value?.current) {
    return subject.value.current;
  }
  
  // If it's a reference, we can't get the value without another query
  // This should be handled by ensuring subjects are populated in queries
  return '';
}

// Helper function to get subject name from subject object
export function getSubjectName(subject: Subject | { _ref: string } | undefined): string {
  if (!subject) return 'No subject';
  
  // If it's a populated subject object
  if ('name' in subject) {
    return subject.name;
  }
  
  // If it's a reference, we can't get the name without another query
  // This should be handled by ensuring subjects are populated in queries
  return 'Unknown subject';
}

// Helper function to get year label from value
export function getYearLabel(yearValue: string): string {
  const yearLabels: Record<string, string> = {
    'third-year': '3rd Year MBBS',
    'fourth-year': '4th Year MBBS',
    'fifth-year': '5th Year MBBS',
  };
  
  return yearLabels[yearValue] || yearValue;
}

// Helper function to get year color scheme
export function getYearColorScheme(yearValue: string) {
  const colorSchemes: Record<string, {bg: string, border: string}> = {
    'third-year': {
      bg: 'bg-gradient-to-r from-blue-50 to-indigo-50',
      border: 'border-blue-500'
    },
    'fourth-year': {
      bg: 'bg-gradient-to-r from-green-50 to-emerald-50',
      border: 'border-green-500'
    },
    'fifth-year': {
      bg: 'bg-gradient-to-r from-purple-50 to-pink-50',
      border: 'border-purple-500'
    }
  };
  
  return colorSchemes[yearValue] || { bg: 'bg-gray-50', border: 'border-gray-500' };
}

// Helper function to check if a note has all essential fields
export function hasAllEssentialFields(note: Note): boolean {
  return !!(
    note.title &&
    note.slug &&
    note.price !== null && note.price !== undefined &&
    note.academicYear &&
    note.subject
  );
}

// Helper function to get incomplete notes (missing essential fields)
export function getIncompleteNotes(notes: Note[]): Note[] {
  return notes.filter(note => !hasAllEssentialFields(note));
}

// Helper function to get complete notes (has all essential fields)
export function getCompleteNotes(notes: Note[]): Note[] {
  return notes.filter(note => hasAllEssentialFields(note));
}

// Get active slideshow images
export async function getActiveSlideshow(): Promise<Slideshow | null> {
  const query = `*[_type == "slideshow" && isActive == true][0] {
    _id,
    _type,
    title,
    images[]{
      _key,
      _type,
      asset->{
        _id,
        _type,
        url,
        metadata
      },
      alt,
      caption
    },
    isActive,
    createdAt,
    updatedAt
  }`;
  
  return await client.fetch(query);
}

// Get all active YouTube videos
export async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  const query = `*[_type == "youtubeVideo" && isActive == true] | order(order asc, createdAt asc) {
    _id,
    _type,
    title,
    youtubeUrl,
    description,
    order,
    isActive,
    createdAt,
    updatedAt
  }`;
  
  return await client.fetch(query);
}

// Helper function to extract YouTube video ID from URL
export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Helper function to get YouTube thumbnail URL
export function getYouTubeThumbnail(url: string, quality: 'default' | 'medium' | 'high' = 'default'): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  
  const qualityMap = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault'
  };
  
  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
}
