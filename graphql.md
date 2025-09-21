# CookBook Connect - GraphQL API Guide

This document provides a comprehensive list of GraphQL operations available in the CookBook Connect API. You can run these commands directly in the Apollo GraphQL Playground available at `http://localhost:3000/graphql`.

**Note on Authentication:** Operations marked with `🔒 Auth Required` need a valid JSON Web Token (JWT) in the HTTP headers. You can obtain a token by using the `login` mutation.

**Setting the Auth Header:** In Apollo Playground, click the "HTTP HEADERS" tab at the bottom and enter:
```json
{
  "Authorization": "Bearer YOUR_JWT_HERE"
}
```

---

## 1. Health Check

A simple query to verify that the API is running.

### Hello Query
```graphql
query HealthCheck {
  hello
}
```

---

## 2. User & Authentication

Handles user registration, login, and profile management.

### Register a New User
```graphql
mutation RegisterUser {
  register(createUserInput: {
    email: "testuser@example.com",
    username: "testuser",
    password: "password123"
  }) {
    id
    username
    email
  }
}
```
*(You can create another user, e.g., `testuser2`, for testing the follow functionality.)*

### Login and Get a JWT
```graphql
mutation LoginUser {
  login(loginInput: {
    username: "testuser",
    password: "password123"
  }) {
    access_token
    user {
      id
      username
    }
  }
}
```

### Get Your Own Profile (`me`) 🔒 Auth Required
```graphql
query GetMyProfile {
  me {
    id
    username
    email
  }
}
```

### Get a User's Public Profile
```graphql
query GetUserProfile {
  userProfile(username: "testuser") {
    id
    username
    followersCount
    followingCount
    recipes {
      id
      title
    }
  }
}
```

---

## 3. Following System

Manage follow and unfollow relationships between users.

### Follow a User 🔒 Auth Required
*(First, get the ID of the user you want to follow from the `userProfile` query.)*
```graphql
mutation FollowUser($userId: ID!) {
  follow(userIdToFollow: $userId) {
    success
    message
  }
}
```
**Query Variables:**
```json
{
  "userId": "ID_OF_THE_USER_TO_FOLLOW"
}
```

### Unfollow a User 🔒 Auth Required
```graphql
mutation UnfollowUser($userId: ID!) {
  unfollow(userIdToUnfollow: $userId) {
    success
    message
  }
}
```
**Query Variables:**
```json
{
  "userId": "ID_OF_THE_USER_TO_UNFOLLOW"
}
```

---

## 4. Recipe CRUD

Manage the creation and lifecycle of recipes.

### Create a Recipe 🔒 Auth Required
```graphql
mutation CreateNewRecipe {
  createRecipe(createRecipeInput: {
    title: "Classic Spaghetti Carbonara",
    description: "A traditional Italian pasta dish made with egg, hard cheese, cured pork, and black pepper.",
    cuisine: "Italian",
    difficulty: "Medium",
    cookingTime: 25,
    ingredients: [
      { name: "Spaghetti", quantity: "200g" },
      { name: "Guanciale or Pancetta", quantity: "100g" },
      { name: "Large Egg Yolks", quantity: "2" },
      { name: "Pecorino Romano Cheese", quantity: "50g, grated" }
    ],
    instructions: [
      { stepNumber: 1, text: "Boil spaghetti in salted water." },
      { stepNumber: 2, text: "Fry guanciale until crisp." },
      { stepNumber: 3, text: "Combine everything off the heat to create a creamy sauce." }
    ]
  }) {
    id
    title
    description
    author {
      username
    }
  }
}
```
*(Copy the returned `id` for other recipe operations.)*

### Get a Single Recipe by ID
```graphql
query GetSingleRecipe($recipeId: ID!) {
  recipe(id: $recipeId) {
    id
    title
    description
    cuisine
    difficulty
    cookingTime
    author {
      username
    }
    ingredients {
      name
      quantity
    }
    instructions {
      stepNumber
      text
    }
  }
}
```
**Query Variables:**
```json
{
  "recipeId": "YOUR_RECIPE_ID_HERE"
}
```

### Get All Recipes
```graphql
query GetAllRecipes {
  recipes {
    id
    title
    author {
      username
    }
  }
}
```

### Update a Recipe 🔒 Auth Required
```graphql
mutation UpdateExistingRecipe($recipeId: ID!) {
  updateRecipe(
    id: $recipeId,
    updateRecipeInput: {
      description: "A quick and delicious traditional Italian pasta dish.",
      difficulty: "Easy"
    }
  ) {
    id
    title
    description
    difficulty
  }
}
```
**Query Variables:**
```json
{
  "recipeId": "YOUR_RECIPE_ID_HERE"
}
```

### Delete a Recipe 🔒 Auth Required
```graphql
mutation DeleteExistingRecipe($recipeId: ID!) {
  removeRecipe(id: $recipeId) {
    id
    title
  }
}
```
**Query Variables:**
```json
{
  "recipeId": "YOUR_RECIPE_ID_HERE"
}
```

---

## 5. Search & Discovery

Use Elasticsearch to find recipes.

### Search by Keyword
```graphql
query SearchByKeyword {
  searchRecipes(searchRecipesInput: { query: "spaghetti" }) {
    id
    title
    description
  }
}
```

### Search by Ingredients ("Cook with what I have")
```graphql
query SearchByIngredients {
  searchRecipes(searchRecipesInput: { ingredients: ["egg", "cheese"] }) {
    id
    title
  }
}
```

### Combined Search
```graphql
query CombinedSearch {
  searchRecipes(searchRecipesInput: {
    query: "classic",
    ingredients: ["guanciale or pancetta"]
  }) {
    id
    title
  }
}
```

---

## 6. Comments & Real-time Subscriptions

Engage with recipes through comments and live updates.

### Post a Comment 🔒 Auth Required
```graphql
mutation PostAComment($recipeId: ID!) {
  createComment(createCommentInput: {
    recipeId: $recipeId,
    text: "This looks amazing! Can't wait to try it."
  }) {
    id
    text
    user {
      username
    }
  }
}
```
**Query Variables:**
```json
{
  "recipeId": "YOUR_RECIPE_ID_HERE"
}
```

### Subscribe to New Comments
*(Run this in a separate Playground window/tab to see live updates.)*
```graphql
subscription OnCommentAdded($recipeId: ID!) {
  commentAdded(recipeId: $recipeId) {
    id
    text
    createdAt
    user {
      username
    }
  }
}
```
**Query Variables:**
```json
{
  "recipeId": "YOUR_RECIPE_ID_HERE"
}
```

---

## 7. AI Enhancement

Get cooking suggestions from AI.

### Get Recipe Suggestions 🔒 Auth Required
```graphql
query GetAISuggestions($recipeId: ID!) {
  getRecipeSuggestions(recipeId: $recipeId)
}
```
**Query Variables:**
```json
{
  "recipeId": "YOUR_RECIPE_ID_HERE"
}
```
*(The response will be a single markdown-formatted string.)*
```