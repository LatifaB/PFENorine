/**
 * Created by Mohamed on 13/02/2017.
 */
var data;
var jsonArray = [];
var jsonDraw = 0;
var i = 0;
var l = 0;
var nClick = 0;
var elemOne = 0;
var elemTwo = 0;
var elemOneClass = "";
var elemTwoClass = "";
var typeOfLink = "";

// Ici on construit le jstree en passant l'url du json*/
$('#jstree_div').jstree({
    'core' : {
        'data' : {
            //"url" : "http://bioinfo.lifl.fr/norine/rest/monomers/jsontree",
            "url" : "infos.json",
            "dataType" : "json",
        }
    },
    'types': {
        'default' : {
            'icon': 'glyphicon glyphicon-leaf',
        }
    },
    "plugins" : [ "search", "wholerow", "types"]
});

// Ici on gére l'evenement sur clique d'un element du jstree
$('#jstree_div').on('changed.jstree', function (e, data) {
    var i, j, r = [];
    for(i = 0, j = data.selected.length; i < j; i++) {
        console.log(data.instance.get_node(data.selected[i]).original.smiles);
        var smile = data.instance.get_node(data.selected[i]).original.smiles;
        preDraw(smile, data.instance.get_node(data.selected[i]).original.color);
    }
})


var to = false;
// Ici la fonction search du jstree
$('#search_div').keyup(function () {
    if(to) { clearTimeout(to); }
    to = setTimeout(function () {
        var v = $('#search_div').val();
        $('#jstree_div').jstree(true).search(v);
    }, 250);
});


// Ici gestion de l'editeur de monomere (la partie dessin)
var width = 960, height = 500;

var color = d3.scale.category20();

var radius = d3.scale.sqrt()
    .range([0, 6]);

var svg = d3.select("body").select("div.svg_window").append("svg")
    .attr("position", "relative")
    .attr("width", "79%")
    .attr("height", 500);

svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "#ffffff")
    .call(d3.behavior.zoom().scaleExtent([0, 8]).on("zoom", zoom));

function zoom() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

var force = d3.layout.force()
    .size([width, height])
    .charge(-200)
    .linkDistance(function(d) { return radius(d.source.size) + radius(d.target.size) + 20; });

//Cette fonction retourne la taille des atomes. Certains sont plus grands que d'autres
function sizeAtome(atome){
    switch(atome) {
        case "C":
            return 2;
            break;
        case "O":
            return 1;
            break;
        case "N":
            return 1;
            break;
        case "S":
            return 3;
            break;
        case "Cl":
            return 3;
            break;
        case "Br":
            return 4;
            break;
        case "P":
            return 4;
            break;
        default :
            return 1;
    }
}

/**
 * Algorithme de parcours de SMILE. Prend la chaine de SMILE en entrée ainsi que sa couleur et retourne en sortie un
 * objet de type {"nodes": nodes, "links": links} qui va contenir un tableau de nodes (tous les atomes du monmère) et
 * un tableau de links (tous les liens dans le monmère)
 * @param smile
 * @param color
 */
