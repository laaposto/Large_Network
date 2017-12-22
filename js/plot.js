var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11"];

sigma.classes.graph.addMethod('neighbors', function (nodeId) {
    var k,
        neighbors = {},
        index = this.allNeighborsIndex[nodeId] || {};

    for (k in index)
        neighbors[k] = this.nodesIndex[k];

    return neighbors;
});

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
        x: xis[i],
        y: yis[i],
        size: sizes[i],
        color: colors[clusters[i]],
        originalColor: colors[clusters[i]],
        bg: bg[i],
        name: names[i],
        tweets: tweets[i],
        following: following[i],
        followers: followers[i]
    });
}
s = new sigma({
    graph: g,
    renderer: {
        container: document.getElementById('graph-container'),
        type: 'webgl'
    },
    settings: {
        batchEdgesDrawing: true,
        borderSize: 1,
        defaultNodeBorderColor: "#333",
        labelThreshold: 16,
        minNodeSize: 3,
        maxNodeSize: 15,
        hideEdgesOnMove: true
    }
});

s.bind('clickNode', function (e) {
    var neighbors = [], edges_neighbors = [];
    $('#twPc-button,#connections_stats,#connections_users').empty();
    twttr.widgets.createFollowButton(
        e.data.node.id,
        document.getElementById('twPc-button'),
        {
            size: 'large',
            showCount: false,
            showScreenName: false
        }
    ).then(function () {
            $('.user_profile_wrapper').show()
            setTimeout(function () {
                $('iframe').show();
            }, 500)
        });
    var $twPc_StatValue = $('.twPc-StatValue');
    $('.twPc-bg').css('background-image', 'url("' + e.data.node.bg + '")');
    $('.twPc-avatarLink,.twPc-divUser a').attr('href', 'https://twitter.com/' + e.data.node.id);
    $('.twPc-avatarImg').attr('src', 'http://twitter.com/' + e.data.node.id + '/profile_image');
    $('.twPc-divName a').text(e.data.node.name);
    $('.twPc-divUser span:eq(1)').text(e.data.node.id);
    $twPc_StatValue.eq(0).text(e.data.node.tweets);
    $twPc_StatValue.eq(1).text(e.data.node.following);
    $twPc_StatValue.eq(2).text(e.data.node.followers);

    var degree = e.data.node.size;
    var stats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    s.graph.clear();
    var count_edges = 0;
    for (i = 0; ((i < edges.length) && (count_edges < degree)); i++) {
        if ((edges[i].indexOf(e.data.node.id + ';') === 0) || (edges[i].endsWith(';' + e.data.node.id))) {
            count_edges++;
            edges_neighbors.push(edges[i]);
            neighbors.push(edges[i].replace(e.data.node.id + ';', '').replace(';' + e.data.node.id, ''));
        }
    }
    neighbors.push(e.data.node.id);
    neighbors = uniq_fast(neighbors);
    var connection_div = [];

    for (i = 0; i < users.length; i++) {
        if (neighbors.indexOf(users[i]) === -1) {
            s.graph.addNode({
                id: users[i],
                label: users[i],
                x: xis[i],
                y: yis[i],
                size: sizes[i],
                color: '#eee',
                originalColor: colors[clusters[i]],
                bg: bg[i],
                name: names[i],
                tweets: tweets[i],
                following: following[i],
                followers: followers[i]
            });
        }
    }

    for (i = 0; i < neighbors.length; i++) {
        var index = users.indexOf(neighbors[i]);
        s.graph.addNode({
            id: users[index],
            label: users[index],
            x: xis[index],
            y: yis[index],
            size: sizes[index],
            color: colors[clusters[index]],
            originalColor: colors[clusters[index]],
            bg: bg[index],
            name: names[index],
            tweets: tweets[index],
            following: following[index],
            followers: followers[index]
        });
        connection_div.push({size: sizes[index], user: users[index], color: colors[clusters[index]]});
    }
    connection_div.sort(function (a, b) {
        return b.size - a.size;
    });

    for (i = 0; i < edges_neighbors.length; i++) {
        s.graph.addEdge({
            id: edges_neighbors[i],
            source: edges_neighbors[i].split(';')[0],
            target: edges_neighbors[i].split(';')[1],
            color: colors[clusters[users.indexOf(edges_neighbors[i].split(';')[0])]],
            hidden: false
        });
        stats[clusters[users.indexOf(edges_neighbors[i].replace(';', '').replace(e.data.node.id, ''))]]++;
    }

    for (var i = 0; i < 3; i++) {
        var max_value = Math.max.apply(Math, stats);
        if (max_value > 0) {
            var max_index = stats.indexOf(max_value);
            $('#connections_stats').append('<div class="connections_bullet"><div class="legendcolor" style="background-color:' + colors[max_index] + ';"></div><div class="legendtext">' + stats[max_index] + ' (' + ((stats[max_index] / degree) * 100).toFixed(0) + '%)</div></div>')
            stats[max_index] = -1;
        }
    }

    var offs = [];
    $(".legendcolor").each(function () {
        if ($(this).next('.legendtext').hasClass('off')) {
            offs.push(rgb2hex($(this).css('backgroundColor')))
        }
    });

    s.graph.nodes().forEach(function (n) {
        if ((jQuery.inArray(n.originalColor, offs) !== -1)) {
            n.hidden = true;
        }
        else {
            n.hidden = false;
        }
    });
    s.refresh();
    for (var i = 0; ((i < connection_div.length) && (i < 15)); i++) {
        $('#connections_users').append('<div class="connection_user"><div class="connection_user_img_wrapper"><img src="http://twitter.com/' + connection_div[i].user + '/profile_image" class="connection_user_img"><div class="legendcolor" style="background-color:' + connection_div[i].color + ';"></div></div><p class="connection_user_name">' + connection_div[i].user + '</p><br><p class="connection_user_count">Degree: ' + connection_div[i].size + '</p></div>');
    }
    $('.connection_user_name:contains(' + e.data.node.id + ')').parents('.connection_user').remove();
});

