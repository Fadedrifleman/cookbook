# CookBook Connect API

Welcome to the backend API for CookBook Connect, a modern recipe-sharing platform. This application is built with NestJS and leverages a powerful stack including GraphQL, PostgreSQL, Elasticsearch, Redis, and Google Gemini AI to provide a rich, interactive, and intelligent user experience.

Users can register, upload their recipes, discover new dishes by searching with ingredients they have at home, follow other cooks, and get AI-powered suggestions to improve their culinary creations.

## Features Implemented

-   **User Authentication**: Secure user registration and JWT-based login.
-   **GraphQL API**: A fully-featured GraphQL API for all client-server communication.
-   **Full Recipe CRUD**: Create, read, update, and delete recipes with nested ingredients and instructions.
-   **Social Features**: Users can follow and unfollow other users.
-   **Elasticsearch Integration**: Lightning-fast, full-text, and ingredient-based recipe search.
-   **Real-time Updates**: Live notifications for new comments on recipes using GraphQL Subscriptions over Redis.
-   **AI Enhancement**: Google Gemini integration to provide intelligent recipe improvement suggestions.

---

## Core Technologies

| Category      | Technology                                    |
| ------------- | --------------------------------------------- |
| **Backend**   | [NestJS](https://nestjs.com/) (TypeScript)    |
| **API**       | [GraphQL](https://graphql.org/) (Apollo)      |
| **Database**  | [PostgreSQL](https://www.postgresql.org/)     |
| **ORM**       | [Prisma](https://www.prisma.io/)              |
| **Search**    | [Elasticsearch](https://www.elastic.co/)      |
| **Real-time** | [Redis](https://redis.io/) / GraphQL Subscriptions |
| **AI**        | [Google Gemini](https://ai.google.dev/)       |
| **Containerization** | [Docker](https://www.docker.com/)      |

---

## Getting Started

Follow these instructions to get a local development environment up and running.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v20.x or later recommended)
-   [Docker](https://www.docker.com/products/docker-desktop/) and Docker Compose
-   A package manager like [npm](https://www.npmjs.com/) (included with Node.js)
-   [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/Fadedrifleman/cookbook-connect.git
cd cookbook-connect
```

### 2. Install Dependencies

Install all the required npm packages.

```bash
npm install
```

### 3. Set Up Environment Variables

The application requires several secret keys and connection strings to function.

First, create a `.env` file in the project root by copying the example file:

```bash
cp .env.example .env
```
*(Note: If you are on Windows, you can manually create a `.env` file and copy the contents of `.env.example` into it.)*

Now, open the newly created `.env` file and fill in the values:

```env
# This URL should match the PostgreSQL configuration in your docker-compose.yml
DATABASE_URL="postgresql://cookbook_user:cookbook_password@localhost:5432/cookbook_db?schema=public"

# A long, secure, random string used for signing JSON Web Tokens.
JWT_SECRET="YourSuperSecretKeyGoesHere-MakeItLongAndRandom"

# Your API key from Google AI Studio.
GEMINI_API_KEY="Your-Google-Gemini-API-Key-Goes-Here"
```
You can generate a strong `JWT_SECRET` using an online tool or via the command line: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 4. Start the Services

All backend services (PostgreSQL, Elasticsearch, Redis) are managed by Docker Compose. Start them in detached mode:

```bash
docker-compose up -d
```
To check if the containers are running, use `docker ps`. You should see `cookbook_postgres`, `cookbook_elasticsearch`, and `cookbook_redis`.

### 5. Run Database Migrations

With the database container running, apply the database schema using Prisma Migrate.

```bash
npx prisma migrate dev
```
This command will create the tables and relationships defined in `prisma/schema.prisma`.

### 6. Start the Application

You are now ready to start the NestJS server.

```bash
npm run start:dev
```
The server will start in watch mode, automatically recompiling on file changes.

### 7. Access the API

The GraphQL API is now running and accessible at **[http://localhost:3000/graphql](http://localhost:3000/graphql)**.

Open this URL in your browser to access the Apollo GraphQL Playground, where you can explore the schema and run queries/mutations.

---

## Example GraphQL Operations

Here are some example operations you can run in the Apollo Playground to test the API.

### Register a New User
```graphql
mutation {
  register(createUserInput: {
    email: "test@example.com",
    username: "testuser",
    password: "password123"
  }) {
    id
    username
  }
}
```

### Log In and Get a JWT
```graphql
mutation {
  login(loginInput: {
    username: "testuser",
    password: "password123"
  }) {
    access_token
  }
}
```
*Copy the `access_token` and add it to your HTTP Headers for authenticated requests: `{"Authorization": "Bearer YOUR_TOKEN_HERE"}`*

### Create a Recipe (Authenticated)
```graphql
mutation {
  createRecipe(createRecipeInput: {
    title: "Simple Tomato Pasta",
    cuisine: "Italian",
    difficulty: "Easy",
    cookingTime: 20,
    ingredients: [
      { name: "Pasta", quantity: "200g" },
      { name: "Canned Tomatoes", quantity: "400g" }
    ],
    instructions: [
      { stepNumber: 1, text: "Boil pasta." },
      { stepNumber: 2, text: "Heat tomatoes in a pan and serve." }
    ]
  }) {
    id
    title
  }
}
```

### Search for Recipes
```graphql
query {
  searchRecipes(searchRecipesInput: { ingredients: ["pasta", "tomatoes"] }) {
    id
    title
  }
}
```

### Get AI Suggestions (Authenticated)
```graphql
query {
  getRecipeSuggestions(recipeId: "YOUR_RECIPE_ID_HERE")
}
```