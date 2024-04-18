
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require("dotenv").config({path:'./.env'});
const rateLimit = require('express-rate-limit');
app.use(express.urlencoded({ extended:false }));
app.use(express.json());
app.use(cookieParser())
app.use(session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: true
  }));


let mysql = require('mysql2');
let conexionBD = mysql.createConnection({
     host: process.env.DB_HOST,
     database: process.env.DB_DATABASE,
     user:process.env.DB_USER,
     password:process.env.DB_PASS,
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0
})

conexionBD.connect(function(err){
    if(err){
        throw err;
    }else{
        console.log("Conexión exitosa a la base de datos");
    }

});
app.get('/', (req, res) => {
        res.send(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Autentificador</title>
        </head>
        <body>
            <h1>Iniciar sesión</h1>
            <div class="div_iniciar">
                <form action="/auth" method="POST">
                    <label for="correo">Correo</label>
                    <input id="correo" name="email" type="email" maxlength="50" required>
                    <br>
                    <label for="contraseña">contraseña</label>
                    <input type="password" id="contraseña" name="password" type="password" maxlength="50" required> <br>
                    <input type="submit" value="Iniciar sesión"/>
                </form>
                
            </div>
            <form action="/register">
                <input type="submit" value="Registrarse"/>
            </form>
        </body>
        </html>`);
    
});

app.get('/logged', validateToken, (req, res) => {
    jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
        if (err) {
          res.sendStatus(403);
        }
        else if(req.isAdmin==0){
            res.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cliente</title>
            </head>
            <body>
                <h1>Sesión de cliente</h1>
                <div class="div_iniciar">
                    <form action="/actualizarDatos" method="GET">
                        <input type="submit" value="Actualizar datos"/>
                    </form>
                    <form action="/showProducts" method="GET">
                        <input type="submit" value="Ver productos a la venta"/>
                    </form>
                    <form action="/">
                            <input type="submit" value="Cerrar sesión"/>
                        </form>
                    
                </div>
            </body>
            </html>`);
        }
        else if(req.isAdmin==1){
            res.send(`<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Administrador</title>
            </head>
            <body>
                <h1>Sesión de administrador</h1>
                <div class="div_iniciar">
                    <form action="/panelAdmin" method="GET">
                        <input type="submit" value="Panel de Administrador"/>
                    </form>
                    <form action="/addProducts" method="POST">
                        <input type="submit" value="Introducir un producto"/>
                    </form>
                    <form action="/showProducts" method="GET">
                        <input type="submit" value="Ver productos a la venta"/>
                    </form>
                    <form action="/">
                            <input type="submit" value="Cerrar sesión"/>
                        </form>
                    
                </div>
            </body>
            </html>`);
        }
    })
    
    
});

app.post("/addProducts",validateToken, (req, res) => {
    jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
        
        if (err) {
          res.sendStatus(403);
        }

        else if(req.isAdmin==1){
            res.send(`<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Añadir producto</title>
                </head>
                <body>
                    <h1>Añadir un producto</h1>
                    <form action="/addProductMethod" method="POST">
                        <label for="nombreProducto">Nombre del producto</label>
                        <input type="text" id="producName" name="nombreProducto" type="text" maxlength="50" placeholder="Plátano">
                        <br>
                        <label for="descripcionProducto">Descripción del producto</label>
                        <input id="producDesc" type="text" name="descripcionProducto" type="email" maxlength="300" placeholder="Amarillo, largo y pelable">
                        <br>
                        <label for="cantidadProducto">Cantidad de este producto</label>
                        <input type="number" id="producCuant" name="cantidadProducto" placeholder="50">
                        <br>
                        <label for="precioProducto">Precio que tendrá el producto</label>
                        <input type="number" id="productPrice" name="precioProducto" placeholder="20">
                        <br>
                        <label for="imagenProducto">Imagen que tendrá el producto</label>
                        <input type="url" id="producImage" name="imagenProducto" placeholder="https://www.google.com/PlatanoImage" size="30">
                        <br>
                        <button type="submit">Registrar el producto</button>
                    </form>
                    <form action="/logged" method="GET">
                    <button type="submit">Volver</button>
                    </form>
                </body>
                </html>`);
        }
    })
})

