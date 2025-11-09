// Note schema for Sanity CMS
export const noteSchema = {
  name: 'note',
  title: 'Note',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule: import('sanity').Rule) => Rule.min(0),
    },
    {
      name: 'originalPrice',
      title: 'Original Price',
      type: 'number',
    },
    {
      name: 'pageNumber',
      title: 'Page Number',
      type: 'number',
      validation: (Rule: import('sanity').Rule) => Rule.min(1),
    },
    {
      name: 'images',
      title: '📸 Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Describe the image for accessibility and SEO',
            },
          ],
          preview: {
            select: {
              title: 'alt',
              media: 'asset',
            },
            prepare: (selection: { title?: string; media?: any }) => ({
              title: selection.title || 'Untitled Image',
              media: selection.media,
            }),
          },
        },
      ],
      options: {
        layout: 'grid',
        addNewButton: '+ Add Image',
      },
      description: '🎯 **PRO TIP**: Select multiple image files on your computer and drag them here all at once! You can also paste images from clipboard.',
    },
    {
      name: 'academicYear',
      title: 'Academic Year',
      type: 'string',
      options: {
        list: [
          { title: 'Third Year', value: 'third-year' },
          { title: 'Fourth Year', value: 'fourth-year' },
          { title: 'Fifth Year', value: 'fifth-year' },
        ],
      },
    },
    {
      name: 'subject',
      title: 'Subject',
      type: 'reference',
      to: [{ type: 'subject' }],
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subject.name',
    },
  },
};

// Discount code schema for Sanity CMS
export const discountCodeSchema = {
  name: 'discountCode',
  title: 'Discount Code',
  type: 'document',
  fields: [
    {
      name: 'code',
      title: 'Code',
      type: 'string',
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'discountPercentage',
      title: 'Discount Percentage',
      type: 'number',
      validation: (Rule: import('sanity').Rule) => Rule.required().min(1).max(100),
    },
    {
      name: 'validFrom',
      title: 'Valid From',
      type: 'datetime',
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'validUntil',
      title: 'Valid Until',
      type: 'datetime',
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'usageLimit',
      title: 'Usage Limit',
      type: 'number',
    },
    {
      name: 'usedCount',
      title: 'Used Count',
      type: 'number',
      initialValue: 0,
    },
  ],
  preview: {
    select: {
      title: 'code',
      subtitle: 'discountPercentage',
    },
  },
};

// Subject schema for Sanity CMS
export const subjectSchema = {
  name: 'subject',
  title: 'Subject',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Subject Name',
      type: 'string',
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'value',
      title: 'Value (for URLs)',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional description of the subject',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'value.current',
    },
  },
};

// Slideshow schema for Sanity CMS
export const slideshowSchema = {
  name: 'slideshow',
  title: '🎠 Slideshow Images',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional title for this slideshow collection',
    },
    {
      name: 'images',
      title: '📸 Slideshow Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'alt',
              title: 'Alt Text',
              type: 'string',
              description: 'Describe the image for accessibility and SEO',
            },
            {
              name: 'caption',
              title: 'Caption',
              type: 'text',
              description: 'Optional caption to display with the image',
            },
          ],
          preview: {
            select: {
              title: 'alt',
              media: 'asset',
            },
            prepare: (selection: { title?: string; media?: any }) => ({
              title: selection.title || 'Untitled Image',
              media: selection.media,
            }),
          },
        },
      ],
      options: {
        layout: 'grid',
        addNewButton: '+ Add Slideshow Image',
      },
      description: '🎯 **PRO TIP**: Select multiple image files on your computer and drag them here all at once! You can also paste images from clipboard. These images will be displayed in the homepage slideshow.',
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this slideshow is currently active and should be displayed',
    },
  ],
  preview: {
    select: {
      title: 'title',
      imageCount: 'images',
      isActive: 'isActive',
    },
    prepare: (selection: { title?: string; imageCount?: any[]; isActive?: boolean }) => ({
      title: selection.title || 'Untitled Slideshow',
      subtitle: `${selection.imageCount?.length || 0} images - ${selection.isActive ? 'Active' : 'Inactive'}`,
    }),
  },
};

// YouTube video schema for Sanity CMS
export const youtubeVideoSchema = {
  name: 'youtubeVideo',
  title: '📺 YouTube Video',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Video Title',
      type: 'string',
      validation: (Rule: import('sanity').Rule) => Rule.required(),
    },
    {
      name: 'youtubeUrl',
      title: 'YouTube URL',
      type: 'url',
      description: 'Paste the full YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)',
      validation: (Rule: import('sanity').Rule) =>
        Rule.required()
          .uri({ scheme: ['http', 'https'] })
          .custom((value: string) => {
            if (!value) return true;
            // Check if it's a valid YouTube URL
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
            return youtubeRegex.test(value) ? true : 'Please enter a valid YouTube URL';
          }),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Optional description of the video content',
    },
    {
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower numbers appear first in the slideshow',
      initialValue: 0,
    },
    {
      name: 'isActive',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
      description: 'Whether this video should be displayed in the slideshow',
    },
  ],
  preview: {
    select: {
      title: 'title',
      url: 'youtubeUrl',
      isActive: 'isActive',
    },
    prepare: (selection: { title?: string; url?: string; isActive?: boolean }) => {
      // Extract video ID from URL for thumbnail
      let videoId = '';
      if (selection.url) {
        const match = selection.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
        if (match) {
          videoId = match[1];
        }
      }
      
      return {
        title: selection.title || 'Untitled Video',
        subtitle: videoId ? `YouTube ID: ${videoId} - ${selection.isActive ? 'Active' : 'Inactive'}` : 'Invalid URL',
      };
    },
  },
};