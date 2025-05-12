export type UserRole = "not-logged-in" | "logged-in" | "recipe-owner" | "collaborator";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Step {
  id: string;
  description: string;
  timerMinutes?: number;
}

export interface Collaborator {
  role: string;
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  servings: number;
  ingredients: Ingredient[];
  steps: Step[];
  tags: string[];
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  owner: {
    id: string;
    name: string;
  };
  collaborators: Collaborator[];
}
