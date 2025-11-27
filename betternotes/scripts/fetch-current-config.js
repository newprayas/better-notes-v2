import { createClient } from '@sanity/client'
import fs from 'fs'
import path from 'path'

// Initialize the Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't1y8nndf',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-04-01',
  token: process.env.SANITY_API_TOKEN,
})

async function fetchCurrentConfig() {
  console.log('Fetching current configuration from Sanity Studio...')
  
  try {
    // Step 1: Fetch all subjects
    console.log('Fetching subjects from Sanity...')
    const subjects = await client.fetch(`*[_type == "subject"]`)
    console.log(`Found ${subjects.length} subjects`)
    
    // Step 2: Fetch all notes with their subject references
    console.log('Fetching notes from Sanity...')
    const notes = await client.fetch(`
      *[_type == "note"]{
        _id,
        title,
        price,
        academicYear,
        subject->{
          name
        }
      }
    `)
    console.log(`Found ${notes.length} notes`)
    
    // Step 3: Group notes by year and subject
    const configMap = new Map()
    
    // First, create entries for each subject with their notes
    notes.forEach(note => {
      const year = note.academicYear
      const subjectName = note.subject ? note.subject.name : 'No Subject'
      
      // Create a key for year-subject combination
      const key = `${year}-${subjectName}`
      
      if (!configMap.has(key)) {
        configMap.set(key, {
          year: year,
          subject: subjectName,
          notes: []
        })
      }
      
      // Add note to the appropriate group
      configMap.get(key).notes.push({
        title: note.title,
        price: note.price.toString()
      })
    })
    
    // Step 4: Convert to array and sort by year then subject
    const configArray = Array.from(configMap.values())
    
    // Sort order: third-year, fourth-year, fifth-year
    const yearOrder = { 'third-year': 1, 'fourth-year': 2, 'fifth-year': 3 }
    
    configArray.sort((a, b) => {
      const yearDiff = (yearOrder[a.year] || 999) - (yearOrder[b.year] || 999)
      if (yearDiff !== 0) return yearDiff
      return a.subject.localeCompare(b.subject)
    })
    
    // Step 5: Format as JavaScript module with the requested structure
    const configContent = `// Current Configuration from Sanity Studio
// Generated on: ${new Date().toISOString()}
// Total Subjects: ${subjects.length}
// Total Notes: ${notes.length}

const currentConfig = ${JSON.stringify(configArray, null, 2)}

export default currentConfig
`
    
    // Step 6: Write to current-config.js file
    const outputPath = path.join(process.cwd(), 'current-config.js')
    fs.writeFileSync(outputPath, configContent, 'utf8')
    
    console.log('\n=== Configuration Export Complete ===')
    console.log(`✅ Exported ${subjects.length} subjects and ${notes.length} notes`)
    console.log(`📁 File saved to: ${outputPath}`)
    console.log('\nConfiguration structure:')
    
    // Print summary by year
    const yearSummary = {}
    configArray.forEach(item => {
      if (!yearSummary[item.year]) {
        yearSummary[item.year] = { subjects: 0, notes: 0 }
      }
      yearSummary[item.year].subjects++
      yearSummary[item.year].notes += item.notes.length
    })
    
    Object.entries(yearSummary).forEach(([year, stats]) => {
      console.log(`  ${year}: ${stats.subjects} subjects, ${stats.notes} notes`)
    })
    
  } catch (error) {
    console.error('❌ Error fetching configuration:', error)
    process.exit(1)
  }
}

// Run the script
fetchCurrentConfig()