s.bind('clickStage', function (e) {
    if (!(e.data.captor.isDragging)) {
        s.graph.nodes().forEach(function (n) {
            n.color = n.originalColor;
        });
        s.graph.edges().forEach(function (e) {
            e.hidden = true;
        });
        $('.user_profile_wrapper').hide();
        s.refresh();
    }
});

$('#legend_close').click(function (e) {
    e.preventDefault();
    var $this = $(this);
    if ($this.hasClass('down_arrow')) {
        $this.removeClass('down_arrow');
        $('.legend_wrapper').eq(0).addClass('border_dashed');
        $('.legend_wrapper').eq(0).removeClass('border_solid');
        $('#legend_main').slideDown();
    }
    else {
        $this.addClass('down_arrow');
        $('.legend_wrapper').eq(0).removeClass('border_dashed');
        $('.legend_wrapper').eq(0).addClass('border_solid');
        $('#legend_main').slideUp();
    }
});
$('#navigation_close').click(function (e) {
    e.preventDefault();
    var $this = $(this);
    if ($this.hasClass('down_arrow')) {
        $this.removeClass('down_arrow');
        $('.legend_wrapper').eq(1).addClass('border_dashed');
        $('.legend_wrapper').eq(1).removeClass('border_solid');
        $('#navigation_main').slideDown();
    }
    else {
        $this.addClass('down_arrow');
        $('.legend_wrapper').eq(1).removeClass('border_dashed');
        $('.legend_wrapper').eq(1).addClass('border_solid');
        $('#navigation_main').slideUp();
    }
});

