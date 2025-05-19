# Chat MVP

A real-time chat application with a Node.js backend and Vue.js frontend.

## Project Structure

```
chat_mvp/
├── server/                 # Backend server
│   ├── index.ts           # Main server entry point
│   ├── package.json       # Server dependencies
│   └── tsconfig.json      # TypeScript configuration
│
├── web-app/               # Frontend application
│   ├── src/              # Source files
│   ├── public/           # Static assets
│   ├── index.html        # Entry HTML file
│   ├── package.json      # Frontend dependencies
│   ├── tsconfig.json     # TypeScript configuration
│   ├── vite.config.ts    # Vite configuration
│   └── eslint.config.js  # ESLint configuration
│
└── README.md             # Project documentation
```

## Setup

1. Install dependencies for both server and client:
```bash
cd server && yarn install
cd ../web-app && yarn install
```

2. Start the development servers:

For the backend:
```bash
cd server
yarn dev
```

For the frontend:
```bash
cd web-app
yarn dev
```

## Technologies Used

- **Backend**: Node.js with TypeScript
- **Frontend**: Vue.js with TypeScript
- **Build Tool**: Vite
- **Package Manager**: Yarn