function algo(smile, color){
    var nodesIndexes = [];
    var nodesIndexesCpt = 0;
    var nodes = [];
    var indexNodes = 0;
    var links = [];
    var indexLinks = 0;
    var type = "begin";
    var list = ['=','(',')','1','2','3','4','5','6','7','8','9'];
    var saved = [];
    var savedIndex = 0;
    var boucle = -1;
    var boucleIndex = 0;
    var cFound = false;
    var cFirst = false;
    var doubleSeparate = false;
    var typeLink = 1;
    var savedBoucle = [];
    var savedIndexBoucle = 0;
    var currentIndexBoucle = 0;

    for(var i=0; i<smile.length; i++) {
        if(list.indexOf(smile.charAt(i))==-1){
            nodesIndexes[nodesIndexesCpt] = i;
            nodesIndexesCpt++;
        }
    }

    for(var i=0; i<smile.length; i++){
        if(list.indexOf(smile.charAt(i))==-1 && type=="begin"){
            nodes[indexNodes] = {"atom": smile.charAt(i), "size": sizeAtome(smile.charAt(i)), "color": color};
            indexNodes++;
            type = "simple";
        }else if(list.indexOf(smile.charAt(i))==-1 && type=="simple") {
            if(smile.charAt(i)=="l"){
                if(nodes[indexNodes-1].atom=="C"){
                    nodes[indexNodes-1]={"atom": "Cl", "size": sizeAtome("Cl"), "color": color};
                }
            }else if(smile.charAt(i)=="r"){
                if(nodes[indexNodes-1].atom=="B"){
                    nodes[indexNodes-1]={"atom": "Br", "size": sizeAtome("Br"), "color": color};
                }
            }else if(smile.charAt(i)=="c"){
                nodes[indexNodes] = {"atom": "C", "size": sizeAtome("C"), "color": color};
                var src = nodesIndexes.indexOf(i-1);
                if(smile.charAt(i-1)>=1 && smile.charAt(i-1)<=9){
                    src = nodesIndexes.indexOf(i-2);
                }
                var tgt = nodesIndexes.indexOf(i);
                if(cFirst){
                    links[indexLinks] = {"source": src, "target": tgt, "bond": 1};
                    cFirst=false;
                }else{
                    links[indexLinks] = {"source": src, "target": tgt, "bond": typeLink};
                    typeLink = (typeLink==1) ? 2 : 1;
                }
                indexNodes++;
                indexLinks++;
            } else{
                nodes[indexNodes] = {"atom": smile.charAt(i), "size": sizeAtome(smile.charAt(i)), "color": color};
                var src = nodesIndexes.indexOf(i-1);
                if(smile.charAt(i-1)>=1 && smile.charAt(i-1)<=9){
                    src = nodesIndexes.indexOf(i-2);
                }
                var tgt = nodesIndexes.indexOf(i);
                links[indexLinks] = {"source": src, "target": tgt, "bond": 1};
                indexNodes++;
                indexLinks++;
            }
        }else if(list.indexOf(smile.charAt(i))==-1 && type=="double") {
            if (list.indexOf(smile.charAt(i-2)) != -1) {
                if(smile.charAt(i)=="c"){
                    nodes[indexNodes] = {"atom": "C", "size": sizeAtome("C"), "color": color};
                    var src = nodesIndexes.indexOf(i - 3);
                    var tgt = nodesIndexes.indexOf(i);
                    links[indexLinks] = {"source": src, "target": tgt, "bond": 2};
                } else {
                    nodes[indexNodes] = {"atom": smile.charAt(i), "size": sizeAtome(smile.charAt(i)), "color": color};
                    var src = nodesIndexes.indexOf(i - 3);
                    var tgt = nodesIndexes.indexOf(i);
                    links[indexLinks] = {"source": src, "target": tgt, "bond": 2};
                }
            } else {
                if(smile.charAt(i)=="c"){
                    nodes[indexNodes] = {"atom": "C", "size": sizeAtome("C"), "color": color};
                    var src = nodesIndexes.indexOf(i - 2);
                    var tgt = nodesIndexes.indexOf(i);
                    links[indexLinks] = {"source": src, "target": tgt, "bond": 2};
                } else {
                    nodes[indexNodes] = {"atom": smile.charAt(i), "size": sizeAtome(smile.charAt(i)), "color": color};
                    var src = nodesIndexes.indexOf(i - 2);
                    var tgt = nodesIndexes.indexOf(i);
                    links[indexLinks] = {"source": src, "target": tgt, "bond": 2};
                }
            }
            indexNodes++;
            indexLinks++;
            type = "simple";
        }else if(list.indexOf(smile.charAt(i))==-1 && type=="cross"){
            var cross = saved[savedIndex-1];
            if(smile.charAt(i)==="c"){
                nodes[indexNodes] = {"atom": "C", "size": sizeAtome("C"), "color": color};
                var src = nodesIndexes.indexOf(cross);
                var tgt = nodesIndexes.indexOf(i);
                if(cFirst){
                    links[indexLinks] = {"source": src, "target": tgt, "bond": 1};
                    cFirst=false;
                }else{
                    links[indexLinks] = {"source": src, "target": tgt, "bond": typeLink};
                    typeLink = (typeLink==1) ? 2 : 1;
                }
            } else {
                nodes[indexNodes] = {"atom": smile.charAt(i), "size": sizeAtome(smile.charAt(i)), "color": color};
                var src = nodesIndexes.indexOf(cross);
                var tgt = nodesIndexes.indexOf(i);
                links[indexLinks] = {"source": src, "target": tgt, "bond": 1};
            }
            indexNodes++;
            indexLinks++;
            saved.splice(savedIndex-1, 1);
            savedIndex--;
            if(doubleSeparate){
                doubleSeparate=false;
            }
            type = "simple";
        }else if(list.indexOf(smile.charAt(i))==-1 && type=="doubleCross"){
            var cross = saved[savedIndex-1];
            if(smile.charAt(i)==="c"){
                nodes[indexNodes] = {"atom": "C", "size": sizeAtome("C"), "color": color};
                var src = nodesIndexes.indexOf(cross);
                var tgt = nodesIndexes.indexOf(i);
                if(cFirst){
                    links[indexLinks] = {"source": src, "target": tgt, "bond": 1};
                    cFirst=false;
                }else{
                    links[indexLinks] = {"source": src, "target": tgt, "bond": typeLink};
                    typeLink = (typeLink==1) ? 2 : 1;
                }
            } else {
                nodes[indexNodes] = {"atom": smile.charAt(i), "size": sizeAtome(smile.charAt(i)), "color": color};
                var src = nodesIndexes.indexOf(cross);
                var tgt = nodesIndexes.indexOf(i);
                links[indexLinks] = {"source": src, "target": tgt, "bond": 2};
            }
            indexNodes++;
            indexLinks++;
            saved.splice(savedIndex-1, 1);
            savedIndex--;
            type = "simple";
        }else if(list.indexOf(smile.charAt(i))==-1 && (type=="separate" || type=="doubleSeparate")){
            if(smile.charAt(i)==="c"){
                nodes[indexNodes] = {"atom": "C", "size": sizeAtome("C"), "color": color};
                var src = nodesIndexes.indexOf(saved[savedIndex-1]);
                var tgt = nodesIndexes.indexOf(i);
                if(cFirst){
                    links[indexLinks] = {"source": src, "target": tgt, "bond": 1};
                    cFirst=false;
                }else{
                    links[indexLinks] = {"source": src, "target": tgt, "bond": typeLink};
                    typeLink = (typeLink==1) ? 2 : 1;
                }
            } else {
                nodes[indexNodes] = {"atom": smile.charAt(i), "size": sizeAtome(smile.charAt(i)), "color": color};
                var src = nodesIndexes.indexOf(saved[savedIndex-1]);
                var tgt = nodesIndexes.indexOf(i);
                if(type=="separate"){
                    links[indexLinks] = {"source": src, "target": tgt, "bond": 1};
                }else{
                    links[indexLinks] = {"source": src, "target": tgt, "bond": 2};
                }
            }
            if(doubleSeparate){
                doubleSeparate=false;
            }
            indexNodes++;
            indexLinks++;
            type = "simple";
        }else{
            if(smile.charAt(i)=='='){
                if(type=="cross"){
                    type = "doubleCross";
                }else if(type=="separate"){
                    type = "doubleSeparate";
                }else{
                    type = "double";
                }
            }else if(smile.charAt(i)=='('){
                if(doubleSeparate){
                    //on ne fait rien
                }else{
                    if(smile.charAt(i-1)>=1 && smile.charAt(i-1)<=9){
                        for(var c=i; c>=0; c--){
                            if(list.indexOf(smile.charAt(c))==-1){
                                saved[savedIndex] = c;
                                break;
                            }
                        }
                    }else{
                        saved[savedIndex] = i-1;
                    }
                    savedIndex++;
                }
                type = "separate";
            }else if(smile.charAt(i)>=1 && smile.charAt(i)<=9) {
                /*if(boucle==-1) {
                 boucle = i-1;
                 boucleIndex++;
                 if(smile.charAt(i-1)=="c"){
                 cFound=true;
                 cFirst=true;
                 }
                 }else{
                 var src = nodesIndexes.indexOf(i-1);
                 var tgt = nodesIndexes.indexOf(boucle);
                 if(cFound){
                 links[indexLinks] = {"source": src, "target": tgt, "bond": typeLink};
                 typeLink = (typeLink==1) ? 2 : 1;
                 cFound = false;
                 }else{
                 links[indexLinks] = {"source": src, "target": tgt, "bond": 1};
                 }
                 indexLinks++;
                 boucle = -1;
                 boucleIndex = 0;
                 }*/
                if(smile.charAt(i)>savedIndexBoucle){
                    for(var c=i-1; c>=0; c--){
                        if(list.indexOf(smile.charAt(c))==-1){
                            savedBoucle[savedIndexBoucle] = c;
                            savedIndexBoucle++;
                            break;
                        }
                    }
                    if(smile.charAt(i-1)=="c"){
                        cFound=true;
                        cFirst=true;
                    }
                }else{
                    var c=i-1;
                    var src =-1;
                    for(c; c>=0; c--){
                        if(list.indexOf(smile.charAt(c))==-1){
                            src = nodesIndexes.indexOf(c);
                            break;
                        }
                    }
                    var tgt = nodesIndexes.indexOf(savedBoucle[currentIndexBoucle]);
                    if(cFound){
                        links[indexLinks] = {"source": src, "target": tgt, "bond": typeLink};
                        typeLink = (typeLink==1) ? 2 : 1;
                        cFound = false;
                    }else{
                        links[indexLinks] = {"source": src, "target": tgt, "bond": 1};
                    }
                    indexLinks++;
                    //savedBoucle.splice(savedIndexBoucle-1, 1);
                    //savedIndexBoucle--;
                    currentIndexBoucle++;
                }
            }else{
                if(smile.charAt(i+1)=='('){
                    //on enregistre pas
                    doubleSeparate = true;
                }else{
                    type = "cross";
                }
            }
        }
    }
    data = {"nodes": nodes, "links": links};
    console.log(data);
}

