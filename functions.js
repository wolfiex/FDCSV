var kmeans = require("ml-kmeans");


function clust(mech){
    
    mech = (mech==='kmean')? kmeanfn : gmmfn
    nclusters = parseInt(document.getElementById('nclust').value) || graph.nodes.length
    niter = document.getElementById('niter').value || 2;
    
    console.log(niter,nclusters,mech,d3.range(parseInt(niter)))
    d3.range(parseInt(niter)).map(d=>{console.log('iteration'+d);mech(nclusters)})
}

function kmeanfn(clusters) {
    clusters = clusters || graph.nodes.length;
    if (clusters>graph.nodes.length) {alert('More clusters set than nodes')}
    window.cluster = kmeans(
        graph.nodes.map(d => {
            return [d.x, d.y];
        }),
        clusters
    ).clusters.map((d, i) => {
        document.getElementById("node" + i).style.stroke = color(d);
        document.getElementById("node" + i).style.fill = "white";
        document.getElementById("node" + i).style["stroke-width"] = "2px";
        return d;
    });
}

var em = require("expectation-maximization");

function gmmfn(clusters) {
    clusters = clusters || graph.nodes.length;
    if (clusters>graph.nodes.length) {alert('More clusters set than nodes')}
    dx = window.innerWidth;
    dy = window.innerHeight;

    means = Array(clusters)
        .fill(0)
        .map(_ => [Math.random() * dx, Math.random() * dy]);

    covariances = Array(clusters)
        .fill(0)
        .map(_ => [[dx * dx * 0.01, 0], [0, dy * dy * 0.01]]);

    gmm = new GMM({
        dimensions: 2,
        bufferSize: 1000,
        weights: Array(clusters).fill(1 / clusters),
        means,
        covariances
    });

    points = graph.nodes.map(d => {
        gmm.addPoint([d.x, d.y]);
        return [d.x, d.y];
    });

    window.clusters = points
        .map(p => gmm.predict(p))
        .map(probs =>
            probs.reduce((iMax, x, i, arr) => (x > arr[iMax] ? i : iMax), 0)
        )
        .map((d, i) => {
            document.getElementById("node" + i).style.stroke = color(d);
            document.getElementById("node" + i).style.fill = "white";
            document.getElementById("node" + i).style["stroke-width"] = "2px";
            return d;
        });
}

function contour() {
    d3
        .select("svg")
        .insert("g", "g")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .attr("stroke-linejoin", "round")
        .selectAll("path")
        .data(
            d3
                .contourDensity()
                .x(function(d) {
                    return d.x;
                })
                .y(function(d) {
                    return d.y;
                })
                .size([width, height])
                .bandwidth(10)(graph.nodes)
        )
        .enter()
        .append("path")
        .attr("fill", function(d) {
            return null;
        })
        .attr("d", d3.geoPath());
}

function notify() {
    fs = require("fs");
    // Or with ECMAScript 6
    dialog = require("electron").remote;
    content =
        "cluster,houseid\n" +
        d3
            .range(graph.nodes.length)
            .map(
                d =>
                    window.cluster[d] + "," + graph.nodes[d].id_household + "\n"
            )
            .join("");

    dialog.showSaveDialog(fileName => {
        if (fileName === undefined) {
            console.log("You didn't save the file");
            return;
        }

        // fileName is a string that contains the path and filename created in the save file dialog.
        fs.writeFile(fileName, content, err => {
            if (err) {
                alert("An error ocurred creating the file " + err.message);
            }

            alert("The file has been succesfully saved");
        });
    });
}

///other

//slider colouring
HTMLInputElement.prototype.sliderVisualCalc = function() {
    if (this.min == "") {
        this.min = 0;
    }
    if (this.max == "") {
        this.max = 100;
    }
    this.style.backgroundSize =
        100 * ((this.value - this.min) / (this.max - this.min)) + "% 100%";
    if (this.classList.contains("slider-vertical")) {
        this.style.marginBottom = this.offsetWidth + "px";
    }
};

window.addEventListener(
    "load",
    function() {
        var sliders = document.getElementsByClassName("slider");
        for (var i = 0; i < sliders.length; i++) {
            sliders[i].sliderVisualCalc();
        }
    },
    false
);
window.addEventListener(
    "input",
    function() {
        event.target.sliderVisualCalc();
    },
    false
);
//console.log(HTMLInputElement.prototype);
//end sliderVisualCalc
