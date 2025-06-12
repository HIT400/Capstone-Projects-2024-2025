# Tendeko: A Blockchain based, AI Automated E-Procurement System

This repository contains a comprehensive blockchain based e-procurement system that includes:

- **Backend**: A FastAPI-based backend for managing procurement processes.
- **Frontend**: A React-based frontend for interacting with the procurement system.
- **Smart Contracts**: Solidity contracts deployed on the Ethereum blockchain.

## Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instruction s)
  - [1. Backend Setup](#1-backend-setup)
  - [2. Frontend Setup](#2-frontend-setup)
  - [3. Smart Contract Setup](#3-smart-contract-setup)
- [Running the Applications](#running-the-applications)
- [Deployment](#deployment)
- [License](#license)

## Project Structure

```plaintext
Tendeko/
├── backend/               # Backend FastAPI app
├── frontend/              # Frontend React app
└── smart_contract/        # Smart Contracts in Solidity
```

## Prerequisites

Ensure you have the following installed on your system:

- **Python 3.x** (for the backend)
- **Node.js and npm** (for the frontend)
- **Truffle and Ganache CLI** (for smart contracts)
- **MySQL** (for backend data storage)

## Setup Instructions

### 1. Backend Setup

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**

   ```bash
   python3 -m venv venv
   source app/venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. **Add LLM_API_KEY:**

   create .env and add LLM_API_KEY=<your-llm-api-key> and LLM_BASE_URL<your-llm-base-url>

4. **Install the required Python packages:**

   ```bash
   pip install -r requirements.txt
   ```

5. **Start the FastAPI server:**

   ```bash
   uvicorn app/main:app --reload
   ```

   The backend should now be running at `http://127.0.0.1:8000`.

### 2. Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install the required npm packages:**

   ```bash
   npm install
   ```

3. **Start the React development server:**

   ```bash
   npm start
   ```

   The frontend should now be running at `http://localhost:3000`.

### 3. Smart Contract Setup

1. **Navigate to the smart_contract directory:**

   ```bash
   cd smart_contract
   ```

2. **Install Truffle globally (if not already installed):**

   ```bash
   npm install -g truffle
   ```

3. **Install Ganache CLI globally (if not already installed):**

   ```bash
   npm install -g ganache-cli
   ```

4. **Compile the smart contracts:**

   ```bash
   truffle compile
   ```

5. **Start Ganache CLI:**

   ```bash
   ganache-cli -p 8545
   ```

   Keep Ganache running in a separate terminal window.

6. **Migrate the contracts to the blockchain:**

   ```bash
   truffle migrate --reset
   ```

   Your smart contracts should now be deployed on the local blockchain.

## Running the Applications

Once you've set up each component, you can run them concurrently:

- **Backend:** `uvicorn main:app --reload`
- **Frontend:** `npm start`
- **Smart Contracts:** `ganache-cli` (for local blockchain) and `truffle migrate --reset`

## Deployment

For deployment, you might want to use services like AWS, Heroku, or Vercel for the backend and frontend. The smart contracts can be deployed on the Ethereum mainnet or testnet using Truffle.