/* Fonction qui va regrouper les différentes informations (link, bond) du monomere en un seul tableau puis
 appeler la fonction qui va dessiner le monomere */
function preDraw(smile, color){
    algo(""+smile, color);

    jsonArray[i] = data;

    jsonDraw2 = JSON.parse(JSON.stringify(jsonDraw));

    if(jsonDraw==0){
        var obj = data;
        for(var j=0; j<obj.links.length; j++){
            obj.links[j].id = i;
        }
        for(var j=0; j<obj.nodes.length; j++){
            obj.nodes[j].id = i;
        }
        jsonDraw = obj;
    }else{
        var obj = data;
        for(var j=0; j<obj.links.length; j++){
            obj.links[j].source += l;
            obj.links[j].target += l;
            obj.links[j].id = i;
        }
        for(var j=0; j<obj.nodes.length; j++){
            obj.nodes[j].id = i;
        }
        //ajouter le tout au tableau jsonDraw
        var c = 0;
        var len = jsonDraw.links.length;
        for (var j=len; j<obj.links.length+len; j++) {
            jsonDraw.links[j] = obj.links[c];
            c++;
        }

        c = 0;
        len = jsonDraw.nodes.length;
        for (var j=len; j<obj.nodes.length+len; j++) {
            jsonDraw.nodes[j] = obj.nodes[c];
            c++;
        }
    }

    l += jsonArray[i].nodes.length;
    i++;
    draw(jsonDraw);
}

