let mysql = require('mysql');
let conexion = mysql.createConnection({
     host: 'localhost',
     database: 'practica1',
     user:'root',
     password:''
})

conexion.connect(function(err){
    if(err){
        throw err;
    }else{
        console.log("Conexión exitosa");
    }

});
