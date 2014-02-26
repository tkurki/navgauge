
function Polar() {
  this.selector = "not_defined";
  this.margin = {top: 20, right: 15, bottom: 60, left: 60};
  this.width = 960 - this.margin.left - this.margin.right;
  this.height = 960 - this.margin.top - this.margin.bottom;
  this.gr;
  this.gCircle;
  this.isHidden = true;
  this.messages = new Bacon.Bus();
  this.bufferedWindAndSpeed = new Bacon.Bus();
  this.buffer = [];

  var wind = this.messages.filter(function (msg) {
    return msg.type === 'wind' && msg.reference === 'true boat'
  });
  var speed = this.messages.filter(function (msg) {
    return msg.type === 'speed'
  }).map('.knots');
  var windAndSpeed = wind.combine(speed, function (windData, speed) {
    return {
      windSpeed: Number(windData.speed),
      angle: Number(windData.angle),
      speed: Number(speed)
    }
  });
  var that = this;
  windAndSpeed.onValue(function(msg){
    if (that.isHidden) {
      that.buffer.push(msg);
      if (that.buffer.length > 1000) {
        that.bufferedWindAndSpeed.plug(Bacon.fromArray(that.buffer));
        that.buffer = [];
      }
    } else {
      that.bufferedWindAndSpeed.push(msg);
    }
  });
  this.bufferedWindAndSpeed.bufferWithTime(1000).onValue(that.draw.bind(this));
}

Polar.prototype = {
  init: function (theSelector) {
    this.selector = theSelector;
    var chart = d3.select(this.selector)
      .append('svg:svg')
      .attr('viewBox', "0 0 960 960")
      .attr('preserveAspectRatio', "xMidYMid meet")
      .attr('class', 'chart')
    this.drawBackgroundArrow(chart);

    var g = chart.append('g')
      .attr('transform', 'translate(' + (this.margin.left + this.width / 2) + ',' + (this.margin.top + this.height / 2) + ')')
      .attr('width', this.width)
      .attr('height', this.height)
      .attr('class', 'main');


    var radius = Math.min(this.width / 2, this.height / 2);
    g.append('circle').attr('r', radius).attr('class', 'perimeter');

    var ga = g.append("g")
      .attr("class", "a axis")
      .selectAll("g")
      .data(d3.range(0, 360, 30))
      .enter().append("g")
      .attr("transform", function (d) {
        return "rotate(" + -d + ")";
      })
      .append("line").attr("x2", radius);

    this.gr = g.append("g").attr("class", "r axis");
    this.gCircle = g.append("g");

    chart.append('text')
      .attr('class', 'legend')
      .attr('dy', '1.2em')
      .text('Polar performance');
  },
  setVisible: function (flag) {
    this.isHidden = !flag;
    this.bufferedWindAndSpeed.plug(Bacon.fromArray(this.buffer));
    this.buffer = [];
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

  onData: function message(data) {
    this.messages.push(data);
  },


  draw: function (history) {
    if (history.length !== undefined && history.length > 0) {
      var windColor =
        d3.scale.linear()
          .domain([0, 4, 6, 8, 10, 12])
          .range(['blue', 'green', 'yellow', 'orange', 'red']);
      var maxSpeed = 8;
      var r = d3.scale.linear().domain([0, maxSpeed]).range([0, Math.min(this.height, this.width) / 2]).nice();
      this.drawGridCircles(r);
      var innerG = this.gCircle.append('g');
      var circleData = innerG.selectAll('circle').data(history);
      circleData.enter()
        .append("circle")
        .attr("style", function (d, i) {
          return "fill:" + windColor(d.windSpeed);
        })
        .attr('cx', function (d) {
          return(r(d.speed * Math.cos((-d.angle - 90) * Math.PI / 180)) + Math.random() * 2 - 1);
        })
        .attr('cy', function (d) {
          return(r(d.speed * Math.sin((-d.angle - 90) * Math.PI / 180)) + Math.random() * 2 - 1);
        })
        .attr("r", 1);
      ;
    }
  },

  drawBackgroundArrow: function (chart) {
    var arrow = chart.append('g').
      attr('id', 'boat').attr('transform', 'translate(500 200) rotate (90 0 0)  scale(3)')
      .attr('style','stroke-opacity:0.5;fill-opacity:0.5');
    arrow.append('path')
      .attr('d', 'M 0 0 L 0 -30 100 -30 100 -70 180 0 100 70 100 30 0 30 z')
      .attr('class', 'boat sp');
  }

}