app.post('/addProductMethod',  (req, res) => {
    const {nombreProducto, descripcionProducto, cantidadProducto,precioProducto,imagenProducto} = req.body;
    let consulta;
    if (cantidadProducto == Number && precioProducto == Number && nombreProducto != null && descripcionProducto != null && cantidadProducto != null && precioProducto != null && imagenProducto != null && nombreProducto != "" && descripcionProducto != "" && cantidadProducto != "" && precioProducto != "" && imagenProducto != ""){
        if(true){
            let query="SELECT * FROM productos WHERE nombre=?";
        conexionBD.query(query,[nombreProducto], function (error, results, fields) {
            if (error) throw error;
            consulta = results[0];
            if(consulta == 0 || consulta==undefined){
                    let query ="INSERT INTO productos(nombre, descripcion, cantidad, precio, imagen) values (?,?,?,?,?)" ;
                    //conexionBD.query("INSERT INTO users(nombre, correo, pass, admin, estado) values ('"+name+"','"+email+"','"+password+"',0,0)", function (error, results, fields) {
                    conexionBD.query(query,[nombreProducto, descripcionProducto, cantidadProducto,precioProducto,imagenProducto], function (error, results, fields) {
                        if (error) throw error;
                        
                        // AQUI ES DONDE DEBO REDIRECCIONAR HACIA LA PÁGINA PRINCIPAL
                        res.redirect("/logged");
                    })
                }else{
                    res.send(`<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Registrarse</title>
                    </head>
                    <body>
                    <h1>Añadir un producto</h1>
                    <form action="/addProductMethod" method="POST">
                        <label for="nombreProducto">Nombre del producto</label>
                        <input type="text" id="producName" name="nombreProducto" type="text" maxlength="50" placeholder="Plátano">
                        <br>
                        <label for="descripcionProducto">Descripción del producto</label>
                        <input id="producDesc" type="text" name="descripcionProducto" type="email" maxlength="300" placeholder="Amarillo, largo y pelable">
                        <br>
                        <label for="cantidadProducto">Cantidad de este producto</label>
                        <input type="number" id="producCuant" name="cantidadProducto" placeholder="50">
                        <br>
                        <label for="precioProducto">Precio que tendrá el producto</label>
                        <input type="number" id="productPrice" name="precioProducto" placeholder="20">
                        <br>
                        <label for="imagenProducto">Imagen que tendrá el producto</label>
                        <input type="url" id="producImage" name="imagenProducto" placeholder="www.google.com/PlatanoImage" size="30">
                        <br>
                        <button type="submit">Registrar el producto</button>
                    </form>
                        <h2>YA EXISTE ESE PRODUCTO EN LA LISTA</h2>
                        <form action="/logged" method="GET">
                            <button type="submit">Volver</button>
                        </form>
                    </body>
                    </html>`); 
                }
                
            })
        }
    }
            
        else{
            res.send(`<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Registrarse</title>
                        </head>
                        <body>
                        <h1>Añadir un producto</h1>
                        <form action="/addProductMethod" method="POST">
                            <label for="nombreProducto">Nombre del producto</label>
                            <input type="text" id="producName" name="nombreProducto" type="text" maxlength="50" placeholder="Plátano">
                            <br>
                            <label for="descripcionProducto">Descripción del producto</label>
                            <input id="producDesc" type="text" name="descripcionProducto" type="email" maxlength="300" placeholder="Amarillo, largo y pelable">
                            <br>
                            <label for="cantidadProducto">Cantidad de este producto</label>
                            <input type="number" id="producCuant" name="cantidadProducto" placeholder="50">
                            <br>
                            <label for="precioProducto">Precio que tendrá el producto</label>
                            <input type="number" id="productPrice" name="precioProducto" placeholder="20">
                            <br>
                            <label for="imagenProducto">Imagen que tendrá el producto</label>
                            <input type="url" id="producImage" name="imagenProducto" placeholder="www.google.com/PlatanoImage" size="30">
                            <br>
                            <button type="submit">Registrar el producto</button>
                        </form>
                            <h2>HAY ALGÚN CAMPO EN BLANCO!</h2>
                            <form action="/logged" method="GET">
                                <button type="submit">Volver</button>
                            </form>
                        </body>
                        </html>`);
        }
        
        });

