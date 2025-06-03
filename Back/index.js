import "dotenv/config";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import projectsFBRouters from "./routes/projectsFB.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import userRoutes from "./routes/user.routes.js";
import dialogflowRoutes from "./routes/dialogflow.routes.js";
import promptRoutes from "./routes/prompt.routes.js"; // Importa las rutas de prompts

const app = express();

const allowedOrigins = [
  `http://localhost:5173`,
  `http://localhost:5001`,
  "https://soft-edge-two.vercel.app",
  "https://dialogflow.cloud.google.com",
  "https://extensions.aitopia.ai",
  "https://soft-edge-back.vercel.app",
  "https://api.prod.whoop.com/oauth/oauth2/auth",
  "https://api.prod.whoop.com/oauth/oauth2/token"
];

// Middleware para eliminar barras diagonales dobles en la URL
app.use((req, res, next) => {
  req.url = req.url.replace(/\/+/g, "/");
  next();
});

// Configuración de CORS
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('Origin not allowed:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400
}));

// Middleware para headers CORS adicionales
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

app.use(morgan("dev"));
app.use(express.json());

// Rutas
app.use(authRoutes);
app.use(userRoutes);
app.use(projectsFBRouters);
app.use(aiRoutes);
app.use(dialogflowRoutes);
app.use(promptRoutes); // Agrega las rutas de prompts

// Development only: (comentar para produccion)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.BACK_PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;