$(document).ready(function() {
    search_graph($('#seed_id').val(), 2);
});

function search_graph(seed_id, depth) {

    $.ajax({ url: "/graph/" + seed_id + "/depth/" + depth, dataType: 'json'}).done(build_graph);

}

function build_graph(graph) {
    var width = 1024,
        height = 640;

    var labelDistance = 0;
    
    var color = d3.scale.category20();
    
    // Get rid of the old svg
    $('body > svg').remove();

    nodes = graph.nodes
    links = graph.links
    var labelAnchors = [];
    var labelAnchorLinks = [];
    
    for(var i = 0; i < nodes.length; i++) {
        node = nodes[i]
        labelAnchors.push({
            node : node
        });
        labelAnchors.push({
            node : node
        });
        labelAnchorLinks.push({
            source : i * 2,
            target : i * 2 + 1,
            weight : 1
        });
    }; 
    
    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(120)
        .size([width, height])      
        .nodes(graph.nodes)
        .links(graph.links)
    
    force.start();
    
    var labelForce = d3.layout.force()
        .nodes(labelAnchors).links(labelAnchorLinks)
        .gravity(0).linkDistance(0)
        .linkStrength(8).charge(-100).size([width, height]);
    
    labelForce.start();
    

    var vis = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);
    
    var link = vis.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });
    
    var node = vis.selectAll(".node")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
        .style("fill", function(d) { return color(d.group); })
        .call(force.drag);
    
    var anchorLink = vis
        .selectAll("line.anchorLink")
        .data(labelAnchorLinks)
    var anchorNode = vis
        .selectAll("g.anchorNode")
        .data(labelForce.nodes())
        .enter().append("svg:g")
        .attr("class", "anchorNode");
    
    anchorNode.append("svg:circle").attr("r", 0).style("fill", "#FFF");
    
    anchorNode.append("svg:text").text(function(d, i) {
        console.log(d.node.name);
        return i % 2 == 0 ? "" : d.node.name;
    
    }).style("fill", "#555").style("font-family", "Arial").style("font-size", 12);
    
    var updateLink = function() {
        this.attr("x1", function(d) {
            return d.source.x;
        }).attr("y1", function(d) {
            return d.source.y;
        }).attr("x2", function(d) {
            return d.target.x;
        }).attr("y2", function(d) {
            return d.target.y;
        });
    
    }
    
    var updateNode = function() {
        this.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    
    }
    
    
    force.on("tick", function() {
    
        labelForce.start();
    
        node.call(updateNode);
    
        anchorNode.each(function(d, i) {
            if(i % 2 == 0) {
                d.x = d.node.x;
                d.y = d.node.y;
            } else {
                var b = this.childNodes[1].getBBox();
    
                var diffX = d.x - d.node.x;
                var diffY = d.y - d.node.y;
    
                var dist = Math.sqrt(diffX * diffX + diffY * diffY);
    
                var shiftX = b.width * (diffX - dist) / (dist * 2);
                shiftX = Math.max(-b.width, Math.min(0, shiftX));
                var shiftY = 5;
                this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
            }
        });
    
    
        anchorNode.call(updateNode);
    
        link.call(updateLink);
        anchorLink.call(updateLink);
    
    });
}
