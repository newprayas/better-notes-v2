import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { noteSchema, discountCodeSchema, subjectSchema, slideshowSchema, youtubeVideoSchema } from './lib/sanity/schema'

const config = defineConfig({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't1y8nndf',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  plugins: [
    structureTool({
      structure: (S: any) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('🎠 Slideshow')
              .schemaType('slideshow')
              .child(S.documentTypeList('slideshow').title('Slideshow Images')),
            S.listItem()
              .title('📺 YouTube Videos')
              .schemaType('youtubeVideo')
              .child(S.documentTypeList('youtubeVideo').title('YouTube Videos')),
            S.listItem()
              .title('Notes')
              .schemaType('note')
              .child(S.documentTypeList('note').title('Notes')),
            S.listItem()
              .title('Subjects')
              .schemaType('subject')
              .child(S.documentTypeList('subject').title('Subjects')),
            S.listItem()
              .title('Discount Codes')
              .schemaType('discountCode')
              .child(S.documentTypeList('discountCode').title('Discount Codes')),
          ]),
    }),
    visionTool(),
  ],
  schema: {
    types: [noteSchema, discountCodeSchema, subjectSchema, slideshowSchema, youtubeVideoSchema],
  },
})

export default config