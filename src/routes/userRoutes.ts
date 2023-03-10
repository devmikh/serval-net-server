import express from 'express';
import { createUser } from '../services/userService';
import passport from '../config/passport';

import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ message: 'this is a home page' });
    } else {
        res.redirect(`${process.env.CLIENT_URL}/login`);
    }
    
});

// Dedicated route to check if user is authenticated
router.get('/is-authenticated', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json({ authenticated: true});
    } else {
        res.status(401).json({ authenticated: false });
    }
})

router.post('/register', async (req, res, next) => {
    try {
        const newUser = await createUser(req.body);
        if (newUser) {
            req.logIn(newUser, (err) => {
                if (err) {
                    return next(err);
                }
                res.cookie('user', JSON.stringify({ email: req.body.email }), {
                    maxAge: 1000 * 60 * 60 * 24
                });
                res.status(200).json({ status: 'success', message: 'User registered successfully' });
            })
        } else {
            res.status(500).json({ message: 'Internal server error'});
        }
        
    } catch(error: any) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ error: "Invalid email or password"});
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            res.cookie('user', JSON.stringify({ email: req.body.email }), {
                maxAge: 1000 * 60 * 60 * 24
            });
            return res.status(200).json({ status: 'success'});
        });
      })(req, res, next);
});

router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { console.log(err); return next(err); }
        res.status(200).json({ status: 'success'});
      });
});


// To be removed
router.get('/test', (req, res, next) => {
    res.status(200).send({ user: { email: 'test@test.com', name: 'test test' }});
});

export default router;