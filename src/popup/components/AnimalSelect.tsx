import { useState } from 'react';

export type AnimalType = 'cat' | 'fox';

interface AnimalSelectProps {
  onSelect: (animal: AnimalType) => void;
  selectedAnimal: AnimalType;
}

const animals = [
  { 
    id: 'cat' as AnimalType, 
    name: 'Cat',
    emoji: '🐱',
    description: 'Playful & Curious'
  },
  { 
    id: 'fox' as AnimalType, 
    name: 'Fox',
    emoji: '🦊',
    description: 'Swift & Clever'
  },
];

const AnimalSelect = ({ onSelect, selectedAnimal }: AnimalSelectProps) => {
  const [hoveredAnimal, setHoveredAnimal] = useState<AnimalType | null>(null);

  return (
    <div className="pixel-container">
      <h2 className="pixel-heading mb-6">Choose Your Companion</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {animals.map((animal) => (
          <button
            key={animal.id}
            onClick={() => onSelect(animal.id)}
            onMouseEnter={() => setHoveredAnimal(animal.id)}
            onMouseLeave={() => setHoveredAnimal(null)}
            className={`pixel-card ${
              selectedAnimal === animal.id 
                ? 'pixel-card-selected' 
                : hoveredAnimal === animal.id
                ? 'pixel-card-hover'
                : ''
            }`}
          >
            <div className="text-5xl mb-3 transition-transform duration-200" 
                 style={{ 
                   transform: selectedAnimal === animal.id ? 'scale(1.2)' : 'scale(1)',
                   imageRendering: 'pixelated'
                 }}>
              {animal.emoji}
            </div>
            <div className="pixel-text-lg font-bold mb-1">{animal.name}</div>
            <div className="pixel-text-sm opacity-80">{animal.description}</div>
          </button>
        ))}
      </div>

      <div className="mt-6 pixel-info-box">
        <p className="pixel-text-sm text-center">
          ✨ Your chosen companion will appear on your screen at the set time
        </p>
      </div>
    </div>
  );
};

export default AnimalSelect;
