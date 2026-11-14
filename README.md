# QuickBite — Online Food Delivery System

A full-stack food delivery web application featuring a React + TypeScript frontend, a Node.js/Express REST API, and a **hybrid database architecture** combining **Neo4j (Graph NoSQL)** for personalized dish-level recommendations and **MySQL (Relational)** for transactional operations.

---

## Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS, Vite
* **Backend:** Node.js, Express.js (`neo4j-driver`)
* **NoSQL Database (Recommendations):** Neo4j Desktop / Neo4j Graph Database
* **Relational Database (Core Transactions):** MySQL *(Schema & integration details to be added)*

---

## Features Implemented

### 1. Frontend Interface
* User login & active session switching (`peg`, `sam`, `net`)
* Interactive restaurant & dish menu across 3 restaurants (*Spice Garden*, *Pizza Corner*, *Wok Express*)
* **Smart Recommendations** panel dynamically querying the Neo4j graph API for the active user
* Cart, order placement, and transaction views

### 2. Neo4j Graph Recommendation Engine (NoSQL)
* **Graph Data Model:**
  * `(:Restaurant)-[:OFFERS]->(:MenuItem)` — models 3 restaurants offering a 12-item catalog with pricing
  * `(:User)-[:LIKES]->(:MenuItem)` — models curated cross-restaurant dish preferences per user
* **REST Endpoint (`GET /api/recommendations?user=<username>`):**
  * Matches personalized dish recommendations via `(u:User)-[:LIKES]->(f:MenuItem)<-[:OFFERS]-(r:Restaurant)`
  * Includes a graceful fallback returning up to 3 general menu items (`LIMIT 3`) for new or guest users

---

## Project Structure

```text
Online-Food-Delivery-System/
├── src/
│   ├── components/quickbite/
│   │   └── GraphRecommendations.tsx   # Fetches & renders user-specific Neo4j recs
│   └── pages/                         # Login, Menu, Orders, and Transactions views
├── server.js                          # Express backend & Neo4j Cypher query routes
├── package.json
└── README.md