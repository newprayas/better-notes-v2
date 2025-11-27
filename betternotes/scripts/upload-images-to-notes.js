import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { dirname, join } from 'path'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

// Get the current directory path (already defined above)

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't1y8nndf',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-04-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
})

// Configuration
const UPLOAD_DIR = path.join(__dirname, '..', '..', '[TO UPLOAD FILES]')
const CONFIG_PATH = path.join(__dirname, '..', '..', 'current-config.js')
const SUPPORTED_FORMATS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const DELAY_BETWEEN_UPLOADS = 1000 // 1 second delay to avoid rate limiting

// String normalization function
function normalizeString(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
}

// Calculate string similarity (Levenshtein distance)
function calculateSimilarity(str1, str2) {
  const s1 = normalizeString(str1)
  const s2 = normalizeString(str2)
  
  // Simple similarity based on common words
  const words1 = s1.split(' ')
  const words2 = s2.split(' ')
  
  let commonWords = 0
  words1.forEach(word1 => {
    if (words2.includes(word1)) {
      commonWords++
    }
  })
  
  const totalWords = Math.max(words1.length, words2.length)
  return totalWords > 0 ? commonWords / totalWords : 0
}

// Find the best matching note for a folder
function findMatchingNote(folderName, notes) {
  let bestMatch = null
  let bestScore = 0
  
  notes.forEach(note => {
    const score = calculateSimilarity(folderName, note.title)
    if (score > bestScore && score > 0.3) { // Minimum 30% similarity
      bestScore = score
      bestMatch = note
    }
  })
  
  return { match: bestMatch, score: bestScore }
}

// Upload image to Sanity assets
async function uploadImage(imagePath, altText) {
  try {
    const imageBuffer = fs.readFileSync(imagePath)
    const filename = path.basename(imagePath)
    
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: filename,
      originalFilename: filename,
    })
    
    return {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id
      },
      alt: altText || filename.replace(/\.[^/.]+$/, '') // Remove file extension
    }
  } catch (error) {
    console.error(`❌ Error uploading image ${imagePath}:`, error.message)
    return null
  }
}

// Update note with images
async function updateNoteWithImages(noteId, images) {
  try {
    await client
      .patch(noteId)
      .set({ images: images })
      .commit()
    
    return true
  } catch (error) {
    console.error(`❌ Error updating note ${noteId}:`, error.message)
    return false
  }
}

// Get all image files from a directory
function getImageFiles(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return []
  }
  
  const files = fs.readdirSync(dirPath)
  return files
    .filter(file => {
      const ext = path.extname(file).toLowerCase()
      return SUPPORTED_FORMATS.includes(ext)
    })
    .map(file => path.join(dirPath, file))
}

// Main upload function
async function uploadImagesToNotes() {
  console.log('🚀 Starting image upload process...')
  
  try {
    // Load current config
    console.log('📋 Loading current configuration...')
    const configModule = await import(CONFIG_PATH)
    const currentConfig = configModule.default
    
    // Fetch all notes from Sanity
    console.log('📥 Fetching notes from Sanity...')
    const notes = await client.fetch(`*[_type == "note"]`)
    console.log(`Found ${notes.length} notes in Sanity`)
    
    // Create a map of note titles to note objects
    const noteMap = {}
    notes.forEach(note => {
      noteMap[note.title] = note
    })
    
    // Check if upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      throw new Error(`Upload directory not found: ${UPLOAD_DIR}`)
    }
    
    // Process each subject folder
    const subjectFolders = fs.readdirSync(UPLOAD_DIR, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
    
    console.log(`Found ${subjectFolders.length} subject folders`)
    
    let totalProcessed = 0
    let totalUploaded = 0
    let totalSkipped = 0
    let totalErrors = 0
    
    // Process each note folder
    for (const subjectFolder of subjectFolders) {
      const subjectPath = path.join(UPLOAD_DIR, subjectFolder)
      const noteFolders = fs.readdirSync(subjectPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)
      
      console.log(`\n📂 Processing subject: ${subjectFolder}`)
      console.log(`   Found ${noteFolders.length} note folders`)
      
      for (const noteFolder of noteFolders) {
        totalProcessed++
        const notePath = path.join(subjectPath, noteFolder)
        const imageFiles = getImageFiles(notePath)
        
        if (imageFiles.length === 0) {
          console.log(`   ⏭️  Skipping ${noteFolder} (no images)`)
          totalSkipped++
          continue
        }
        
        // Find matching note
        const { match: matchingNote, score } = findMatchingNote(noteFolder, currentConfig.flatMap(item => item.notes))
        
        if (!matchingNote) {
          console.log(`   ⚠️  No match found for: ${noteFolder}`)
          totalSkipped++
          continue
        }
        
        // Get the full note object from Sanity
        const sanityNote = noteMap[matchingNote.title]
        if (!sanityNote) {
          console.log(`   ⚠️  Note not found in Sanity: ${matchingNote.title}`)
          totalSkipped++
          continue
        }
        
        console.log(`   🎯 Matched: ${noteFolder} -> ${matchingNote.title} (${Math.round(score * 100)}% confidence)`)
        console.log(`   📸 Found ${imageFiles.length} images`)
        
        // Check if note already has images
        if (sanityNote.images && sanityNote.images.length > 0) {
          console.log(`   ⚠️  Note already has ${sanityNote.images.length} images. Skipping to avoid overwrite.`)
          totalSkipped++
          continue
        }
        
        // Upload images
        const uploadedImages = []
        for (let i = 0; i < imageFiles.length; i++) {
          const imagePath = imageFiles[i]
          const filename = path.basename(imagePath, path.extname(imagePath))
          
          console.log(`     📤 Uploading ${i + 1}/${imageFiles.length}: ${filename}`)
          
          const imageObject = await uploadImage(imagePath, `${matchingNote.title} - ${filename}`)
          
          if (imageObject) {
            uploadedImages.push(imageObject)
            totalUploaded++
            
            // Add delay to avoid rate limiting
            if (i < imageFiles.length - 1) {
              await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_UPLOADS))
            }
          } else {
            totalErrors++
          }
        }
        
        // Update note with images
        if (uploadedImages.length > 0) {
          console.log(`   💾 Updating note with ${uploadedImages.length} images...`)
          const success = await updateNoteWithImages(sanityNote._id, uploadedImages)
          
          if (success) {
            console.log(`   ✅ Successfully updated: ${matchingNote.title}`)
          } else {
            totalErrors++
          }
        }
      }
    }
    
    // Summary
    console.log('\n=== Upload Complete ===')
    console.log(`📊 Total processed: ${totalProcessed}`)
    console.log(`✅ Total uploaded: ${totalUploaded}`)
    console.log(`⏭️  Total skipped: ${totalSkipped}`)
    console.log(`❌ Total errors: ${totalErrors}`)
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
uploadImagesToNotes()