var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc"];

var i,
    s,
    g = {
        nodes: [],
        edges: []
    };

for (i = 0; i < users.length; i++) {
    g.nodes.push({
        id: users[i],
        label: users[i],
        x: Math.random(),
        y: Math.random(),
        size: sizes[i],
        color: colors[clusters[i]]
    });
}

for (i = 0; i < edges.length - 1; i++) {
    g.edges.push({
        id: 'e' + i,
        source: edges[i].split(';')[0],
        target: edges[i].split(';')[1],
        color: '#fff',
        color_source: colors[users.indexOf(edges[i].split(';')[0])]
    });
}

s = new sigma({
    graph: g,
    renderer: {
        container: document.getElementById('graph-container'),
        type: 'webgl'
    },
    settings: {
        labelThreshold: 200,
        minEdgeSize: 0.5,
        maxEdgeSize: 4,
        enableEdgeHovering: false,
        edgeHoverColor: 'edge',
        defaultEdgeHoverColor: '#000',
        edgeHoverSizeRatio: 1,
        minNodeSize: 3,
        maxNodeSize: 15,
        drawEdges: false
    }
});

s.startForceAtlas2();
function get_stats() {
    var xis = [];
    var yis = [];
    s.killForceAtlas2();
    setTimeout(function () {
        s.graph.nodes().forEach(function (n) {
            xis.push(n.x);
            yis.push(n.y);
        });
        console.log(xis.join(','));
        console.log("----");
        console.log(yis.join(','));
    }, 1000);
}