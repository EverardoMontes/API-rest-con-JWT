
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require("dotenv").config();

app.use(express.urlencoded({ extended:false }));
app.use(express.json());
app.use(cookieParser())
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
  }));
let mysql = require('mysql');
let conexionBD = mysql.createConnection({
     host: 'localhost',
     database: 'practica1',
     user:'root',
     password:''
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
                <input id="correo" type="text" name="email" type="email" maxlength="50">
                <br>
                <label for="contraseña">contraseña</label>
                <input type="password" id="contraseña" name="password" type="password" maxlength="10"> <br>
                <input type="submit" value="Iniciar sesión"/>
            </form>
            
        </div>
        <form action="/register">
            <input type="submit" value="Registrarse"/>
        </form>
    </body>
    </html>`);
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
            <label for="nombre">Nombre</label>
            <input type="text" id="nombrereg" name="name" type="text" maxlength="50">
            <br>
            <label for="correo">Correo</label>
            <input id="correoreg" type="text" name="email" type="email" maxlength="50">
            <br>
            <label for="contraseña">contraseña</label>
            <input type="text" id="contraseñareg" name="password">
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
    if (email != null && password != null && name != null){
        let usuario = conexionBD.query("SELECT * FROM users WHERE correo='"+email+"'", function (error, results, fields) {
            if (error) throw error;
            consulta = results[0];
            if(consulta == 0 || consulta==undefined){
                    console.log("registro")
                    let registro = conexionBD.query("INSERT INTO users(nombre, correo, pass, admin, estado) values ('"+name+"','"+email+"','"+password+"',0,0)", function (error, results, fields) {
                        if (error) throw error;
                        console.log("registro exitoso");
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
                            <input type="text" id="nombrereg" name="name">
                            <br>
                            <label for="correo">Correo</label>
                            <input id="correoreg" type="text" name="email">
                            <br>
                            <label for="contraseña">contraseña</label>
                            <input type="text" id="contraseñareg" name="password">
                            <button type="submit">Registrarse</button>
                        </form>
                        <h2>YA EXISTE UNA CUENTA ASOCIADA A ESE CORREO</h2>
                    </body>
                    </html>`); 
                }
                
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
                                <input type="text" id="nombrereg" name="name">
                                <br>
                                <label for="correo">Correo</label>
                                <input id="correoreg" type="text" name="email">
                                <br>
                                <label for="contraseña">contraseña</label>
                                <input type="text" id="contraseñareg" name="password">
                                <button type="submit">Registrarse</button>
                            </form>
                            <h2>HAY ALGÚN CAMPO EN BLANCO</h2>
                        </body>
                        </html>`);
        }
        
        });

app.get('/actualizarDatos', 
validateToken,
 (req, res) => {
    jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
        if (err) {
          res.sendStatus(403);
         
        } else {
            let id = req.session.myId;
            
            let usuario = conexionBD.query("SELECT * FROM users WHERE id="+id+" AND admin=0;", function (error, results, fields) {
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
                            <input type="text" id="nombrereg" value=${usuarioData.nombre}>
                            <br>
                            <label for="correo">Correo</label>
                            <input id="correoreg" type="text" value=${usuarioData.correo}>
                            <br>
                            <label for="contraseña">contraseña</label>
                            <input type="text" id="contraseñareg" value=${usuarioData.pass}>
                            <input type="submit" value="Actualizar datos"/>
                        </form>
                        <form action="/">
                            <input type="submit" value="Cerrar sesión"/>
                        </form>
                    </body>
                    </html>`);
                });
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
                let usrData=req.session.usrData
                console.log(req.body.nombre);
                 conexionBD.query("UPDATE users SET nombre='"+usrData.nombre+"', correo='"+usrData.correo+"', pass='"+usrData.pass+"' WHERE id="+id+";", function (error, results, fields) {
                      if (error) throw error;
                      
                      return res.redirect('/actualizarDatos')});
                
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
                 
                
                let usuario = conexionBD.query("UPDATE users SET estado ="+state+" WHERE id="+id+";", function (error, results, fields) {
                     if (error) throw error;
                     
                     return res.redirect('/panelAdmin')});
                
            }
        })
})
app.get('/panelAdmin', 
validateToken,
 (req, res) => {
    jwt.verify(req.cookies.token, process.env.SECRET, (err, authData) => {
        if (err) {
          res.sendStatus(403);
         
        } else {
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
                                    
                        <form action="/">
                            <input type="submit" value="Cerrar sesión"/>
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

        //   res.json({
        //     message: 'Protected data accessed',
        //     authData
        //   });
        
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
            next();
         }
         catch(err){
            res.clearCookie('token');
            return res.redirect('/');
         }
    }

app.post('/auth', (req, res) => {
    // console.log(req.body);
    const {email, password} = req.body;
    let consulta;
    let usuario = conexionBD.query("SELECT * FROM users WHERE correo='"+email+"' AND pass='"+password+"'", function (error, results, fields) {
        if (error) throw error;
        consulta = results[0];
        let idconsulta = consulta.id;
        if(consulta != 0 && consulta!=undefined){
            //AQUI INICIA JWT
            const user= {email:email, admin:consulta.admin};
            const accessToken = generateAccessToken(user)
            if(consulta.admin==0){
                if(consulta.estado==1){
                    //AQUI ESTÁ LA MÁGIA PERRÍN
                    res.cookie("token", accessToken, {
                        httpOnly: true
                    })
                    //anclar id a sesiones
                    req.session.myId=idconsulta;
                    return res.redirect("/actualizarDatos");
                    
                }
                else{
                    console.log("usuario desactivado")
                    res.send("USUARIO DESACTIVADO");
                }
                
            }
            if(consulta.admin==1){
                console.log("usuario administrador")
                res.cookie("token", accessToken, {
                    httpOnly: true
                })
                
                return res.redirect("/panelAdmin");
            }
            
        }else{
            res.redirect("/");
        }
      });
    
    

});

// connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
//     if (error) throw error;
//     console.log('The solution is: ', results[0].solution);
//   });


app.listen(3000, ()=>{
    console.log("servidor iniciado en 3000")
})