app.get("/showProducts", validateToken, (req, res) => {
    jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
        if (err) {
          res.sendStatus(403);
        }
        conexionBD.query("SELECT * FROM productos", function (error, results, fields) {
            if (error) throw error;
            //console.log('The solution is: ', results[0])
            let productos = results;
            //res.sendFile(__dirname+'/admin.html');
            let id=req.session.myId;
            let query="SELECT SUM(cantidadCarrito) AS suma FROM usercart WHERE idUser=?";
            conexionBD.query(query,[id], function (error, resultados, fields) {
                if (error) throw error;
                let id=req.session.myId;
                let carrito;
                
                if(resultados[0].suma==null){
                    carrito=0;
                }else{
                    carrito = resultados[0].suma
                    
                }

                res.send(`<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Productos</title>
                    </head>
                    <body>
                        <h1>Productos en venta en esta tienda</h1>
                        <table class="default" id="tableUsers" border="3">
                            <tr>
                                <th>Id</th>
                                <th>Nombre del producto</th>
                                <th>Descripción del producto</th>
                                <th>Cantidad en existencia</th>
                                <th>Precio del producto</th>
                                <th>Imagen del producto</th>
                                <th>Agregar uno al carrito</th>
                            </tr>           
                        </table>
                        <table class="default" id="cart" border="3" style="display: none;">
                            <tr>
                                <th>Id del producto</th>
                                <th>Nombre del producto</th>
                                <th>Descripcion del producto</th>
                                <th>Imagen del producto</th>
                                <th>Cantidad del producto</th>
                                <th>Precio del producto</th>
                            </tr>
                        </table>
                                    
                        <form action="/logged">
                            <input type="submit" value="Volver"/>
                        </form>
                        <form action="/shoppingCart">
                            <input type="submit" value="Carrito(${carrito})"/>
                        </form>
                    </body>
                </html>
                <script>
                
                    let usrs = ${JSON.stringify(productos)}
                    let tabla = document.getElementById("tableUsers");
                    usrs.forEach((element)=>{
                        let tr = document.createElement('tr');
                        let tdId = document.createElement('td');
                        let tdnombre = document.createElement('td');
                        let tdDesc = document.createElement('td');
                        let tdCant = document.createElement('td');
                        let tdPrecio = document.createElement('td');
                        let tdimage = document.createElement('td');
                        let image = document.createElement('img');
                        let tdButton = document.createElement('td');
                        let buttonAdd = document.createElement('button');
                        let formAdd = document.createElement('form');
                        
                        buttonAdd.name="add";
                        buttonAdd.value = element.id;
                        buttonAdd.textContent = "+";
                        buttonAdd.style="display: inline-block"
    
                        formAdd.action="/addCartPrdt"
                        formAdd.method="POST"
                        formAdd.appendChild(buttonAdd)
                        tdButton.appendChild(formAdd);
    
    
                        tdId.textContent = element.id;
                        tdnombre.textContent = element.nombre;
                        tdnombre.style="text-align:center"
                        tdDesc.textContent = element.descripcion;
                        tdDesc.style="text-align:center"
                        tdCant.textContent = element.cantidad;
                        tdCant.style="text-align:center"
                        tdPrecio.textContent = element.precio;
                        tdPrecio.style="text-align:center"
                        image.src = element.imagen;
                        image.width="200"
                        image.height="100"
                        tdButton.style="text-align:center"
                        tdimage.appendChild(image);
                        tr.appendChild(tdId);
                        tr.appendChild(tdnombre);
                        tr.appendChild(tdDesc);
                        tr.appendChild(tdCant);
                        tr.appendChild(tdPrecio);
                        tr.appendChild(tdimage);
                        tr.appendChild(tdButton);
                        tableUsers.appendChild(tr);
                        })
                    </script>
                `);
                })
            

        });
    })
})


