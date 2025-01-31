const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:5001' 
    : 'https://pokemonapi-d8d6csaec6bheddf.westus-01.azurewebsites.net/';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize favorites from localStorage
    loadFavorites();
    
    // Add enter key listener for search
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchPokemon();
        }
    });

    // Add shiny toggle listener
    document.getElementById('shinyToggle').addEventListener('click', toggleShiny);
    
    // Add favorite toggle listener
    document.getElementById('favoriteToggle').addEventListener('click', toggleFavorite);
});

// Current Pokemon state
let currentPokemon = null;
let isShiny = false;

// Type colors for styling
const typeColors = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-blue-200',
    fighting: 'bg-red-700',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-green-600',
    rock: 'bg-yellow-800',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-700',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-300'
};

async function searchPokemon() {
    const searchInput = document.getElementById('searchInput').value.trim();
    if (!searchInput) return;

    try {
        const response = await fetch(`https://pokeapi.co/api/v2/Pokemon/${searchInput.toLowerCase()}`);
        if (!response.ok) throw new Error('Pokemon not found');
        
        const pokemon = await response.json();
        displayPokemon(pokemon);
        hideError();
    } catch (error) {
        showError('Pokemon not found or an error occurred. Please try again.');
    }
}

// Update the fetch call in getRandomPokemon function
async function getRandomPokemon() {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/random`);
        if (!response.ok) throw new Error('Failed to get random Pokemon');
        
        const pokemon = await response.json();
        displayPokemon(pokemon);
        hideError();
    } catch (error) {
        showError('Failed to get random Pokemon. Please try again.');
    }
}

function displayPokemon(pokemon) {
    currentPokemon = pokemon;
    document.getElementById('pokemonDisplay').classList.remove('hidden');
    
    // Display basic info
    document.getElementById('pokemonName').textContent = 
        pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    document.getElementById('pokemonNumber').textContent = `#${pokemon.id.toString().padStart(3, '0')}`;
    
    // Display sprite
    updateSprite();
    
    // Display types
    const typesContainer = document.getElementById('pokemonTypes');
    typesContainer.innerHTML = pokemon.types.map(type => 
        `<span class="px-3 py-1 rounded-full text-white ${typeColors[type.name] || 'bg-gray-400'}">
            ${type.name.toUpperCase()}
        </span>`
    ).join('');
    
    // Display location
    const locationElement = document.getElementById('pokemonLocation');
    if (pokemon.locations && pokemon.locations.length > 0) {
        locationElement.textContent = pokemon.locations[0].name.replace(/-/g, ' ');
    } else {
        locationElement.textContent = 'N/A';
    }
    
    // Display evolution chain
    const evolutionElement = document.getElementById('evolutionChain');
    if (pokemon.evolution && pokemon.evolution.chain.length > 0) {
        evolutionElement.innerHTML = pokemon.evolution.chain.map(evo => 
            `<span class="cursor-pointer text-blue-500 hover:underline" 
                onclick="searchPokemon('${evo.pokemonName}')">
                ${evo.pokemonName.charAt(0).toUpperCase() + evo.pokemonName.slice(1)}
            </span>`
        ).join(' → ');
    } else {
        evolutionElement.textContent = 'N/A';
    }
    
    // Display abilities
    const abilitiesElement = document.getElementById('pokemonAbilities');
    abilitiesElement.innerHTML = pokemon.abilities.map(ability =>
        `<div class="mb-1">
            ${ability.name.replace(/-/g, ' ')}
            ${ability.isHidden ? '<span class="text-gray-500">(Hidden)</span>' : ''}
        </div>`
    ).join('');
    
    // Display moves
    const movesElement = document.getElementById('pokemonMoves');
    movesElement.innerHTML = pokemon.moves.map(move =>
        `<div class="bg-gray-100 rounded p-2 text-center">
            ${move.name.replace(/-/g, ' ')}
        </div>`
    ).join('');
    
    // Update favorite button
    updateFavoriteButton();
}

function toggleShiny() {
    if (!currentPokemon) return;
    isShiny = !isShiny;
    updateSprite();
}

function updateSprite() {
    if (!currentPokemon) return;
    const spriteElement = document.getElementById('pokemonSprite');
    spriteElement.src = isShiny ? currentPokemon.sprites.shiny : currentPokemon.sprites.default;
}

// Favorites Management
function loadFavorites() {
    const favorites = getFavorites();
    displayFavorites(favorites);
}

function getFavorites() {
    const favoritesJson = localStorage.getItem('pokemonFavorites');
    return favoritesJson ? JSON.parse(favoritesJson) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem('pokemonFavorites', JSON.stringify(favorites));
}

function toggleFavorite() {
    if (!currentPokemon) return;
    
    const favorites = getFavorites();
    const index = favorites.findIndex(f => f.id === currentPokemon.id);
    
    if (index === -1) {
        favorites.push({
            id: currentPokemon.id,
            name: currentPokemon.name,
            sprite: currentPokemon.sprites.default
        });
    } else {
        favorites.splice(index, 1);
    }
    
    saveFavorites(favorites);
    displayFavorites(favorites);
    updateFavoriteButton();
}

function displayFavorites(favorites) {
    const favoritesElement = document.getElementById('favoritesList');
    favoritesElement.innerHTML = favorites.map(favorite =>
        `<div class="bg-gray-100 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-200"
             onclick="searchPokemon('${favorite.id}')">
            <img src="${favorite.sprite}" alt="${favorite.name}" class="w-24 h-24 mx-auto">
            <div class="mt-2">
                ${favorite.name.charAt(0).toUpperCase() + favorite.name.slice(1)}
            </div>
        </div>`
    ).join('');
}

function updateFavoriteButton() {
    if (!currentPokemon) return;
    
    const favorites = getFavorites();
    const isFavorite = favorites.some(f => f.id === currentPokemon.id);
    const favoriteButton = document.getElementById('favoriteToggle');
    
    favoriteButton.classList.remove(isFavorite ? 'bg-red-500' : 'bg-red-700');
    favoriteButton.classList.add(isFavorite ? 'bg-red-700' : 'bg-red-500');
}

// Error handling
function showError(message) {
    const errorElement = document.getElementById('errorMessage');
    const errorTextElement = document.getElementById('errorText');
    errorElement.classList.remove('hidden');
    errorTextElement.textContent = message;
}

function hideError() {
    const errorElement = document.getElementById('errorMessage');
    errorElement.classList.add('hidden');
}