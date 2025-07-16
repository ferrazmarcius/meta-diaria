const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { 
    getUserProfile, 
    createDebt, 
    getActiveDebt,
    createIncome,
    getIncomesForDebt
} = require('../controllers/dataController');

// Profile
router.get('/profile', authMiddleware, getUserProfile);

// Debts
router.post('/debts', authMiddleware, createDebt);
router.get('/debts/my-active-goal', authMiddleware, getActiveDebt);

// Incomes
router.post('/incomes', authMiddleware, createIncome);
router.get('/incomes/:debtId', authMiddleware, getIncomesForDebt);

module.exports = router;