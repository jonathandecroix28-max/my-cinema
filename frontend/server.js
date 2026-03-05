const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// Désactiver le cache pour le développement
app.disable('view cache');

// Servir les fichiers statiques avec les bons MIME types
app.use(express.static(__dirname, {
    setHeaders: (res, filePath) => {
        // CSS
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        }
        // JavaScript
        else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        }
        // HTML
        else if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
        }
        // JSON
        else if (filePath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
        // Images
        else if (filePath.endsWith('.png')) {
            res.setHeader('Content-Type', 'image/png');
        } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
            res.setHeader('Content-Type', 'image/jpeg');
        } else if (filePath.endsWith('.svg')) {
            res.setHeader('Content-Type', 'image/svg+xml');
        } else if (filePath.endsWith('.ico')) {
            res.setHeader('Content-Type', 'image/x-icon');
        }

        // Headers de sécurité
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
    }
}));

// Routes pour les pages HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'login.html'));
});

app.get('/movies', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'movies.html'));
});

app.get('/rooms', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'rooms.html'));
});

app.get('/screen', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'screen.html'));
});

// Fallback pour les autres routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Démarrage du serveur
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Frontend server running on port ${PORT}`);
    console.log(`📂 Serving files from: ${__dirname}`);
});