import React, { useState, useEffect } from "react";
import { Recipe } from "../../types";
import { X, Timer, ChevronDown, Tag, Search } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";

interface RecipeFormProps {
  initialRecipe?: Partial<Recipe>;
  onSubmit: (recipe: Partial<Recipe>) => void;
  isReadOnly?: boolean;
}

export const RecipeForm: React.FC<RecipeFormProps> = ({
  initialRecipe = {},
  onSubmit,
  isReadOnly = false
}) => {
  const [recipe, setRecipe] = useState<Partial<Recipe>>({
    title: "",
    description: "",
    servings: 4,
    ingredients: [],
    steps: [],
    tags: [],
    isPublic: false,
    ...initialRecipe
  });

  // Sync form state with initialRecipe prop changes
  useEffect(() => {
    setRecipe(prev => ({
      ...prev,
      ...initialRecipe
    }));
  }, [initialRecipe]);

  const [newIngredient, setNewIngredient] = useState({ name: "", quantity: 0, unit: "" });
  const [newStep, setNewStep] = useState({ description: "", timerMinutes: undefined });
  const [newTag, setNewTag] = useState("");
  const [showCustomTagInput, setShowCustomTagInput] = useState(false);

  // Allowed tags for public recipes
  const allowedTags = [
    "baking", "breakfast", "chocolate", "cookies", "dessert", "dinner", "healthy", "pasta", "quick", "seafood", "vegetarian", "Others"
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setRecipe({
      ...recipe,
      [name]: type === "number" ? Number(value) : value
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setRecipe({
      ...recipe,
      [name]: checked
    });
  };

  const handleAddIngredient = () => {
    if (newIngredient.name.trim() === "") return;
    
    setRecipe({
      ...recipe,
      ingredients: [
        ...(recipe.ingredients || []),
        { ...newIngredient, id: `ing-${Date.now()}` }
      ]
    });
    setNewIngredient({ name: "", quantity: 0, unit: "" });
  };

  const handleRemoveIngredient = (id: string) => {
    setRecipe({
      ...recipe,
      ingredients: (recipe.ingredients || []).filter(ing => ing.id !== id)
    });
  };

  const handleAddStep = () => {
    if (newStep.description.trim() === "") return;
    
    setRecipe({
      ...recipe,
      steps: [
        ...(recipe.steps || []),
        { ...newStep, id: `step-${Date.now()}` }
      ]
    });
    setNewStep({ description: "", timerMinutes: undefined });
  };

  const handleRemoveStep = (id: string) => {
    setRecipe({
      ...recipe,
      steps: (recipe.steps || []).filter(step => step.id !== id)
    });
  };

  const handleSelectTag = (tag: string) => {
    setRecipe({ ...recipe, tags: [tag] });
  };

  const handleRemoveTag = () => {
    setRecipe({ ...recipe, tags: [] });
  };

  // Drag and drop handler for steps
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(recipe.steps || []);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setRecipe({ ...recipe, steps: reordered });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(recipe);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Section 1: Recipe Details */}
      <div className="bg-muted/30 p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Recipe Details</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Recipe Title
            </label>
            <Input
              id="title"
              name="title"
              value={recipe.title}
              onChange={handleChange}
              disabled={isReadOnly}
              className="w-full"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={recipe.description}
              onChange={handleChange}
              disabled={isReadOnly}
              className="w-full rounded-md border border-input bg-background p-2"
            />
          </div>

          <div>
            <label htmlFor="servings" className="block text-sm font-medium mb-1">
              Default Servings (Specify how many servings the recipe makes)
            </label>
            <Input
              type="number"
              id="servings"
              name="servings"
              min="1"
              value={recipe.servings}
              onChange={handleChange}
              disabled={isReadOnly}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tag</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {recipe.tags && recipe.tags[0] && (
                <div className="bg-recipe-mint px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  {recipe.tags[0]}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={handleRemoveTag}
                      className="text-primary hover:text-primary-foreground ml-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
            {!isReadOnly && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Tag size={16} />
                      <span>{recipe.tags && recipe.tags[0] ? "Change tag" : "Select a tag"}</span>
                    </div>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 max-h-80 overflow-y-auto">
                  {allowedTags.map((tag) => (
                    <DropdownMenuItem
                      key={tag}
                      onClick={() => handleSelectTag(tag)}
                      className="cursor-pointer capitalize"
                    >
                      {tag}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={recipe.isPublic}
              onChange={handleCheckboxChange}
              disabled={isReadOnly}
              className="rounded border-gray-300 text-primary focus:ring-primary mr-2"
            />
            <label htmlFor="isPublic" className="text-sm">
              Make this recipe public (anyone can view)
            </label>
          </div>
        </div>
      </div>

      {/* Section: Ingredients */}
      <div className="bg-muted/30 p-6 rounded-lg border border-border mb-8">
        <h2 className="text-xl font-semibold mb-4">Ingredients</h2>
        <div className="space-y-2 mb-4">
          {recipe.ingredients?.map((ingredient) => (
            <div key={ingredient.id} className="flex items-center gap-2 bg-muted/50 rounded p-2">
              <span className="font-medium">{ingredient.quantity} {ingredient.unit}</span>
              <span>{ingredient.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveIngredient(ingredient.id)}
                disabled={isReadOnly}
                className={`ml-auto ${isReadOnly ? 'hidden' : ''}`}
              >
                <X size={16} className="text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
        {!isReadOnly && (
          <div className="grid grid-cols-3 gap-3">
            <Input
              type="text"
              placeholder="Ingredient"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              className="col-span-3 md:col-span-1"
            />
            <Input
              type="number"
              placeholder="Amount"
              value={newIngredient.quantity || ""}
              onChange={(e) => setNewIngredient({ ...newIngredient, quantity: Number(e.target.value) })}
              min="0"
            />
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Unit"
                value={newIngredient.unit}
                onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleAddIngredient}
                className="btn-recipe-primary ml-2"
              >
                Add
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Section: Steps */}
      <div className="bg-muted/30 p-6 rounded-lg border border-border">
        <h2 className="text-xl font-semibold mb-4">Steps</h2>
        {isReadOnly ? (
          <div className="space-y-3 mb-4">
            {recipe.steps?.map((step, index) => (
              <div key={step.id} className="flex gap-4 bg-muted/50 rounded p-3">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p>{step.description}</p>
                  {step.timerMinutes && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <Timer size={14} />
                      <span>{step.timerMinutes} min timer</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="steps-droppable">
              {(provided) => (
                <div
                  className="space-y-3 mb-4"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {recipe.steps?.map((step, index) => (
                    <Draggable key={step.id} draggableId={step.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`flex gap-4 bg-muted/50 rounded p-3 items-center ${snapshot.isDragging ? 'ring-2 ring-primary' : ''}`}
                        >
                          <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p>{step.description}</p>
                            {step.timerMinutes && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <Timer size={14} />
                                <span>{step.timerMinutes} min timer</span>
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStep(step.id)}
                            className="flex-shrink-0"
                          >
                            <X size={16} className="text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
        {!isReadOnly && (
          <div className="space-y-3">
            <textarea
              placeholder="Step description"
              value={newStep.description}
              onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
              className="w-full rounded-md border border-input p-2"
              rows={2}
            />
            <div className="flex gap-3">
              <div className="flex items-center gap-1 flex-shrink-0">
                <Timer size={16} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Timer:</span>
              </div>
              <Input
                type="number"
                placeholder="Minutes (optional)"
                value={newStep.timerMinutes || ""}
                onChange={(e) => 
                  setNewStep({ 
                    ...newStep, 
                    timerMinutes: e.target.value ? Number(e.target.value) : undefined 
                  })
                }
                className="flex-1"
                min="0"
              />
              <Button
                type="button"
                onClick={handleAddStep}
                className="btn-recipe-primary"
              >
                Add Step
              </Button>
            </div>
          </div>
        )}
      </div>

      {!isReadOnly && (
        <div className="flex justify-end">
          <Button type="submit" className="btn-recipe-primary">
            {initialRecipe.id ? "Update Recipe" : "Create Recipe"}
          </Button>
        </div>
      )}
    </form>
  );
};