app.post("/addCartPrdt", validateToken, (req, res)=>{
    jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
        if (err) {
          res.sendStatus(403);
        }
        else{
            let id=req.session.myId;
            
            let idProduct = req.body.add;
            let query ="SELECT cantidadCarrito FROM usercart WHERE idUser =? AND producto=?";
            //conexionBD.query("UPDATE users SET estado ="+state+" WHERE id="+id+";", function (error, results, fields) {
            conexionBD.query(query,[id,idProduct], function (error, results, fields) {
                 if (error) throw error;
                 let cantidad = results;
                 if(cantidad.length==0){
                    
                    
                    let query ="INSERT INTO usercart (producto, cantidadCarrito,idUser) values (?,1,?)";
                    conexionBD.query(query,[idProduct,id], function (error, results, fields) {
                        if (error) {throw error};
                        return res.redirect('/showProducts')});
                 }
                 else if(cantidad.length!=0){
                    let query ="UPDATE usercart SET cantidadCarrito = cantidadCarrito + 1 WHERE producto =? AND idUser =?";
                    conexionBD.query(query,[idProduct,id], function (error, results, fields) {
                        if (error) {throw error};
                        return res.redirect('/showProducts')});
                 }

                 
            
        })
}});

})



app.get("/shoppingCart", validateToken, (req, res)=>{
    jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
        if (err) {
          res.sendStatus(403);
        }
        let id = req.session.myId;
        let query ="SELECT p.imagen, p.nombre, p.precio, p.id, s.cantidadCarrito FROM productos AS p JOIN usercart AS s ON p.id = s.producto WHERE s.idUser = ?;"
        conexionBD.query(query,[id], function (error, results, fields) {
            if (error) {throw error};
            //console.log('The solution is: ', results[0])
            let usuarios = results;
            //res.sendFile(__dirname+'/admin.html');
            res.send(`<!DOCTYPE html>
            <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Registrarse</title>
                </head>
                <body>
                    <h1>Carrito de compras :D</h1>
                    <table class="default" id="tableUsers" border="3">
                        <tr>
                            <th>Imágen del producto</th>
                            <th>Nombre del producto</th>
                            <th>Precio</th>
                            <th>Eliminar uno</th>
                            <th>Cantidad</th>
                            <th>Añadir uno</th>
                        </tr>
                        </table>
                        
                        <p id="total"></p>           
                    <form action="/showProducts">
                        <input type="submit" value="Volver"/>
                    </form>
                    <form 
                    //action="/showProducts"
                    >
                        <input type="submit" value="Comprar productos"/>
                    </form>
                </body>
            </html>
            <script>
                let usrs = ${JSON.stringify(usuarios)   }
                let tabla = document.getElementById("tableUsers");
                let total = 0
                usrs.forEach((element)=>{
                    console.log(element)
                    let tr = document.createElement('tr');
                    let tdImage = document.createElement('td');
                    let tdnombre = document.createElement('td');
                    tdnombre.style="text-align:center"
                    let tdPrecio = document.createElement('td');
                    tdPrecio.style="text-align:center"
                    let tdAdd = document.createElement('td');
                    tdAdd.style="text-align:center"
                    let tdCuant = document.createElement('td');
                    tdCuant.style="text-align:center"
                    let tdDel = document.createElement('td');
                    tdDel.style="text-align:center"

                    let image = document.createElement('img');
                    image.src = element.imagen;
                    image.width="200"
                    image.height="100"

                    tdImage.appendChild(image);
                    tdnombre.textContent = element.nombre;
                    tdPrecio.textContent = element.precio;
                    tdCuant.textContent = element.cantidadCarrito;

                    let botonAdd = document.createElement('button');
                    botonAdd.textContent = '+';
                    botonAdd.value = element.id;
                    botonAdd.style="display: inline-block"
                    botonAdd.name="sumar";
                    

                    let botonDel = document.createElement('button');
                    botonDel.textContent = '-';
                    botonDel.value = element.id
                    botonDel.style="display: inline-block"
                    botonDel.name="restar"
                    
                    
                    let formAdd = document.createElement('form');
                    formAdd.action="/shoppingAdd";
                    formAdd.method="POST";
                    formAdd.appendChild(botonAdd);
                    
                    let formDel = document.createElement('form');
                    formDel.action="/shoppinDel";
                    formDel.method="POST";
                    formDel.appendChild(botonDel);
                      
                    tdAdd.appendChild(formAdd);
                    tdDel.appendChild(formDel);

                    tr.appendChild(tdImage);
                    tr.appendChild(tdnombre);
                    tr.appendChild(tdPrecio);
                    tr.appendChild(tdDel);
                    tr.appendChild(tdCuant);
                    tr.appendChild(tdAdd);
                    tableUsers.appendChild(tr);
                    if(element.cantidadCarrito==0){
                        tableUsers.removeChild(tableUsers.lastChild);
                    }
                    let cantidadDinero = element.cantidadCarrito * element.precio;
                    total+= cantidadDinero;
                    })
                    let cantidad = document.getElementById('total').textContent = "Tu total a pagar es: $"+total;
                </script>
            `);
        })
    })
});

