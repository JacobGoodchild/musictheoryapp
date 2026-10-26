// The pets you can adopt (prices in coins, tuned in docs/economy.md).
// Kept apart from the drawing code so the economy simulation can use it in Node.
export const PETS = [
  { id: 'pet-kitten', name: 'Kitten', price: 30, toy: 'scratching post' },
  { id: 'pet-puppy', name: 'Puppy', price: 30, toy: 'kennel' },
  { id: 'pet-bunny', name: 'Bunny', price: 30, toy: 'carrot patch' },
  { id: 'pet-chick', name: 'Chick', price: 30, toy: 'nest and seed tray' },
  { id: 'pet-hamster', name: 'Hamster', price: 35, toy: 'hamster wheel' },
  { id: 'pet-panda', name: 'Panda', price: 40, toy: 'bamboo plant' },
  { id: 'pet-unicorn', name: 'Baby Unicorn', price: 45, toy: 'rainbow arch' },
];
export const petById = (id) => PETS.find((p) => p.id === id);
