function Windgraph() {
  this.selector = "not_defined";
  this.margin = {top: 20, right: 15, bottom: 60, left: 60};
  this.width = 960 - this.margin.left - this.margin.right;
  this.height = 960 - this.margin.top - this.margin.bottom;

  this.messages = new Bacon.Bus();
  this.visible = false;

  var wind = this.messages.filter(function (msg) {
    return msg.type === 'wind' && msg.reference === 'true boat'
  });
  var heading = this.messages.filter(function (msg) {
    return msg.type === 'course'
  }).map('.heading');
  var windWithGroundwind = wind.combine(heading,function (windData, heading) {
    return {
      heading: Number(windData.heading),
      groundWind: Number(heading) + Number(windData.angle),
      speed: Number(windData.speed)
    }
  }).throttle(1000);

  var that = this;
  var windWithHistory = windWithGroundwind.slidingTimeWindow(10 * 60 * 1000).onValue(function (h) {
       that.draw(h)
  });
}

Windgraph.prototype = {
  drawRose: function (chart) {
    for (i = 0; i < 4; i++) {
      var roseArrowG = chart.append('g')
        .attr('transform', 'translate(' + (this.width / 2 + this.margin.left) + ' ' + (this.height / 2 + this.margin.top) + ') rotate(' + (i * 90) + ' 0 0)')
        .attr('opacity','0.5');
      roseArrowG.append('path')
        .attr('d', 'M 0 0 L 40 -40 ' +(this.width / 2) + ' 0 z')
        .attr('fill', 'red');
      roseArrowG.append('path')
        .attr('d', 'M 0 0 L 40 40 ' +(this.width / 2) + ' 0 z')
        .attr('fill', 'grey');
    }
  },
  init: function (theSelector) {
    var chart = d3.select(theSelector)
      .append('svg:svg')
      .attr('viewBox', "0 0 960 960")
      .attr('preserveAspectRatio', "xMidYMid meet")
      .attr('class', 'chart')


    var g = chart.append('g')
      .attr('transform', 'translate(' + (this.margin.left + this.width / 2) + ',' + (this.margin.top + this.height / 2) + ')')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', 'main');

    var radius = Math.min(this.width / 2, this.height / 2);
    g.append('circle').attr('r', radius).attr('class', 'perimeter');
    this.drawRose(chart);

    var ga = g.append("g")
      .attr("class", "a axis")
      .selectAll("g")
      .data(d3.range(0, 360, 30))
      .enter().append("g")
      .attr("transform", function (d) {
        return "rotate(" + -d + ")";
      });

    ga.append("line").attr("x2", radius);

    this.gr = g.append("g").attr("class", "r axis");
    this.gCircle = g.append("g");
    chart.append('text')
      .attr('class', 'legend')
      .attr('dy', '1.2em')
      .text('Ground wind history');
  },
  setVisible: function(flag) {
    this.visible = flag;
  },
  drawGridCircles: function (r) {
    var gridCircles = this.gr.selectAll("g").data(r.ticks(5), function (d) {
      return d
    });

    gridCircles.select("circle").attr("r", function (d) {
      return r(d)
    });
    gridCircles.select("text")
      .text(function (d) {
        return d
      })
      .attr("x", function (d) {
        return r(d) + 4;
      })
    gridCircles.exit().remove();

    var gra = gridCircles.enter().append("g");

    gra.append("circle").attr("r", function (d) {
      return r(d)
    });
    gra.append("text")
      .attr("x", function (d) {
        return r(d) + 4;
      })
      .style("text-anchor", "middle")
      .text(function (d) {
        return d;
      });
  },
  onData: function(msg) {this.messages.push(msg);},
  draw: function (history) {
    if (this.visible && history.length !== undefined && history.length > 0) {
      var windColor =
        d3.scale.linear()
          .domain([0, history.length * .2, history.length * .4, history.length * .6, history.length * .95, history.length])
          .range(['blue', 'green', 'yellow', 'orange', 'red']);
      var maxSpeed = d3.max(history, function (d) {
        return d.value.speed
      });
      var r = d3.scale.linear().domain([0, maxSpeed]).range([0, Math.min(this.height, this.width) / 2]).nice();
      this.drawGridCircles(r);
      var opacity = d3.scale.pow().exponent(1.7).domain([0.2, history.length]).range([0, 1]);
      var circleData = this.gCircle.selectAll('circle').data(history, function (d) {
        return d.timestamp
      });
      circleData.enter().append("circle")
      circleData
        .attr("fill-opacity", function (d, i) {
          return opacity(i);
        })
        .attr("style", function (d, i) {
          return "fill:" + windColor(i);
        })
        .attr('cx', function (d) {
          return(r(d.value.speed * Math.cos((d.value.groundWind - 90) * Math.PI / 180)));
        })
        .attr('cy', function (d) {
          return(r(d.value.speed * Math.sin((d.value.groundWind - 90) * Math.PI / 180)));
        })
        .attr("r", 3);
      circleData.exit().remove();
    }
  }
}