app.post('/shoppingAdd', validateToken, (req, res)=>{
    jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
        if (err) {
          res.sendStatus(403);
        }
        let id = req.session.myId;
        let idProduct = req.body.sumar
        let query ="UPDATE usercart SET cantidadCarrito = cantidadCarrito + 1 WHERE producto =? AND idUser =?";
        conexionBD.query(query,[idProduct,id], function (error, results, fields) {
            if (error) {throw error};
            return res.redirect('/shoppingCart')});
    })
    });

app.post('/shoppinDel', validateToken, (req, res)=>{
    jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
        if (err) {
          res.sendStatus(403);
        }
        let id = req.session.myId;
        let idProduct = req.body.restar
        let query ="UPDATE usercart SET cantidadCarrito = cantidadCarrito - 1 WHERE producto =? AND idUser =?";
        conexionBD.query(query,[idProduct,id], function (error, results, fields) {
            if (error) {throw error};
            return res.redirect('/shoppingCart')});
    })
    });

app.get('/register', (req, res) => {
    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registrarse</title>
    </head>
    <body>
        <h1>Registrate</h1>
        <form action="/registrarse" method="POST">
            <label for="name">Nombre</label>
            <input type="text" id="nombrereg" name="name" type="text" maxlength="50">
            <br>
            <label for="email">Correo</label>
            <input id="correoreg" type="text" name="email" type="email" maxlength="50">
            <br>
            <label for="password">contraseña</label>
            <input type="text" id="contraseñareg" name="password">
            <br>
            <button type="submit">Registrarse</button>
        </form>
        <form action="/" method="GET">
        <button type="submit">Volver</button>
        </form>
    </body>
    </html>`);
});
app.post('/registrarse', (req, res) => {
    const {email, password, name} = req.body;
    let consulta;
    if (email != null && password != null && name != null && email != "" && password !="" && name != ""){
        if(email.length>=4 && password.length>=4&& name.length>=4){
            let query="SELECT * FROM users WHERE correo=?";
        conexionBD.query(query,[email], function (error, results, fields) {
            if (error) throw error;
            consulta = results[0];
            if(consulta == 0 || consulta==undefined){
                    let query ="INSERT INTO users(nombre, correo, pass, admin, estado) values (?,?,?,0,0)" ;
                    //conexionBD.query("INSERT INTO users(nombre, correo, pass, admin, estado) values ('"+name+"','"+email+"','"+password+"',0,0)", function (error, results, fields) {
                    conexionBD.query(query,[name, email, password], function (error, results, fields) {
                        if (error) throw error;
                        
                        // AQUI ES DONDE DEBO REDIRECCIONAR HACIA LA PÁGINA PRINCIPAL
                        res.redirect("/");
                    })
                }else{
                    res.send(`<!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Registrarse</title>
                    </head>
                    <body>
                        <h1>Registrate</h1>
                        <form action="/registrarse" method="POST">
                            <label for="nombre">Nombre</label>
                            <input type="text" id="nombrereg" name="name"required minlength="5">
                            <br>
                            <label for="correo">Correo</label>
                            <input id="correoreg" type="text" name="email"required minlength="5">
                            <br>
                            <label for="contraseña">contraseña</label>
                            <input type="text" id="contraseñareg" name="password" required minlength="5">
                            <button type="submit">Registrarse</button>
                        </form>
                        <h2>YA EXISTE UNA CUENTA ASOCIADA A ESE CORREO</h2>
                        <form action="/" method="GET">
        <button type="submit">Volver</button>
        </form>
                    </body>
                    </html>`); 
                }
                
            })
        }
    }
            
        else{
            res.send(`<!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Registrarse</title>
                        </head>
                        <body>
                            <h1>Registrate</h1>
                            <form action="/registrarse" method="POST">
                                <label for="nombre">Nombre</label>
                                <input type="text" id="nombrereg" name="name"required minlength="5">
                                <br>
                                <label for="correo">Correo</label>
                                <input id="correoreg" type="text" name="email"required minlength="5">
                                <br>
                                <label for="contraseña">contraseña</label>
                                <input type="text" id="contraseñareg" name="password"required minlength="5">
                                <button type="submit">Registrarse</button>
                            </form>
                            <h2>HAY ALGÚN CAMPO EN BLANCO O TE FALTAN CARACTERES</h2>
                            <form action="/" method="GET">
        <button type="submit">Volver</button>
        </form>
                        </body>
                        </html>`);
        }
        
        });

app.get('/actualizarDatos', validateToken, (req, res) => {
    jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {

        if (err) {
          res.sendStatus(403);
         
        } else if(req.isAdmin==0){
            let id = req.session.myId;
            let query ="SELECT * FROM users WHERE id=? AND admin=0;" ;
            //conexionBD.query("SELECT * FROM users WHERE id="+id+" AND admin=0;", function (error, results, fields) {
            conexionBD.query(query,[id], function (error, results, fields) {
                if (error) throw error;
                let usuarioData = results[0];
                req.session.usrData=results[0];
                res.send(`
                        <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Registrarse</title>
                    </head>
                    <body>
                        <h1>Actualiza tus datos usuario</h1>
                        <form action="/update" method="POST">
                            <label for="nombre">Nombre</label>
                            <input type="text" id="nombrereg" value=${usuarioData.nombre} name="nombre" required minlength="5">
                            <br>
                            <label for="correo">Correo</label>
                            <input id="correoreg" type="text" value=${usuarioData.correo} name="correo" required minlength="5">
                            <br>
                            <label for="contraseña">contraseña</label>
                            <input type="text" id="contraseñareg" value=${usuarioData.pass} name="pass" required minlength="5">
                            <button type="submit">Actualizar datos</button>
                        </form>
                        <form action="/logged">
                            <input type="submit" value="Cerrar sesión"/>
                        </form>
                    </body>
                    </html>`);
                });
            }
            else{
                res.redirect("/");
            }
      });
    
});
app.post('/update',validateToken,(req, res) => {
        jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
            if (err) {
              res.sendStatus(403);
             
            }
            else{
                        let id=req.session.myId;
                        let usrData=req.body;
                if(usrData.nombre!= "" && usrData.correo!="" && usrData.pass!="" && id!="" && usrData){
                    try {
                        
                        let query = "UPDATE users SET nombre=?, correo=?, pass=? WHERE id=?;"
                    //conexionBD.query("UPDATE users SET nombre='"+usrData.nombre+"', correo='"+usrData.correo+"', pass='"+usrData.pass+"' WHERE id="+id+";", function (error, results, fields) {
                     conexionBD.query(query,[usrData.nombre,usrData.correo,usrData.pass,id], function (error, results, fields) {
                          if (error) throw error;
                          
                          return res.redirect('/actualizarDatos')});
                        
                    } catch (error) {
                        
                    }
                    
                }
                else{
                    return res.redirect('/actualizarDatos');
                }
                
                
            }
        })
})

app.post('/estadoUsr',validateToken,(req, res) => {
        jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
            if (err) {
              res.sendStatus(403);
             
            }
            else{
                let state;
                let id;
                if (req.body.activar){
                    state=1
                    id=req.body.activar
                }else{
                    state=0
                    id=req.body.desactivar
                }
                 
                let query ="UPDATE users SET estado =? WHERE id=?";
                //conexionBD.query("UPDATE users SET estado ="+state+" WHERE id="+id+";", function (error, results, fields) {
                conexionBD.query(query,[state,id], function (error, results, fields) {
                     if (error) throw error;
                     
                     return res.redirect('/panelAdmin')});
                
            }
        })
})
app.get('/panelAdmin', validateToken,(req, res) => {
    jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
        if (err) {
          res.sendStatus(403);
         
        } 
        
        else if(req.isAdmin==1){
            let usuario = conexionBD.query("SELECT * FROM users WHERE admin=0", function (error, results, fields) {
                if (error) throw error;
                //console.log('The solution is: ', results[0])
                let usuarios = results;
                //res.sendFile(__dirname+'/admin.html');
                res.send(`<!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Registrarse</title>
                    </head>
                    <body>
                        <h1>ESTE ES EL PANEL DE ADMINISTRADOR</h1>
                        <table class="default" id="tableUsers">
                            <tr>
                                <th>Id</th>
                                <th>Nombre de usuario</th>
                                <th>Correo</th>
                                <th>Contraseña</th>
                                <th>estado</th>
                                <th>cambiar estado</th>
                            </tr>           
                        </table>
                                    
                        <form action="/logged">
                            <input type="submit" value="Volver"/>
                        </form>
                    </body>
                </html>
                <script>
                    let usrs = ${JSON.stringify(usuarios)   }
                    let tabla = document.getElementById("tableUsers");
                    usrs.forEach((element)=>{
                        let tr = document.createElement('tr');
                        let tdId = document.createElement('td');
                        let tdnombre = document.createElement('td');
                        let tdCorreo = document.createElement('td');
                        let tdPass = document.createElement('td');
                        let tdEstado = document.createElement('td');
                        let tdChangeState = document.createElement('td');
                        tdId.textContent = element.id;
                        tdnombre.textContent = element.nombre;
                        tdCorreo.textContent = element.correo;
                        tdPass.textContent = element.pass;
                        tdEstado.textContent = element.estado;

                        let boton1 = document.createElement('button');
                        boton1.textContent = 'Activar';
                        boton1.value = element.id;
                        boton1.name="activar";
                        

                        let boton2 = document.createElement('button');
                        boton2.textContent = 'Desactivar';
                        boton2.value = element.id
                        boton2.name="desactivar"
                        
                        
                        let formAkt = document.createElement('form');
                        formAkt.action="/estadoUsr";
                        formAkt.method="POST";
                        formAkt.appendChild(boton1);
                        
                        let formDesakt = document.createElement('form');
                        formDesakt.action="/estadoUsr";
                        formDesakt.method="POST";
                        formDesakt.appendChild(boton2);
                          
                        tdChangeState.appendChild(formAkt);
                        tdChangeState.appendChild(formDesakt);

                        tr.appendChild(tdId);
                        tr.appendChild(tdnombre);
                        tr.appendChild(tdCorreo);
                        tr.appendChild(tdPass);
                        tr.appendChild(tdEstado);
                        tr.appendChild(tdChangeState);
                        tableUsers.appendChild(tr);
                        })
                    </script>
                `);

            });

        }

            else {
                res.redirect("/")
        }
      });
    
});

function generateAccessToken(user){
    return jwt.sign(user, process.env.SECRET, {expiresIn: '5m'})
}

    function validateToken(req, res, next){
         const token = req.cookies.token;
         try{
            const user = jwt.verify(token, process.env.SECRET);
            req.user = user;
            req.isAdmin = user.admin;
            return next();
         }
         catch(err){
            res.clearCookie('token');
            return res.redirect('/');
         }
    }


app.post('/auth', (req, res) => {
     
    const {email, password} = req.body;
    let query = "SELECT * FROM users WHERE correo=? AND pass=?"
    conexionBD.query(query,[email, password],(error, results)=> {
        if (error){
            console.error('Error:', error);
            return res.status(500).json({ error: 'Error query' });
          }
          let consulta = results[0];
          try {
            let idconsulta = consulta.id;
            const user= {email:email, admin:consulta.admin};
        if(consulta != 0 && consulta!=undefined){
            //AQUI INICIA JWT
            
            if(consulta.admin==0){
                
                const accessToken = generateAccessToken(user)
                if(consulta.estado==1){
                    //AQUI ESTÁ LA MÁGIA PERRÍN
                    res.cookie("token", accessToken, {
                        httpOnly: true
                    })
                    //anclar id a sesiones
                    
                    req.session.myId = idconsulta;
                    req.session.save(function(err) {
                    // session saved
                    })
                    //aqui mandamos hacia actualizar datos
                    //return res.redirect("/actualizarDatos");
                    return res.redirect("/logged");
                    
                }
                else{
                    
                    res.send("USUARIO DESACTIVADO");
                }
                
            }
            else if(consulta.admin==1){
                const accessToken = generateAccessToken(user);
                res.cookie("token", accessToken, {
                    httpOnly: true
                })
                req.session.myId = idconsulta;
                return res.redirect("/logged");
                //return res.redirect("/panelAdmin");
            }
            
        }
        else{

            res.redirect("/error");
        }
          } catch (error) {
            res.redirect("/error");
          }
        
      });
    
    

});

app.get('/error', (req, res) => {
    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Autentificador</title>
    </head>
    <body>
        <h1>Iniciar sesión</h1>
        <h2>Hubo un error, no existe ese cliente o ingresaste datos de forma erronea.</h2>
        <div class="div_iniciar">
            <form action="/auth" method="POST">
                <label for="correo">Correo</label>
                <input id="correo" name="email" type="email" maxlength="50" required>
                <br>
                <label for="contraseña">contraseña</label>
                <input type="password" id="contraseña" name="password" type="password" maxlength="50" required> <br>
                <input type="submit" value="Iniciar sesión"/>
            </form>
            
        </div>
        <form action="/register">
            <input type="submit" value="Registrarse"/>
        </form>
    </body>
    </html>`);

});

// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//     if (error) throw error;
//     console.log('The solution is: ', results[0].solution);
//   });

const puerto = process.env.PORT || 3000;
app.listen(puerto, ()=>{
    console.log("servidor iniciado en "+ puerto)
})