// Fonction du bouton clear, qui va supprimer tout le contenu du SVG
function clearSvg(){
    jsonArray = [];
    jsonDraw = 0;
    jsonDraw2 = 0;
    i = 0;
    l = 0;
    nClick = 0;
    elemOne = 0;
    elemTwo = 0;
    elemOneClass = "";
    elemTwoClass = "";
    svg.selectAll('.link').remove();
    svg.selectAll('*[class^="node"]').remove();

}

/**
 * Fonction qui va dessiner les monomeres à partir d'un objet (graph) contenant un tableau de nodes et un tableau de links
 * @param graph
 */
function draw(graph){
    svg.selectAll('.link').remove();
    svg.selectAll('*[class^="node"]').remove();

    force
        .nodes(graph.nodes)
        .links(graph.links)
        .linkDistance(3)
        .on("tick", tick)
        .start();

    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("g")
        .attr("class", "link")
        .attr({
            id: function(d, i) {
                return 'link'+d.id;
            }
        })
        .on("click", doAction);

    link.append("line")
        .style("stroke-width", function(d) {
            if(d.type=="extralink"){
                return "7px";
            }
            return (d.bond * 2 - 1) * 2 + "px";
        })
        .style("stroke", function(d, i) {
            if(d.type=="extralink"){
                return "#1F2532";
            }
        });

    link.filter(function(d) { return d.bond > 1; }).append("line")
        .attr("class", "separator");

    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr({
            class: function(d, i) {
                return 'node'+d.id;
            }
        })
        .on("click", doAction)
        .call(force.drag);

    node.append("circle")
        .attr("r", function(d) { return radius(d.size); })
        .style("fill", function(d, i) { return d.color; })
        .style("stroke", function(d, i) { return d.color; });

    node.append("text")
        .attr("dy", ".35em")
        .attr("text-anchor", "middle")
        .text(function(d) { return d.atom; });

    function tick() {
        link.selectAll("line")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    }
}

/**
 * Cette fonction enregistre le type de bouton cliqué
 * @param clicked_id
 */
function link(clicked_id) {
    typeOfLink = clicked_id.toString();
}

/**
 * Cette fonction retourne la valeur du lien en fonction du bouton selectionné
 * @returns {number}
 */
function getBond(){
    switch(typeOfLink.toString()) {
        case "simpleMonomere":
            return 1;
            break;
        case "doubleMonomere":
            return 2;
            break;
        case "simpleAtome":
            return 1;
            break;
        case "doubleAtome":
            return 2;
            break;
    }
}

