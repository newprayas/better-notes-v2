# 📸 Image Upload to Sanity Studio

This script uploads images from the `[TO UPLOAD FILES]` folder structure to the corresponding notes in your Sanity Studio.

## 📁 Folder Structure

The script expects this structure:
```
[TO UPLOAD FILES]/
├── Subject Name 1/
│   ├── Note Title 1/
│   │   ├── image1.jpg
│   │   ├── image2.png
│   │   └── ...
│   ├── Note Title 2/
│   │   └── ...
│   └── ...
├── Subject Name 2/
│   └── ...
└── README.md
```

## 🚀 How to Run

### Method 1: Using the Shell Script (Recommended)
```bash
cd betternotes/scripts
./upload-images-to-notes.sh
```

### Method 2: Direct Node.js
```bash
cd betternotes/scripts
node upload-images-to-notes.js
```

## ⚙️ Prerequisites

1. **Environment Variables**: Make sure your `.env.local` file contains:
   ```
   NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
   NEXT_PUBLIC_SANITY_DATASET=production
   SANITY_API_TOKEN=your_write_token
   ```

2. **API Token Permissions**: Your `SANITY_API_WRITE_TOKEN` MUST have:
   - **Developer or Editor permissions** (Contributor tokens only work with drafts)
   - **Asset creation permissions** (for uploading images)
   - **Document update permissions** (for updating notes with images)
   
   To get proper permissions:
   - Go to [sanity.io/manage](https://sanity.io/manage)
   - Select your project
   - Go to API → Tokens
   - Create a new token with **Developer** or **Editor** permissions
   - Make sure "Assets" and "Documents" are both enabled
   - **Note**: Contributor tokens only work with draft content, not production datasets

2. **Folder Structure**: Ensure you have the `[TO UPLOAD FILES]` directory with images organized by subject and note.

3. **Current Config**: The `current-config.js` file must exist in the project root.

## 🔧 How It Works

### 1. **Matching Algorithm**
- Compares folder names with note titles using string similarity
- Normalizes strings (lowercase, removes special characters)
- Requires minimum 30% similarity to match
- Shows confidence percentage for each match

### 2. **Image Upload Process**
- Supports: JPG, JPEG, PNG, GIF, WebP formats
- Uploads images to Sanity assets
- Creates proper image references with alt text
- Adds 1-second delay between uploads to avoid rate limiting

### 3. **Safety Features**
- **Skips notes that already have images** (prevents overwriting)
- **Shows match confidence** before uploading
- **Detailed error reporting** for failed uploads
- **Progress tracking** throughout the process

### 4. **Alt Text Generation**
- Format: `{Note Title} - {Image Filename}`
- Automatically removes file extensions
- Helps with SEO and accessibility

## 📊 Output Example

```
🚀 Starting image upload process...
📋 Loading current configuration...
📥 Fetching notes from Sanity...
Found 39 notes in Sanity
Found 16 subject folders

📂 Processing subject: Community Medicine
   Found 2 note folders
   🎯 Matched: Community medicine Full PROF WRITTEN notes -> Community medicine Full PROF WRITTEN notes (100% confidence)
   📸 Found 3 images
     📤 Uploading 1/3: image1
     📤 Uploading 2/3: image2
     📤 Uploading 3/3: image3
   💾 Updating note with 3 images...
   ✅ Successfully updated: Community medicine Full PROF WRITTEN notes

=== Upload Complete ===
📊 Total processed: 39
✅ Total uploaded: 45
⏭️  Total skipped: 12
❌ Total errors: 0
```

## ⚠️ Important Notes

1. **Backup**: The script won't overwrite notes that already have images
2. **Rate Limiting**: Built-in delays prevent API rate limiting
3. **Matching**: If a folder doesn't match well, it will be skipped
4. **File Formats**: Only common image formats are supported
5. **Permissions**: Requires write access to Sanity dataset

## 🔍 Troubleshooting

### "No match found for: [folder name]"
- The folder name doesn't match any note title well enough
- Try renaming the folder to be more similar to the note title
- Check the note title in `current-config.js`

### "Note already has X images. Skipping"
- Safety feature to prevent overwriting existing images
- If you want to re-upload, delete images from the note in Sanity Studio first

### "SANITY_API_TOKEN not found"
- Add `SANITY_API_WRITE_TOKEN` to your `.env.local` file
- Token must have write permissions for your dataset
### "Insufficient permissions; permission 'create' required" (RESOLVED)
- This was caused by environment variables not being loaded when running the script outside Next.js
- **FIX**: Added `dotenv` package and proper environment variable loading to the script
- If you still see this error, run `node test-token-permissions.js` to verify your token permissions

## ✅ Status Update

The image upload script is now working correctly! Recent improvements:
- ✅ Fixed environment variable loading issue
- ✅ Verified token permissions (document creation + asset upload)
- ✅ Successfully uploading images to Sanity
- ✅ Notes are being updated with image references
- ✅ Progress tracking shows 100% confidence matches

The script is currently running and processing images successfully.
- Your API token lacks asset creation permissions or has wrong permission level
- **Solution**: Create a new token at [sanity.io/manage](https://sanity.io/manage):
  1. Go to your project → API → Tokens
  2. Click "Add new token"
  3. Name it something like "Image Upload Token"
  4. Select **Developer** or **Editor** permissions (NOT Contributor)
  5. Make sure both "Assets" and "Documents" are enabled
  6. Copy the token and update your `.env.local` file
  7. **Important**: Contributor tokens only work with draft content, not production datasets


### "Upload directory not found"
- Make sure the `[TO UPLOAD FILES]` directory exists in the project root
- Run the folder creation script first if needed

## 🛠️ Customization

You can modify these settings in `upload-images-to-notes.js`:

- `SUPPORTED_FORMATS`: Add/remove supported image formats
- `DELAY_BETWEEN_UPLOADS`: Adjust delay between uploads (milliseconds)
- `MIN_SIMILARITY_THRESHOLD`: Change minimum similarity score (default: 0.3)

## 📝 Logs

The script provides detailed logging including:
- Match confidence scores
- Upload progress
- Success/failure status
- Final summary statistics

## 🆘 Need Help?

If you encounter issues:
1. Check your `.env.local` configuration
2. Verify folder structure
3. Ensure Sanity API token has write permissions
4. Check console output for specific error messages