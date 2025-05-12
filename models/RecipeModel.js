const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    default: ''
  }
});

const stepSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  timerMinutes: {
    type: Number
  }
});

const collaboratorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    default: 'editor'
  },
  email: String,
  name: String
});

const recipeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Recipe title is required']
    },
    description: {
      type: String,
      default: ''
    },
    servings: {
      type: Number,
      default: 1
    },
    ingredients: [ingredientSchema],
    steps: [stepSchema],
    tags: [String],
    isPublic: {
      type: Boolean,
      default: false
    },
    owner: {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: String
    },
    collaborators: [collaboratorSchema]
  },
  {
    timestamps: true,
    collection: 'recipes'
  }
);

// Add indexes for faster queries
recipeSchema.index({ 'owner.id': 1 });
recipeSchema.index({ isPublic: 1 });
recipeSchema.index({ 'collaborators.user': 1 });

const Recipe = mongoose.model('Recipe', recipeSchema, 'recipes');

console.log('Recipe model created with recipes collection');

module.exports = Recipe; 