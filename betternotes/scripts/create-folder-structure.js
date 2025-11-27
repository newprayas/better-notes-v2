import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Get the current directory path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Path to the current-config.js file in the project root
const configPath = path.join(__dirname, '..', '..', 'current-config.js')

async function createFolderStructure() {
  console.log('🚀 Creating folder structure based on current-config.js...')
  
  try {
    // Import the current config module
    const configModule = await import(configPath)
    const currentConfig = configModule.default
    
    // Create the parent directory [TO UPLOAD FILES] in the project root
    const parentDir = path.join(__dirname, '..', '..', '[TO UPLOAD FILES]')
    
    // Remove existing directory if it exists
    if (fs.existsSync(parentDir)) {
      console.log('🗑️  Removing existing [TO UPLOAD FILES] directory...')
      fs.rmSync(parentDir, { recursive: true, force: true })
    }
    
    // Create the parent directory
    fs.mkdirSync(parentDir, { recursive: true })
    console.log(`📁 Created parent directory: ${parentDir}`)
    
    let totalSubjects = 0
    let totalNotes = 0
    
    // Process each year and subject
    currentConfig.forEach(item => {
      const { year, subject, notes } = item
      
      // Clean subject name for folder (remove special characters and extra spaces)
      const cleanSubjectName = subject
        .replace(/[🎉🥳❤️]/g, '') // Remove emojis
        .replace(/^\s+|\s+$/g, '') // Remove leading/trailing spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      
      // Create subject directory
      const subjectDir = path.join(parentDir, cleanSubjectName)
      fs.mkdirSync(subjectDir, { recursive: true })
      totalSubjects++
      console.log(`  📂 Created subject folder: ${cleanSubjectName}`)
      
      // Create note subfolders
      notes.forEach(note => {
        const { title } = note
        
        // Clean note title for folder name
        const cleanNoteName = title
          .replace(/[^\w\s-()[\]]/g, '') // Remove special characters except brackets, hyphens, and parentheses
          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
          .replace(/^\s+|\s+$/g, '') // Remove leading/trailing spaces
        
        // Create note subfolder
        const noteDir = path.join(subjectDir, cleanNoteName)
        fs.mkdirSync(noteDir, { recursive: true })
        totalNotes++
        console.log(`    📄 Created note folder: ${cleanNoteName}`)
      })
    })
    
    console.log('\n=== Folder Structure Created Successfully ===')
    console.log(`📁 Parent directory: ${parentDir}`)
    console.log(`📂 Total subject folders created: ${totalSubjects}`)
    console.log(`📄 Total note folders created: ${totalNotes}`)
    
    // Create a summary file
    const summaryContent = `# Folder Structure Summary

Generated on: ${new Date().toISOString()}
Total Subjects: ${totalSubjects}
Total Notes: ${totalNotes}

## Structure:
${currentConfig.map(item => {
  const cleanSubjectName = item.subject
    .replace(/[🎉🥳❤️]/g, '')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\s+/g, ' ')
  
  return `### ${cleanSubjectName} (${item.year})
${item.notes.map(note => {
  const cleanNoteName = note.title
    .replace(/[^\w\s-()[\]]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
  
  return `- ${cleanNoteName} - Price: ${note.price}`
}).join('\n')}
`
}).join('\n')}
`
    
    fs.writeFileSync(path.join(parentDir, 'README.md'), summaryContent)
    console.log(`📝 Created summary file: ${path.join(parentDir, 'README.md')}`)
    
  } catch (error) {
    console.error('❌ Error creating folder structure:', error)
    process.exit(1)
  }
}

// Run the script
createFolderStructure()