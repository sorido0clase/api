// importar todas las librerias
process.loadEnvFile()
import express from "express"
import mysql from "mysql2"
import { z } from "zod"

// app
const app = express()
const port = 3000



/// public index.html
app.use(express.static('public')); 
app.use(express.json());


// configuracion a la base de datos
//!  const db = mysql.createConnection({
//!     host: 'localhost',
//!     user: "root",
//!     password: "aaaaa",
//!     database: "superMercado"
//!  })

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect(err => {
    if(err){
        console.error("Error al conectarse a la base de datos " + err)
        return
    } 

    console.info("connection Exitosa")
})

// node --watch server.js
const articuloSchema = z.object(
    {
       
        nombre: z.string().min(1),
        descripcion: z.string().optional(),
        precio: z.number().nonnegative(),
        cantidad: z.number().int().nonnegative,
        categoria: z.string().optional(),
        imagen: z.string().url().optional
    }
)


const ruta = "http://junction.proxy.rlwy.net:14591/articulo"
// rutas de las api 
app.get(ruta, (req, res) =>{
    
    db.query(`select * from articulos`, (err, result) =>{

        if (err) {
            return res.status(500).json({ error: err.message});
        }
        res.json(result)
     })
     console.info(res )
})

app.get('/articulo/buscar', (req, res) =>{

    const { nombre, categoria } = req.query;
    
    let consulta = `select * 
        from articulos 
        where `

    const params = []
    
    if (nombre) {
        consulta += `nombre = "${nombre}"`
     
    }

    if (categoria) {
        consulta += `categoria = "${categoria}"`
        
    }


    db.query(consulta, (err, result) =>{

        console.log(consulta);
        
        if (err) {
            return res.status(500).json({ error: err.message});
        }
        res.json(result)
     })
})

app.get('/categorias', (req, res) => {
    db.query(`SELECT DISTINCT categoria AS nombre FROM articulos`, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(result);
    });
});

//! app.post()
//! app.delete()
//! app.put()


app.listen(port, () => {
    console.info('Servidor corriendo por el http:localhost:' + port )
})