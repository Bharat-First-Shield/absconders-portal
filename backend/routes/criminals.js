const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Define storage directories
const DATA_DIR = path.join(process.cwd(), 'data');
const CRIMINALS_FILE = path.join(DATA_DIR, 'criminals.json');
const MEDIA_DIR = path.join(DATA_DIR, 'media');
const IMAGES_DIR = path.join(MEDIA_DIR, 'images');
const DOCUMENTS_DIR = path.join(MEDIA_DIR, 'documents');

// Ensure directories exist
[DATA_DIR, MEDIA_DIR, IMAGES_DIR, DOCUMENTS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Initialize criminals.json if it doesn't exist
if (!fs.existsSync(CRIMINALS_FILE)) {
  fs.writeFileSync(CRIMINALS_FILE, JSON.stringify([], null, 2));
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine destination based on file type
    const dest = file.fieldname === 'images' ? IMAGES_DIR : DOCUMENTS_DIR;
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueId}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'images') {
    // Allow only image files
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
  } else if (file.fieldname === 'documents') {
    // Allow only document files
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Only PDF and Word documents are allowed!'), false);
    }
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 20 // Maximum 20 files total
  }
});

// Add criminal record
router.post('/', upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'documents', maxCount: 10 }
]), async (req, res) => {
  try {
    const criminals = JSON.parse(fs.readFileSync(CRIMINALS_FILE, 'utf8'));
    const criminalId = uuidv4();
    
    // Process uploaded files
    const images = req.files.images ? req.files.images.map(file => ({
      id: path.parse(file.filename).name,
      filename: file.filename,
      originalName: file.originalname,
      type: file.mimetype,
      uploadedAt: new Date()
    })) : [];

    const documents = req.files.documents ? req.files.documents.map(file => ({
      id: path.parse(file.filename).name,
      filename: file.filename,
      originalName: file.originalname,
      type: file.mimetype,
      uploadedAt: new Date()
    })) : [];

    // Parse identifiable marks
    let identifiableMarks = [];
    try {
      identifiableMarks = JSON.parse(req.body.identifiableMarks || '[]');
    } catch (e) {
      console.warn('Failed to parse identifiable marks:', e);
    }

    // Create criminal record
    const criminal = {
      id: criminalId,
      name: req.body.name,
      age: parseInt(req.body.age),
      gender: req.body.gender,
      fatherName: req.body.fatherName,
      address: req.body.address,
      firNumber: req.body.firNumber,
      idProof: {
        type: req.body.idProofType,
        number: req.body.idProofNumber
      },
      identifiableMarks,
      state: req.body.state,
      district: req.body.district,
      policeStation: req.body.policeStation,
      warrants: req.body.warrantDetails ? [{
        id: uuidv4(),
        details: req.body.warrantDetails,
        court: req.body.warrantCourt,
        caseNumber: req.body.warrantCaseNumber,
        issuedDate: new Date(),
        isActive: true
      }] : [],
      images,
      documents,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    criminals.push(criminal);
    await fs.promises.writeFile(CRIMINALS_FILE, JSON.stringify(criminals, null, 2));
    
    res.status(201).json({ id: criminalId, ...criminal });
  } catch (error) {
    console.error('Error creating criminal record:', error);
    
    // Clean up uploaded files if there was an error
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        fs.unlink(file.path, err => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to create criminal record',
      details: error.message 
    });
  }
});

// Get criminal by ID
router.get('/:id', async (req, res) => {
  try {
    const criminals = JSON.parse(fs.readFileSync(CRIMINALS_FILE, 'utf8'));
    const criminal = criminals.find(c => c.id === req.params.id);
    
    if (!criminal) {
      return res.status(404).json({ error: 'Criminal not found' });
    }
    
    res.json(criminal);
  } catch (error) {
    console.error('Error getting criminal by ID:', error);
    res.status(500).json({ error: 'Failed to get criminal record' });
  }
});

// Get image
router.get('/images/:filename', async (req, res) => {
  try {
    const imagePath = path.join(IMAGES_DIR, req.params.filename);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    res.sendFile(imagePath);
  } catch (error) {
    console.error('Error getting image:', error);
    res.status(500).json({ error: 'Failed to get image' });
  }
});

// Get document
router.get('/documents/:filename', async (req, res) => {
  try {
    const docPath = path.join(DOCUMENTS_DIR, req.params.filename);
    
    if (!fs.existsSync(docPath)) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    res.download(docPath);
  } catch (error) {
    console.error('Error getting document:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

// Search criminals
router.get('/search', async (req, res) => {
  try {
    const criminals = JSON.parse(fs.readFileSync(CRIMINALS_FILE, 'utf8'));
    const query = req.query;
    
    const results = criminals.filter(criminal => {
      for (const [key, value] of Object.entries(query)) {
        if (value) {
          if (key === 'name' && !criminal.name.toLowerCase().includes(value.toLowerCase())) {
            return false;
          }
          if (key === 'firNumber' && !criminal.firNumber.toLowerCase().includes(value.toLowerCase())) {
            return false;
          }
          if (key === 'district' && criminal.district !== value) {
            return false;
          }
          if (key === 'state' && criminal.state !== value) {
            return false;
          }
          if (key === 'status' && criminal.status !== value) {
            return false;
          }
        }
      }
      return true;
    });
    
    res.json(results);
  } catch (error) {
    console.error('Error searching criminals:', error);
    res.status(500).json({ error: 'Failed to search criminals' });
  }
});

module.exports = router;