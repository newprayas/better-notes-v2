import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Load environment variables from .env.local
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '..', '.env.local') })

// Initialize Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 't1y8nndf',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2023-04-01',
  token: process.env.SANITY_API_WRITE_TOKEN,
})

async function testPermissions() {
  console.log('🔍 Testing API token permissions...')
  
  try {
    // Test 1: Read permissions
    console.log('\n📖 Testing read permissions...')
    const notes = await client.fetch(`*[_type == "note"][0...5]`)
    console.log(`✅ Read successful: Found ${notes.length} notes`)
    
    // Test 2: Try to create a simple test document
    console.log('\n📝 Testing document create permissions...')
    const testDoc = {
      _type: 'note',
      title: 'TEST DOCUMENT - DELETE ME',
      price: '0',
      slug: {
        _type: 'slug',
        current: 'test-delete-me'
      }
    }
    
    const createdDoc = await client.create(testDoc)
    console.log(`✅ Document create successful: ${createdDoc._id}`)
    
    // Test 3: Try to upload a tiny test image
    console.log('\n📸 Testing asset upload permissions...')
    const testImageData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64')
    
    const testAsset = await client.assets.upload('image', testImageData, {
      filename: 'test.png',
    })
    console.log(`✅ Asset upload successful: ${testAsset._id}`)
    
    // Cleanup
    console.log('\n🧹 Cleaning up test data...')
    await client.delete(createdDoc._id)
    await client.assets.delete(testAsset._id)
    console.log('✅ Cleanup complete')
    
  } catch (error) {
    console.error('❌ Permission test failed:', error.message)
    console.error('Full error:', error)
  }
  
  // Test 4: Check token info
  console.log('\n🔑 Checking token configuration...')
  console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
  console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET)
  console.log('Token length:', process.env.SANITY_API_WRITE_TOKEN ? process.env.SANITY_API_WRITE_TOKEN.length : 'undefined')
  console.log('Token starts with:', process.env.SANITY_API_WRITE_TOKEN ? process.env.SANITY_API_WRITE_TOKEN.substring(0, 10) + '...' : 'undefined')
}

testPermissions()