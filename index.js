const express = require('express');
const app = express();

app.use(express.urlencoded({ extended:false }));
app.use(express.json());

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
                <input id="correo" type="text" name="email">
                <br>
                <label for="contraseña">contraseña</label>
                <input type="text" id="contraseña" name="password"> <br>
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
            <input type="text" id="nombrereg" name="name">
            <br>
            <label for="correo">Correo</label>
            <input id="correoreg" type="text" name="email">
            <br>
            <label for="contraseña">contraseña</label>
            <input type="text" id="contraseñareg" name="password">
            <button type="submit">Registrarse</button>
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
                    let registro = conexionBD.query("INSERT INTO users(nombre, correo, pass, admin, estado) values ('"+name+"','"+email+"','"+password+"',0,1)", function (error, results, fields) {
                        if (error) throw error;
                        console.log("registro exitoso");
                        // AQUI ES DONDE DEBO REDIRECCIONAR HACIA LA PÁGINA PRINCIPAL
                        // app.connect('/')
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

app.get('/actualizarDatos', (req, res) => {
    res.send(`<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registrarse</title>
    </head>
    <body>
        <h1>Actualiza tus datos</h1>
        <form action="" method="POST">
            <label for="nombre">Nombre</label>
            <input type="text" id="nombrereg">
            <br>
            <label for="correo">Correo</label>
            <input id="correoreg" type="text">
            <br>
            <label for="contraseña">contraseña</label>
            <input type="text" id="contraseñareg">
            <button type="submit">Registrarse</button>
        </form>
    </body>
    </html>`);
});
app.get('/api', (req, res) => {

});
app.post('/auth', (req, res) => {
    // console.log(req.body);
    const {email, password} = req.body;
    let consulta;
    let usuario = conexionBD.query("SELECT * FROM users WHERE correo='"+email+"' AND pass='"+password+"'", function (error, results, fields) {
        if (error) throw error;
        //console.log('The solution is: ', results[0])
        consulta = results[0];
        //console.log("LA CONSULTA ES ");
        //console.log(consulta);
        if(consulta != 0 && consulta!=undefined){
            if(consulta.admin==0){
                if(consulta.estado==1){
                    console.log("usuario común")
                    res.send("USUARIO COMÚN");
                }
                else{
                    console.log("usuario desactivado")
                    res.send("USUARIO DESACTIVADO");
                }
                
            }
            if(consulta.admin==1){
                console.log("usuario administrador")
                res.send("USUARIO ADMINISTRADOR"); 
            }
            
        }else{
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
                        <input id="correo" type="text" name="email">
                        <br>
                        <label for="contraseña">contraseña</label>
                        <input type="text" id="contraseña" name="password"> <br>
                        <input type="submit" value="Iniciar sesión"/>
                    </form>
                    <h2>Te equivocaste de correo o de contraseña</h2>
                </div>
                <form action="/register">
                    <input type="submit" value="Registrarse"/>
                </form>
            </body>
            </html>`);
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