//mon url de base pour les appels API
export const API_BASE_URL = '/my-cinema/backend/index.php';

// utils.js ou config.js (où se trouvent tes autres exports)
import { movieMetadata } from './movie-data.js'; // Assure-toi d'importer le dictionnaire

export const generateFullMovies = (titlesObj) => {
    return Object.entries(titlesObj).map(([id, title]) => {
        // Recherche la clé la plus pertinente dans movieMetadata
        const foundKey = Object.keys(movieMetadata).find(k => title.includes(k));
        const meta = movieMetadata[foundKey || "default"]; // Utilise 'default' si rien n'est trouvé

        return {
            id: parseInt(id),
            title: title,
            genre: meta.genre,
            director: meta.director,
            duration: meta.duration,
            release_year: 1970 + (parseInt(id) % 50), // Année fictive pour varier
            description: meta.description
        };
    });
};

// appel simplémentés fréquemment, pour éviter de répéter le code

// 1. Fonction d'appel API générique
export const apiFetch = async (action, options = {}) => {
    const url = `${API_BASE_URL}?action=${action}`;
    const response = await fetch(url, options);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur API');
    }
    return response.json();
};

// 2. Formatage des dates (pour remplacer tes .substring() ou dates brutes)
export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// 3. Gestionnaire d'affichage simplifié (pour éviter les .innerHTML partout)
export const truncateText = (text, limit = 80) => {
    return text.length > limit ? text.substring(0, limit) + '...' : text;
};

export const apiPost = async (action, data) => {
    return await apiFetch(action, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
};

// 4. Fonction de suppression générique
export const apiDelete = async (type, id) => {
    return await apiFetch(`delete_${type}&id=${id}`, {
        method: 'DELETE'
    });
};
export const apiPut = async (type, id, data) => {
    return await apiFetch(`update_${type}&id=${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
}


export const movieMetadata = {
    "Inception": { genre: "Science-Fiction", director: "Christopher Nolan", duration: 148, description: "Un voleur de rêves est chargé d'une mission inverse." },
    "The Dark Knight": { genre: "Action", director: "Christopher Nolan", duration: 152, description: "Batman affronte le Joker, un anarchiste criminel." },
    "Interstellar": { genre: "Science-Fiction", director: "Christopher Nolan", duration: 169, description: "Des explorateurs voyagent à travers un trou de ver pour sauver l'humanité." },
    "Pulp Fiction": { genre: "Thriller", director: "Quentin Tarantino", duration: 154, description: "Les vies entrelacées de criminels à Los Angeles." },
    "Matrix": { genre: "Science-Fiction", director: "Lana Wachowski", duration: 136, description: "Un hacker découvre que la réalité est une simulation." },
    "Forrest Gump": { genre: "Comédie-Dramatique", director: "Robert Zemeckis", duration: 142, description: "La vie extraordinaire d'un homme simple à travers l'histoire américaine." },
    "The Lord of the Rings": { genre: "Fantasy", director: "Peter Jackson", duration: 178, description: "Une quête épique pour détruire un anneau maléfique." }, // Pour tous les films LOTR
    "The Shawshank Redemption": { genre: "Drame", director: "Frank Darabont", duration: 142, description: "L'histoire d'un homme innocent condamné à perpétuité." },
    "Fight Club": { genre: "Drame", director: "David Fincher", duration: 139, description: "Un insomniaque forme un club de combat secret." },
    "The Godfather": { genre: "Policier", director: "Francis Ford Coppola", duration: 175, description: "La saga de la famille Corleone dans le monde de la mafia." },
    "Gladiator": { genre: "Action", director: "Ridley Scott", duration: 155, description: "Un général romain devient gladiateur pour se venger." },
    "The Lion King": { genre: "Animation", director: "Roger Allers", duration: 88, description: "Un jeune lion doit récupérer son royaume." },
    "The Prestige": { genre: "Mystère", director: "Christopher Nolan", duration: 130, description: "La rivalité obsédante de deux magiciens à Londres." },
    "Harry Potter": { genre: "Fantasy", director: "Divers", duration: 150, description: "Les aventures d'un jeune sorcier à Poudlard." }, // Pour tous les Harry Potter
    "Star Wars": { genre: "Science-Fiction", director: "Divers", duration: 130, description: "Une saga intergalactique entre le bien et le mal." }, // Pour tous les Star Wars
    "The Hunger Games": { genre: "Science-Fiction", director: "Gary Ross", duration: 142, description: "Des adolescents luttent à mort dans un jeu télévisé." },
    "Divergent": { genre: "Science-Fiction", director: "Neil Burger", duration: 139, description: "Une société divisée en factions, une jeune femme est 'divergente'." },
    "The Maze Runner": { genre: "Science-Fiction", director: "Wes Ball", duration: 113, description: "Un jeune homme se réveille amnésique dans un labyrinthe." },
    "Twilight": { genre: "Fantastique", director: "Catherine Hardwicke", duration: 122, description: "Une humaine tombe amoureuse d'un vampire." },
    "Fifty Shades of Grey": { genre: "Romance", director: "Sam Taylor-Johnson", duration: 125, description: "Une romance intense entre une étudiante et un homme d'affaires." },
    "Blade Runner": { genre: "Science-Fiction", director: "Ridley Scott", duration: 117, description: "Un chasseur de réplicants doit débusquer des androïdes." },
    "Deadpool": { genre: "Action", director: "Tim Miller", duration: 108, description: "Un ancien mercenaire subit une expérience et devient Deadpool." },
    "Logan": { genre: "Action", director: "James Mangold", duration: 137, description: "Un Wolverine vieillissant protège une jeune mutante." },
    "Mad Max: Fury Road": { genre: "Action", director: "George Miller", duration: 120, description: "Une course-poursuite explosive dans un monde post-apocalyptique." },
    "The Martian": { genre: "Science-Fiction", director: "Ridley Scott", duration: 144, description: "Un astronaute est laissé seul sur Mars et tente de survivre." },
    "Arrival": { genre: "Science-Fiction", director: "Denis Villeneuve", duration: 116, description: "Des linguistes tentent de communiquer avec des extraterrestres." },
    "Ex Machina": { genre: "Science-Fiction", director: "Alex Garland", duration: 108, description: "Un programmeur teste une intelligence artificielle." },
    "E.T. the Extra-Terrestrial": { genre: "Science-Fiction", director: "Steven Spielberg", duration: 115, description: "Un garçon se lie d'amitié avec un extraterrestre." },
    "Back to the Future": { genre: "Science-Fiction", director: "Robert Zemeckis", duration: 116, description: "Un adolescent voyage dans le passé avec une voiture DeLorean." },
    "default": { genre: "Drame", director: "Inconnu", duration: 120, description: "Description par défaut du film." } // Cas par défaut
};