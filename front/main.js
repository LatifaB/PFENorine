
//alert("debut");


/*var xhr = new XMLHttpRequest();


xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
        var nodes = xhr.responseXML.getElementsByTagName("smiles");
	      var ol = document.createElement("ol"), li, cn;
	      for (var i=0, c=nodes.length; i<c; i++) {
		          li = document.createElement("li");
		          cn = document.createTextNode(nodes[i].value);
              console.log(node[i]);
              li.appendChild(cn);
              ol.appendChild(li);
        }

	      document.getElementById("output").appendChild(ol);
    }
};


xhr.open('GET', 'http://bioinfo.lifl.fr/norine/rest/monomers/flat/xml', true);

xhr.send(null);
*/

var req = new XMLHttpRequest();
req.open('GET', 'http://bioinfo.lifl.fr/norine/rest/id/json/00123', false);
req.withCredentials = true;
req.send(null);

//alert("fin");
