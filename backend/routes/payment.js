import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { authenticate as auth } from '../middleware/auth.js';
import Ticket from '../models/Ticket.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import emailService from '../services/emailService.js';

const router = express.Router();

// POST /api/payment/initiate - Initier un paiement
router.post('/initiate', auth, async (req, res) => {
  try {
    const { eventId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Vérifier l'événement
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier la disponibilité
    if (event.availableTickets < quantity) {
      return res.status(400).json({
        success: false,
        message: 'Pas assez de billets disponibles'
      });
    }

    // Calculer le montant total
    const totalAmount = event.price * quantity;

    // Générer un ID unique pour la transaction
    const transactionId = `KANZ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Créer le billet en attente
    const ticket = new Ticket({
      ticketId: `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      event: eventId,
      user: userId,
      quantity,
      totalPrice: totalAmount,
      currency: 'FCFA',
      status: 'pending',
      paymentMethod: 'intouch',
      transactionId,
      qrCode: {
        data: `${process.env.QR_CODE_BASE_URL}/${transactionId}`,
        generated: true
      }
    });

    await ticket.save();

    // Préparer les données pour InTouch
    const paymentData = {
      idFromClient: transactionId,
      additionnalInfos: {
        recipientEmail: req.user.email,
        recipientFirstName: req.user.firstName,
        recipientLastName: req.user.lastName,
        destinataire: req.user.phone || '221000000000',
        partner_name: 'Kanzey.co',
        return_url: `${process.env.FRONTEND_URL}/payment/success?transaction=${transactionId}`,
        cancel_url: `${process.env.FRONTEND_URL}/payment/cancel?transaction=${transactionId}`,
        currency: 'XOF'
      },
      amount: totalAmount,
      callback: `${process.env.FRONTEND_URL}/api/payment/callback`,
      recipientNumber: req.user.phone || '221000000000',
      serviceCode: 'PAIEMENTMARCHANDOMQRCODE'
    };

    // URL de redirection InTouch
    const redirectUrl = `${process.env.INTOUCH_REDIRECT_URL}?` + 
      `merchant_id=${process.env.INTOUCH_MERCHANT_ID}&` +
      `secret_key=${process.env.INTOUCH_SECRET_KEY}&` +
      `amount=${totalAmount}&` +
      `transaction_id=${transactionId}&` +
      `return_url=${encodeURIComponent(paymentData.additionnalInfos.return_url)}&` +
      `cancel_url=${encodeURIComponent(paymentData.additionnalInfos.cancel_url)}`;

    res.json({
      success: true,
      message: 'Redirection vers le paiement',
      paymentUrl: redirectUrl,
      transactionId
    });

  } catch (error) {
    console.error('Erreur initiation paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'initiation du paiement'
    });
  }
});

// GET /api/payment/success - Succès du paiement
router.get('/success', async (req, res) => {
  try {
    const { transaction } = req.query;

    if (!transaction) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/error`);
    }

    // Trouver le billet
    const ticket = await Ticket.findOne({ transactionId: transaction })
      .populate('event')
      .populate('user');

    if (!ticket) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/error`);
    }

    // Marquer comme payé
    ticket.status = 'confirmed';
    ticket.paymentDate = new Date();
    await ticket.save();

    // Mettre à jour les billets disponibles
    await Event.findByIdAndUpdate(ticket.event._id, {
      $inc: { 
        availableTickets: -ticket.quantity,
        ticketsSold: ticket.quantity,
        revenue: ticket.totalPrice
      }
    });

    // Envoyer l'email avec le billet
    try {
      await emailService.sendTicketEmail(ticket.user, ticket, ticket.event);
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError);
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment/success?ticket=${ticket.ticketId}`);

  } catch (error) {
    console.error('Erreur traitement succès paiement:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/error`);
  }
});

// GET /api/payment/cancel - Annulation du paiement
router.get('/cancel', async (req, res) => {
  try {
    const { transaction } = req.query;

    if (transaction) {
      // Supprimer le billet en attente
      await Ticket.findOneAndDelete({ transactionId: transaction });
    }

    res.redirect(`${process.env.FRONTEND_URL}/payment/cancel`);
  } catch (error) {
    console.error('Erreur traitement annulation paiement:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/error`);
  }
});

// POST /api/payment/callback - Callback InTouch
router.post('/callback', async (req, res) => {
  try {
    const { idFromClient, status, amount } = req.body;

    console.log('Callback InTouch reçu:', req.body);

    const ticket = await Ticket.findOne({ transactionId: idFromClient })
      .populate('event')
      .populate('user');

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Transaction non trouvée'
      });
    }

    if (status === 'SUCCESS' || status === 'COMPLETED') {
      // Paiement réussi
      ticket.status = 'confirmed';
      ticket.paymentDate = new Date();
      await ticket.save();

      // Mettre à jour l'événement
      await Event.findByIdAndUpdate(ticket.event._id, {
        $inc: { 
          availableTickets: -ticket.quantity,
          ticketsSold: ticket.quantity,
          revenue: ticket.totalPrice
        }
      });

      // Envoyer l'email
      try {
        await emailService.sendTicketEmail(ticket.user, ticket, ticket.event);
      } catch (emailError) {
        console.error('Erreur envoi email:', emailError);
      }

    } else {
      // Paiement échoué
      ticket.status = 'failed';
      await ticket.save();
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Erreur callback paiement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement du callback'
    });
  }
});

export default router;