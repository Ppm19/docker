const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/stack-docker';
const client = new MongoClient(uri);

app.use(express.json());

async function conectarMongoDB() {
  try {
    await client.connect();
    console.log('Conectado exitosamente a MongoDB');
    console.log('URI de conexión:', uri);
    
    const db = client.db('stack-docker');
    const coleccionUsuarios = db.collection('usuarios');
    
    const colecciones = await db.listCollections().toArray();
    console.log('Colecciones disponibles:', colecciones.map(c => c.name));
    
    const cantidadUsuarios = await coleccionUsuarios.countDocuments();
    console.log('Cantidad de usuarios en la base de datos:', cantidadUsuarios);
    
    app.get('/usuarios', async (req, res) => {
      try {
        const usuarios = await coleccionUsuarios.find({}).toArray();
        console.log('Usuarios encontrados:', usuarios);
        res.json(usuarios);
      } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ error: 'Error al obtener usuarios' });
      }
    });

    app.post('/usuarios', async (req, res) => {
      try {
        const nuevoUsuario = req.body;
        console.log('Intentando crear nuevo usuario:', nuevoUsuario);
        const resultado = await coleccionUsuarios.insertOne(nuevoUsuario);
        res.json(resultado);
      } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({ error: 'Error al crear usuario' });
      }
    });

  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
  }
}

app.get('/', (req, res) => {
  res.json({
    mensaje: '¡Hola! Bienvenido a mi servidor Express con MongoDB',
    endpoints: {
      usuarios: '/usuarios'
    }
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
  conectarMongoDB();
});

process.on('SIGINT', async () => {
  await client.close();
  process.exit();
});