/**
 * Cette fonction retourne le type du lien, si c'est un lien entre atomes ou un lien entre mmonomeres
 * @returns {*}
 */
function getType(){
    switch(typeOfLink.toString()) {
        case "simpleMonomere":
            return "extralink";
            break;
        case "doubleMonomere":
            return "extralink";
            break;
        case "simpleAtome":
            return "";
            break;
        case "doubleAtome":
            return "";
            break;
    }
}

/**
 * Cette methode va faire appel au type de suppression suivant le bouton selectionné
 */
function doAction(){
    switch(typeOfLink) {
        case "select":
            break;
        case "deleteMonomere":
            deleteMonomere(this);
            break;
        case "deleteNode":
            deleteNode(this);
            break;
        case "deleteLink":
            deleteLink(this);
            break;
        default :
            addLink(this);
            break;
    }
}

/**
 * Cette methode supprime un monomère complet
 * @param el
 */
function deleteMonomere(el){
    if(typeOfLink!="deleteMonomere"){
        return;
    }
    var s = document.getElementsByTagName('svg')[0];
    var kids = s.childNodes;

    var elem = Array.prototype.indexOf.call(kids, el) - svg.selectAll("g.link")[0].length -1;
    var elemClass = el.classList[0];

    for(var cpt=0; cpt<jsonDraw.links.length; cpt++){
        if(jsonDraw.links[cpt].id == elemClass.split("node")[1] || jsonDraw.links[cpt].id1 == elemClass.split("node")[1] || jsonDraw.links[cpt].id2 == elemClass.split("node")[1]){
            jsonDraw.links.splice(cpt,1);
            cpt--;
        }
    }
    for(var cpt=0; cpt<jsonDraw.nodes.length; cpt++){
        if(jsonDraw.nodes[cpt].id == elemClass.split("node")[1]){
            jsonDraw.nodes.splice(cpt,1);
            cpt--;
            l--;
        }
    }
    draw(jsonDraw);
}

/**
 * Cette methode supprime un atome dans le monomère
 * @param el
 */
function deleteNode(el){
    if(typeOfLink!="deleteNode"){
        return;
    }

    var s = document.getElementsByTagName('svg')[0];
    var kids = s.childNodes;

    var elem = Array.prototype.indexOf.call(kids, el) - svg.selectAll("g.link")[0].length -1;
    var elemClass = el.classList[0];

    jsonDraw.nodes.splice(elem,1);

    for(var cpt=0; cpt<jsonDraw.links.length; cpt++){
        if(jsonDraw.links[cpt].source.index == elem || jsonDraw.links[cpt].target.index == elem){
            jsonDraw.links.splice(cpt,1);
            cpt--;
        }
    }
    draw(jsonDraw);
}

/**
 * Cette methode supprime un lien dans le monomère
 * @param el
 */
function deleteLink(el){
    if(typeOfLink!="deleteLink"){
        return;
    }

    var s = document.getElementsByTagName('svg')[0];
    var kids = s.childNodes;

    var elem = Array.prototype.indexOf.call(kids, el) - svg.selectAll("g.link")[0].length -1;
    var elemClass = el.classList[0];

    jsonDraw.links.splice(elem,1);

    draw(jsonDraw);

}


/**
 * Cette methode va créer un lien entre deux atomes ou deux monomères
 * @param el
 */
function addLink(el){
    var s = document.getElementsByTagName('svg')[0];
    var kids = s.childNodes;

    if(nClick==0){
        nClick = 1;
        elemOne = Array.prototype.indexOf.call(kids, el) - svg.selectAll("g.link")[0].length -1;
        elemOneClass = el.classList[0];

    }else if(nClick==1 /*&& ctrlKeyPressed*/){
        elemTwo = Array.prototype.indexOf.call(kids, el) - svg.selectAll("g.link")[0].length -1;
        elemTwoClass = el.classList[0];
        if(elemOneClass != elemTwoClass){
            var extraLink = {"source": elemOne, "target": elemTwo,  "bond": getBond(), "type": getType(), "id1": parseInt(elemOneClass.split("node")[1]), "id2": parseInt(elemTwoClass.split("node")[1])};
            jsonDraw.links[jsonDraw.links.length] = extraLink;
            draw(jsonDraw);
        }
        elemOne = 0;
        elemTwo = 0;
        nClick=0;
    }
}

/**
 * Cette fonction garde le focus sur un bouton s'il a été cliqué
 */
$('button').click(function(){
    console.log($(this));
    var buttons = document.getElementsByTagName('button');
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        button.className = "";
    }
    if($(this).hasClass('active')){
    } else {
        $(this).addClass('active')
    }
});