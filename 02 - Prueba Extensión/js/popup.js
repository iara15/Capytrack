//Llenar select
$(document).ready(function(){
  if($( "#selectLista" ).val() === null){
    chrome.storage.sync.get(null, function(items) {
        var allKeys = Object.keys(items);
        for (i = 0; i < allKeys.length; i++) {
            $("#selectLista").append(new Option(allKeys[i], allKeys[i]));
        }
    });
  }
});




 $(document).ready(function(){
  $("#btnAgregarLista").click(function(){
  
      //Obtener enlace
      chrome.tabs.getSelected(null,function(tab) {
        var category_id = tab.url;
      
        category_id = category_id.substr(37,13);
        category_id = category_id.substr(0,3) + category_id.substr(4, 10);
        var linkAPI = "https://api.mercadolibre.com/items/" + category_id + "?include_attributes=all";
      
        fetch(linkAPI).then(data => data.text()).then(data =>{
          var i = JSON.parse(data);
          
          console.log(i);
          
          ide.innerHTML = i.id;
          nombre.innerHTML = i.title;
          estado.innerHTML = i.status;      
          precio.innerHTML = i.price;
    
           
          
          var valorLista = $( "#selectLista" ).val(); //Lista seleccionada
          //Se agrega a una lista
          if(valorLista !== null){
          
            //Se crea el producto
            var producto = [i.title, i.price, i.status];
       
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
    });
  });
});


$(document).ready(function(){
  $("#nuevaLista").click(function(){
    $("#inferior").hide();
    $("#contenedor").append('<div id="crearLista"> <h4>Nombre de lista</h4><input type="text" id="nombreLista" name="fname"><button id="btnCrearLista">Crear lista</button></div>');    
  });
});

$(document).on('click','#btnCrearLista', function() {
    console.log('Click!');
    var Lista = {};       
    var nombre = document.getElementById('nombreLista').value;  
    console.log(nombre);
    Lista[nombre]= [];
    chrome.storage.sync.set(Lista);
    $("#selectLista").append(new Option(nombre, nombre));
    $("#crearLista").hide();
    $("#inferior").show();
});
  