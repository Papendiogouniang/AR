import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Event from '../models/Event.js';
import { authenticate as auth } from '../middleware/auth.js';

const router = express.Router();

// Configuration multer pour upload d'images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/events';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Seules les images sont autorisées'), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// GET /api/events - Récupérer tous les événements
router.get('/', async (req, res) => {
  try {
    const { category, featured, status = 'published' } = req.query;
    
    let filter = { status };
    
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const events = await Event.find(filter)
      .populate('organizer', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Erreur récupération événements:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des événements'
    });
  }
});

// GET /api/events/:id - Récupérer un événement par ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Erreur récupération événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'événement'
    });
  }
});

// POST /api/events - Créer un nouvel événement
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const {
      title,
      description,
      shortDescription,
      date,
      time,
      location,
      address,
      price,
      capacity,
      category,
      isFeatured,
      tags
    } = req.body;

    // Validation des champs requis
    if (!title || !description || !date || !time || !location || !address || !price || !capacity || !category) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis'
      });
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      shortDescription: shortDescription?.trim() || '',
      date: new Date(date),
      time,
      location: location.trim(),
      address: address.trim(),
      price: Number(price),
      capacity: Number(capacity),
      availableTickets: Number(capacity),
      category,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      organizer: req.user.id,
      createdBy: req.user.id,
      status: 'published',
      isActive: true
    };

    // Gestion de l'image
    if (req.file) {
      eventData.image = `/uploads/events/${req.file.filename}`;
    }

    // Gestion des tags
    if (tags) {
      if (typeof tags === 'string') {
        eventData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      } else if (Array.isArray(tags)) {
        eventData.tags = tags.filter(tag => tag && tag.trim());
      }
    }

    const event = new Event(eventData);
    await event.save();

    // Populer l'organisateur pour la réponse
    await event.populate('organizer', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: event
    });
  } catch (error) {
    console.error('Erreur création événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'événement',
      error: error.message
    });
  }
});

// PUT /api/events/:id - Modifier un événement
router.put('/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'organisateur ou admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à modifier cet événement'
      });
    }

    const updateData = { ...req.body };
    
    // Gestion de l'image
    if (req.file) {
      updateData.image = `/uploads/events/${req.file.filename}`;
    }

    // Gestion des tags
    if (updateData.tags) {
      if (typeof updateData.tags === 'string') {
        updateData.tags = updateData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('organizer', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Événement modifié avec succès',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Erreur modification événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la modification de l\'événement'
    });
  }
});

// DELETE /api/events/:id - Supprimer un événement
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'organisateur ou admin
    if (event.organizer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Non autorisé à supprimer cet événement'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Événement supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur suppression événement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de l\'événement'
    });
  }
});

export default router;