$(".legendcolor").click(function () {
    var offs = [];
    if ($(this).next('.legendtext').hasClass('off')) {
        $(this).next('.legendtext').removeClass('off');
    }
    else {
        $(this).next('.legendtext').addClass('off');
    }

    $(".legendcolor").each(function () {
        if ($(this).next('.legendtext').hasClass('off')) {
            offs.push(rgb2hex($(this).css('backgroundColor')))
        }
    });

    s.graph.nodes().forEach(function (n) {
        if ((jQuery.inArray(n.originalColor, offs) !== -1)) {
            n.hidden = true;
        }
        else {
            n.hidden = false;
        }
    });
    s.refresh();
});

function rgb2hex(rgb) {
    rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    function hex(x) {
        return ("0" + parseInt(x).toString(16)).slice(-2);
    }

    return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}
function uniq_fast(a) {
    var seen = {};
    var out = [];
    var len = a.length;
    var j = 0;
    for (var i = 0; i < len; i++) {
        var item = a[i];
        if (seen[item] !== 1) {
            seen[item] = 1;
            out[j++] = item;
        }
    }
    return out;
}
String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};
$("#connections_users").on("click", ".connection_user", function () {
    var foundNode = s.graph.nodes($(this).find('.connection_user_name').text());
    var fakeData = {
        node: foundNode
    };
    s.renderers[0].dispatchEvent('clickNode', fakeData);
});
var input_selector = 'input[type=text]';
$(document).on('focus', input_selector, function () {
    $(this).siblings('label, i').addClass('active');
    $('.search_icon').attr('src', 'imgs/search-blue.png');
});
$(document).on('blur', input_selector, function () {
    var $inputElement = $(this);
    if ($inputElement.val().length === 0 && $inputElement[0].validity.badInput !== true && $inputElement.attr('placeholder') === undefined) {
        $inputElement.siblings('label, i').removeClass('active');
    }
    $('.search_icon').attr('src', 'imgs/search-gray.png');
});
var sort_by;
// utility functions
var default_cmp = function (a, b) {
        return (a > b) ? 1 : ((a < b) ? -1 : 0);
    },
    getCmpFunc = function (primer, reverse) {
        var cmp = default_cmp;
        if (primer) {
            cmp = function (a, b) {
                return default_cmp(primer(a), primer(b));
            };
        }
        if (reverse) {
            return function (a, b) {
                return -1 * cmp(a, b);
            };
        }
        return cmp;
    };

// actual implementation
sort_by = function () {
    var fields = [],
        n_fields = arguments.length,
        field, name, reverse, cmp;

    // preprocess sorting options
    for (var i = 0; i < n_fields; i++) {
        field = arguments[i];
        if (typeof field === 'string') {
            name = field;
            cmp = default_cmp;
        }
        else {
            name = field.name;
            cmp = getCmpFunc(field.primer, field.reverse);
        }
        fields.push({
            name: name,
            cmp: cmp
        });
    }

    return function (A, B) {
        var a, b, name, cmp, result;
        for (var i = 0, l = n_fields; i < l; i++) {
            result = 0;
            field = fields[i];
            name = field.name;
            cmp = field.cmp;
            if (name === "data") {
                result = cmp(A.data.category, B.data.category);
            }
            else {
                result = cmp(A.data.popularity, B.data.popularity);
            }

            if (result !== 0) break;
        }
        return result;
    }
};

autocomplete.sort(sort_by('data', {
    name: 'value',
    primer: parseInt,
    reverse: true
}));
$('#user').devbridgeAutocomplete({
    lookup: autocomplete,
    minChars: 3,
    beforeRender: function () {
        $('.autocomplete-suggestion').each(function () {
            if ($(this).next().hasClass('autocomplete-group')) {
                $(this).css('margin-bottom', '15px')
            }
        });
    },
    onSelect: function (suggestion) {
        var $user = $('#user');
        $user.val("");
        $user.blur();
        var foundNode = s.graph.nodes(suggestion.value);
        var fakeData = {
            node: foundNode
        };
        s.renderers[0].dispatchEvent('clickNode', fakeData);
    },
    showNoSuggestionNotice: true,
    noSuggestionNotice: 'Sorry, no matching results',
    groupBy: 'category'
});