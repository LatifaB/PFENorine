  var xhr = new XMLHttpRequest();

  xhr.open('GET', 'http://bioinfo.lifl.fr/norine/rest/monomers/flat/json');


  xhr.addEventListener('readystatechange', function() {

      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {

          //var response = JSON.parse(xhr.responseText);
          //document.getElementById('fileContent').innerHTML = '<span>' + xhr.responseText + '</span>';
          alert(xhr.responseText);
      }
alert(xhr.responseText);
  });

  xhr.send(null);
