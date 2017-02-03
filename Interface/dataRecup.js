var xhr = new XMLHttpRequest();


xhr.open('GET', 'http://bioinfo.lifl.fr/norine/rest/monomers/jsontree', true);

xhr.responseType = 'json';

xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
        data = xhr.response;
        for(i in data[0].children){
            arbreNom((data[0].children)[i]);
        }
        console.log(data[0]);
        console.log(data[0].children);
        console.log((data[0].children)[0]);
        console.log((data[0].children)[0].children);
        console.log(((data[0].children)[0].children)[0]);
        console.log(((data[0].children)[0].children)[0].children);
        console.log((((data[0].children)[0].children)[0].children)[0]);
        if((((data[0].children)[0].children)[0].children)[0].children == null){
            console.log('null');
        }
    }
};

xhr.send(null);

//Recuperation des donnees
var xhr = new XMLHttpRequest();


xhr.open('GET', 'http://bioinfo.lifl.fr/norine/rest/monomers/jsontree', true);

xhr.responseType = 'json';

xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
        reponse = xhr.response;
        /*for(i in data){
         for( j in ( data[i] )){
         (data[i]).state.disabled = true;
         (data[i])["type"] = "root";
         /*for( k in  ((data.children[i]).children[j])){
         (((data.children)[i]).children)[j].state.disabled = true;
         for( l in  (((data.children[i]).children[j]).children[k])){
         ((data.children[i]).children[j]).children[k].state.disabled = true;
         };
         };
         };
         };*/
        console.log(reponse);
    }
};

xhr.send(null);
