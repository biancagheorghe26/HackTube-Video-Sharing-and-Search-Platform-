import express from 'express';
import bcrypt from 'bcrypt';
import fs from 'fs';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname manually for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3002;
const DATA_FILE = './users.json';

const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
  console.log('Uploads directory created');
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(uploadsPath));
app.use(cors());

// Load users from file
const loadUsers = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading users.json:', error);
    return [];
  }
};

// Save users to file
const saveUsers = (users) => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2)); // Folosim writeFileSync pentru a ne asigura că fișierul este salvat sincron
    console.log('Fișierul a fost salvat cu succes');
  } catch (err) {
    console.error('Eroare la salvarea fișierului:', err);
  }
}

// Load users at server start
let users = loadUsers();

// Middleware pentru a obține utilizatorul logat pe baza username-ului
const getUserFromSession = (req) => {
  const username = req.headers.username; // Exemplu: username trimis în header
  return users.find((user) => user.name === username); // Căutăm utilizatorul după username
};

// Get profile (current user)
app.get('/profile', (req, res) => {
  const user = getUserFromSession(req); // Obținem utilizatorul din sesiune
  if (!user) {
    return res.status(404).json({ message: 'Utilizatorul nu este autentificat' });
  }
  res.json(user); // Returnăm profilul utilizatorului
});

// Update profile (name, password, avatar)
app.put('/profile', upload.single('avatar'), async (req, res) => {
    console.log("Cerere PUT la /profile primită");
    console.log("Datele cererii:", JSON.stringify(req.body));

  console.log("Fișierul încărcat:", req.file);
  const user = getUserFromSession(req); // Obținem utilizatorul din sesiune
  if (!user) {
    return res.status(404).json({ message: 'Utilizatorul nu este autentificat' });
  }

  try {
    const { name, password } = req.body;
    const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    // Actualizăm datele utilizatorului
    if (name) user.name = name;
    if (password) user.password = await bcrypt.hash(password, 10); // Hashăm parola
    if (avatarUrl) user.avatarUrl = avatarUrl; // Actualizăm calea pozei de profil

    // Salvăm utilizatorii în fișierul users.json
    saveUsers(users);

    res.status(200).json(user); // Returnăm utilizatorul actualizat
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error.' });
  }
});
// Ruta pentru înregistrare
app.post('/users', upload.single('avatar'), async (req, res) => {
    const { name, password } = req.body;
    console.log('Date primite:', { name, password });
  
    // Verificăm dacă utilizatorul există deja
    const existingUser = users.find((user) => user.name === name);
    if (existingUser) {
      return res.status(400).json({ message: 'Utilizatorul există deja' });
    }
  
    try {
      // Hashăm parola
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Salvăm avatarul, dacă există
      const avatarUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
  
      // Creăm un obiect pentru utilizatorul nou
      const newUser = {
        name,
        password: hashedPassword,
        avatarUrl,
      };
  
      // Adăugăm utilizatorul în lista de utilizatori
      users.push(newUser);
  
      // Salvăm utilizatorii în fișierul users.json
      saveUsers(users);
  
      res.status(201).json({
        message: 'Înregistrare reușită',
        user: {
          name: newUser.name,
          avatarUrl: newUser.avatarUrl || '',
        },
      });
    } catch (error) {
      console.error('Eroare la înregistrare:', error);
      res.status(500).json({ message: 'Eroare server' });
    }
  });
  
// Ruta pentru login
app.post('/users/login', async (req, res) => {
  const { username, password } = req.body;
  console.log('Date primite:', { username, password });
  const user = users.find((user) => user.name === username); // Poți schimba după ce câmp vrei să folosești (email, etc.)

  if (!user) {
    return res.status(404).json({ message: 'Utilizatorul nu a fost găsit' });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(401).json({ message: 'Parola incorectă' });
  }

  res.status(200).json({
    message: 'Autentificare reușită',
    user: {
      name: user.name,
      avatarUrl: user.avatarUrl || '',
    },
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
