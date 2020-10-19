//Llenar select
$(document).ready(function(){
  DesplegarListas();
  EventoAgregarProductoLista();
  EventoPanelNuevaLista();
});


function DesplegarListas(){
  
    chrome.storage.sync.get(null, function(items) {
        var allKeys = Object.keys(items);
        $('#selectLista').empty();
        for (i = 0; i < allKeys.length; i++) {
            $("#selectLista").append(new Option(allKeys[i], allKeys[i]));
        }
    });
  
}

function CapturaCategoryID(url){
    
    var category_id = url.toString();
    var indiceM = 37; //indice donde se encuentra la M de los categoryID
    var indiceFinal = 0; //indice donde termina el categoryID; 

    if(Number.isInteger(parseInt(category_id.charAt(indiceM + 3), 10)) == false){ //verifico si el categoryID tiene '-' entre las letras y los numeros
        
      for(var i=indiceM + 4; i<indiceM + 20; i++){
        if(Number.isInteger(parseInt(category_id.charAt(i), 10)) == false){ //compruebo donde termina el categoryID (hasta encontrar un caracter que no sea un numero)
          indiceFinal = i;
          i = indiceM + 20; //para salir del for
        }
      }  
        
      category_id = category_id.substr(indiceM,3) + category_id.substr(indiceM + 4, indiceFinal - (indiceM + 4)); //obtengo el categoryID mediante substr() y los indices
        
      }
    else{ //si no tiene '-' en el categoryID
        
      for(var i=indiceM + 3; i<indiceM + 20; i++){
        verificaciones = category_id.charAt(i);
        if(Number.isInteger(parseInt(verificaciones, 10)) == false){
          indiceFinal = i;
          i = indiceM + 20;
          
        }
      }  
        
      category_id = category_id.substr(indiceM, indiceFinal-indiceM);
    }
    
    return category_id;
}

function AgregarProducto(category_id){
  var linkAPI = "https://api.mercadolibre.com/items/" + category_id + "?include_attributes=all";
              
  fetch(linkAPI).then(data => data.text()).then(data =>{
    var i = JSON.parse(data);
    

    
    var valorLista = $( "#selectLista" ).val(); //Lista seleccionada
    //Se agrega a una lista
    if(valorLista !== null){
    
      ide.innerHTML = i.id;
      nombre.innerHTML = i.title;
      estado.innerHTML = i.status;      
      precio.innerHTML = i.price;

      diccionariofoto = i.pictures;
      arregloFoto = diccionariofoto[Object.keys(diccionariofoto)[0]];
      foto = arregloFoto[Object.keys(arregloFoto)[2]];
      console.log(foto);

      //Se crea el producto
      var producto = [i.title, i.price, i.status, i.permalink, foto, i.id];

      var productoServidor = {
        title: i.title,
        price: i.price,
        status: i.status,
        permalink: i.permalink,
        id: i.id,
        nombrelista: valorLista
      }

      $.ajax({
        type: "POST",
        url: "http://localhost:3000/altaProducto",
        data: productoServidor
      });

      var diccionarioProducto = {};       
      var key = i.id;  
      diccionarioProducto[key]= producto;   

      

      chrome.storage.sync.get(function(cfg) {
        if(typeof(cfg[valorLista]) !== 'undefined' && cfg[valorLista] instanceof Array) { 
          cfg[valorLista].push(diccionarioProducto);
        } 
        chrome.storage.sync.set(cfg); 
      });

    } else{
      alert('No hay listas!');
    }

  });

}

async function VerificacionExistenciaProducto(){
  
  var p2 = new Promise(function(resolve, reject){
    chrome.tabs.getSelected(null,function(tab) {
      resolve(CapturaCategoryID(tab.url));
    });
  });
  const category_id = await p2;
  
  var p = new Promise(function(resolve, reject){  
      var existe = false;
      chrome.storage.sync.get(null, function(items){
        var allkeys = Object.keys(items);
        for(var i=0; i<allkeys.length; i++){

          var p3 = new Promise(function(resolve, reject){
            chrome.storage.sync.get(allkeys[i], function (lista) { //Obtiene la lista
              $.map(lista, function(productosEnLista, nombreLista) { //Obtiene los productos en la lista
                $.map(productosEnLista, function(producto, llaveProducto) {  //Separa a los productos
                  $.map(producto, function(datosProducto, categoryID) {
                    if(categoryID === category_id){                     
                      existe = true;
                    }
                  });
                });
              });
              resolve(existe);
            });           
          });
          async function traerExiste(p3){
            return await p3;
          };  
          var existe2 = traerExiste(p3); 
          console.log("existe2: " + existe2);     
        }
        
       resolve(existe2);
        
      });
      
  });
  
  const productoYaCargado = await p;

  //setTimeout(function(){
    console.log("verificacion: " + productoYaCargado);

    if(productoYaCargado == false){
      AgregarProducto(category_id);
    }
    else if(productoYaCargado == true){
      alert("El producto ya se encuentra en una lista!");
    }                     
  //}, 500);
  
  
}

function EventoAgregarProductoLista(){
  $("#btnAgregarLista").click(function(){
    VerificacionExistenciaProducto();
  });
  
}

function EventoPanelNuevaLista(){
  $("#nuevaLista").click(function(){
    $("#contenedor").hide();
    $("#contenedorNuevaLista").show();
    EventoBotonRetroceso();
    EventoCrearLista();
  });
}

function EventoBotonRetroceso(){
  $("#retroceso").click(function(){
    $("#contenedorNuevaLista").hide();
    $("#contenedor").show();
  })
}

function EventoCrearLista(){
  $(document).on('click','#btnCrearLista', function() {
      var existe = false;
      var Lista = {};       
      var nombre = document.getElementById('nombreLista').value;  
      chrome.storage.sync.get(null, function(items) {
        var allKeys = Object.keys(items);
        for (i = 0; i < allKeys.length; i++) {
            if(nombre == allKeys[i]){
              existe = true;
            }
        }
        if(existe == false){
          Lista[nombre]= [];
          chrome.storage.sync.set(Lista);
          DesplegarListas();  
          var listaServidor = {
            nombre: nombre
          }

          $.ajax({
            type: "POST",
            url: "http://localhost:3000/altaLista",
            data: listaServidor
          });

          $("#contenedorNuevaLista").hide();
          $("#contenedor").show();        
         
        }
        else if(existe == true){
          alert("Ya hay una lista con ese nombre!");
        }
      });
  });
}