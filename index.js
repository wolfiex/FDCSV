var width = 800; //window.innerWidth
var height = 800; //window.innerHeight


var r = 0.8 * d3.min([width, height]) / 2;
var color = d3.scaleOrdinal(d3.schemeCategory20);
var colour = ColourScheme(blues_fade, (inverse = false), (test = false));

var simulation;
var graph, columns, cr;

console.log("attraction pole is opposite to label");

function newfile(file="./DanData.csv") {
    d3.csv(file, d => {
        splitfile = file.split('/')
        console.log(splitfile.length)
        document.getElementById('filename').innerHTML=splitfile[splitfile.length-1]
        window.data = d;

        columns = Object.keys(window.data[0]).filter(d => {
            if (d != "id_household") {
                return 1;
            }
        });
        columns.shift();
        c = columns;

        document.getElementById("columncheck").innerHTML=''

        d3.select("#sizes").selectAll("option").remove();
        select0 = document.getElementById("sizes");

        d3.select("#colours").selectAll("option").remove();
        select1 = document.getElementById("colours");


        c.forEach(d => {
            [select0, select1].map(select => {
                var option = document.createElement("option");
                option.text = option.value = d;
                select.add(option, 1);
            });


            var checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.className = "selectioncolumns";
            checkbox.checked = false;
            checkbox.onchange = run;
            checkbox.id = d;

            checkbox.style['pointer-events'] ='all';
            // add the label element to your div
            document.getElementById("columncheck").appendChild(checkbox);
            var description = document.createTextNode(d);
            document.getElementById("columncheck").appendChild(description);
            var br = document.createElement("br");
            document.getElementById("columncheck").appendChild(br);
        });


    showcsv()
    //make csv

    var html = '<thead> <th> Id </th><th>' + c.join('</th><th>') + '</th><thead> <tbody>'
    window.data.forEach((e,i)=>{


        html = html +'<tr>'+'<td style="fill:red">' + i + '</td>'
            c.forEach(f=>{
                html+= '<td>' + e[f] + '</td>'
            })
        html = html+ '</tr>'

    })

    html= html +'</tbody>'
    document.getElementById('csvtable').innerHTML=html


    window.sizevar=c[1]
    window.colvar=c[1]


    document.getElementById('nclust').value=data.length
    document.getElementById('niter').value=1

    run();
    setTimeout(run, 1000);


    });




}
function showcsv(){
    d3.select("svg").remove();
    document.getElementById('csvtablediv').style.display='block'
    }




    function run() {
        document.getElementById('csvtablediv').style.display='none'
        d3.select("svg").remove();
        d3.select("#putsvghere").append("svg");
        var svg = d3.select("svg").attr("width", width).attr("height", height);

        simulation = d3
            .forceSimulation()
            .force(
                "link",
                d3
                    .forceLink()
                    .id(function(d) {
                        return d[""];
                    })
                    .distance(
                        d =>
                            r *
                            (
                                parseFloat(document.getElementById("multiplier").value) /
                                    300) *
                            Math.pow(d.weight, 2)
                    )
                    .strength(1)
            )
            .force("charge", d3.forceManyBody().strength(-5));
        //.force("center", d3.forceCenter(0, height/2))
        if (document.getElementById("collide").checked)
            simulation.force(
                "collide",
                d3
                    .forceCollide()
                    .radius(function(d) {
                        return 1 + d.r + 0.25;
                    })
                    .iterations(2)
            );

        var nodesize = parseFloat(document.getElementById("size").value)/ 8;

        document.getElementById("sizes").value = window.sizevar;
        document.getElementById("colours").value = window.colvar;

        //columns =document.getElementById('coltext').value.split(',')

        columns = [...document.getElementsByClassName("selectioncolumns")]
            .filter(d => {
                if (d.checked) return 1;
            })
            .map(d => d.id);

        console.log(!columns.length)



        if (!columns.length)         {


            svg.append("text")
          .attr("y", height/2)//magic number here
          .attr("x", width/2)
          .attr('text-anchor', 'middle')
          .style('display','static')
          .text("Please select columns from left hand menu");

          //sizevar = window.c[0]
          colvar = window.c[1]

      }







        graph = {};

        var scalesize = data.map(d => parseFloat(d[sizevar]));
        min = d3.min(scalesize)
        max = d3.max(scalesize)
        var scalesize = d3
            .scaleLinear()
            .domain([min,max])
            .range([0.1, 1]);


        var scalecol = data.map(d => parseFloat(d[colvar]));
        var scalecol = d3
            .scaleLinear()
            .domain([d3.min(scalecol), d3.max(scalecol)])
            .range([ 0,1]);

        cr = d3.scaleSequential(d3.interpolateYlGnBu).domain([1, 100]); // Points per square pixel.

        graph.nodes = data.map(d => {
            d.x = width / 2;
            d.y = height / 2;
            d.r = nodesize * scalesize(parseFloat(d[sizevar]));
            return d;
        });
        graph.links = [];

        columns.forEach((d, i) => {
            var theta = Math.PI * 2 / columns.length;
            var angle = theta * i;
            var n90 = Math.PI / 2;

            x = r * Math.cos(angle);
            y = r * Math.sin(angle);

            graph.nodes.push({ "": d, fx: x + width / 2, fy: y + height / 2 });

            svg
                .append("text")
                //.attr("class", "name")
                .attr("dy", ".31em")
                .attr("transform", function(d) {
                    return (
                        "rotate(" +
                        0 + //((angle/Math.PI)*180) -90+
                        ")translate(" +
                        (width / 2 - x) +
                        "," +
                        (height / 2 - y) +
                        ")" +
                        " " //(angle-n90 < Math.PI ? "" : "rotate(180)")
                    );
                })
                .style(
                    "font",
                    "13px Helvetica Neue, Helvetica, Arial, sans-serif"
                ) //9
                .style("text-anchor", function(d) {
                    return angle - n90 < Math.PI ? "start" : "end";
                })
                .text(d);
        });

        var index = data.map((i,d) => (d[""]==undefined)? i:d[""]);
        columns.map(d => {
            dt = data.map(e => Math.log10(e[d]));
            var scaled = d3
                .scaleLinear()
                .domain([d3.min(dt), d3.max(dt)])
                .range([ 0.001,1]);

            dt = dt.map((e, i) => {
                w = scaled(e);
                graph.links.push({ source: d, target: index[i], weight: w });
            });
        });

setTimeout(function(){console.log(graph.links), graph.nodes}, 1000)


        var link = svg
            .append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graph.links)
            .enter()
            .append("line")
            .attr("stroke", "#999")
            .attr(
                "opacity",
                d =>
                    (document.getElementById("linkscheck").checked ? 0.6 : 0.01)
            )
            .attr("stroke-width", function(d) {
                return Math.sqrt(d.value);
            });

        var node = svg
            .append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(graph.nodes)
            .enter()
            .append("circle")
            .attr("r", d => {
                return d.r === undefined ? 0 : 1 + d.r;
            })
            .attr("fill", d => {
                var c = colour(scalecol(d[colvar]));
                return c;
            })
            .attr("stroke-width", 0.6)
            .attr("stroke", "white")
            .on("mouseover", d => {
                console.log(d[""]);
                columns.forEach(e => {
                    console.log(e, d[e]);
                });
            })
            .attr("id", (d, i) => "node" + i)
            .on("click", d => {
                alert(JSON.stringify(d));
            });
        node.append("title").text(function(d) {
            return JSON.stringify(d);
        });

        simulation.nodes(graph.nodes).on("tick", ticked);

        simulation.force("link").links(graph.links);

        function ticked() {
            link
                .attr("x1", function(d) {
                    return d.source.x;
                })
                .attr("y1", function(d) {
                    return d.source.y;
                })
                .attr("x2", function(d) {
                    return d.target.x;
                })
                .attr("y2", function(d) {
                    return d.target.y;
                });

            node
                .attr("cx", function(d) {
                    return d.x;
                })
                .attr("cy", function(d) {
                    return d.y;
                });
        }

        window.cluster = graph.nodes.map(d => 0);
    }

newfile();


//run();
//simulation.stop()
