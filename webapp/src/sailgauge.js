function SailGauge() {
}

SailGauge.prototype = {
  depthStream: new Bacon.Bus(),
  init: function (selector, size) {
    this.drawSvg(selector, size);
    this.initStreams();
  },
  drawSvg: function (selector, size) {
    var chart = d3.select(selector)
      .append('svg:svg')
      .attr('viewBox', "0 0 " + size + " " + size)
      .attr('preserveAspectRatio', "xMidYMid meet")
      .attr('class', 'chart');
    var defs = chart.append('defs');
    var gradient = defs.append('linearGradient')
      .attr('id', 'rosegradient')
      .attr('x1', '0')
      .attr('x2', '0')
      .attr('y1', '0')
      .attr('y2', '1')
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#0c5da5');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#ff4f00');
    var rose = chart.append('g').attr('id', 'rose').attr('class', 'rose');
    rose.append('g').attr('id', 'edge').attr('class', 'p1');
    rose.append('circle').attr('cx', size / 2).attr('cy', size / 2).attr('r', size / 2 - 80).attr('fill', 'gray').attr('stroke-width', '2px');
    rose.append('path')
      .attr('d', "M 700 400 A 300 300 0 1 1  100,400 A 300 300 0 1 1  700 400 z")
      .attr('class', 'p-1')
      .attr('fill', 'url(#rosegradient)')
      .attr('opacity', '0.8')
      .attr('stroke-width', '2px');
    rose.append('g').attr('id', 'tickmarks');
    rose.append('g').attr('id', 'tickmarksTop');

    var mark = rose.append('g').attr('id', 'mark');
    mark.append('path').attr('d', "M 385,60 L 415,60 400,90 z").attr('class', 'mark');
    mark.append('circle').attr('cx', '400').attr('cy', '70').attr('r', '11').attr('stroke', 'none').attr('fill', 'white');
    mark.append('text')
      .attr('x', '400').attr('y', '70')
      .attr('class', 'marktext')
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').text('000');
    mark.append('circle').attr('cx', '400').attr('cy', '118').attr('r', '18').attr('stroke', 'none').attr('fill', 'white');
    mark.append('text').attr('x', '400').attr('y', '118').attr('class', 'marktext')
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').text('0.0');

    this.drawTicks();

    chart.append('rect')
      .attr('x', '370').attr('y', '70')
      .attr('rx', '5').attr('ry', '5')
      .attr('width', '60').attr('height', '40')
      .attr('class', 'rose');
    chart.append('text')
      .attr('id', 'tracktruetext')
      .attr('x', '400').attr('y', '90')
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'middle').attr('font-size', '25').text('000');

    chart.append('text')
      .attr('x', '800').attr('y', '60')
      .attr('text-anchor', 'end').attr('dominant-baseline', 'text-after-edge')
      .attr('class', 'positivegaugetext')
      .append('tspan')
      .attr('id', 'depth').attr('dy', '0px').attr('font-size', '60').text('99.9');
  },

  arcForAngle: function (angle) {
    return 'M400,400 v-300 a300,300 1 0,1 ' +
      Math.sin(angle * Math.PI / 180) * 300 + ',' +
      (1 - Math.cos(angle * Math.PI / 180)) * 300 + ' z';
  },
  rotateAnimated: function (selector, angleTo, x, y, millis) {
    var d3g = d3.select(selector);
    var previousTransform = d3g.attr('transform');
    var tween = function (d, i, a) {
      return d3.interpolateString(previousTransform, 'rotate(' + angleTo + " " + x + " " + y + ")");
    }
    d3g.transition().duration(millis).attrTween('transform', tween);
  },
  drawTicks: function () {
    var tickmarks = d3.select("#tickmarks");
    var tickmarksTop = d3.select("#tickmarksTop");
    for (var i = 10; i < 360; i += 10) {
      tickmarks.append("path").attr("id", "id10-" + i)
        .attr("d", "m 400,80 L 400,100")
        .attr("stroke-width", "1")
        .attr("transform", "rotate(" + i + " 400 400)");
    }
    for (var i = 5; i < 360; i += 5) {
      tickmarks.append("path").attr("id", "id5-" + i)
        .attr("d", "m 400,90 L 400,100")
        .attr("stroke-width", "1")
        .attr("transform", "rotate(" + i + " 400 400)");
    }
    var dirs = ['N', 'E', 'S', 'W' ];
    for (var i = 0; i < 360; i += 90) {
      tickmarksTop.append("rect").attr("id", "box" + i)
        .attr("x", "380")
        .attr("y", "70")
        .attr("width", "40")
        .attr("height", "30")
        .attr("transform", "rotate(" + i + " 400 400)")
        .text(i);
      tickmarksTop.append("text").attr("id", "bearing" + i)
        .attr("x", "400")
        .attr("y", "90")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(" + i + " 400 400)")
        .attr("class", "text")
        .text(dirs[0]);
      dirs = dirs.splice(1);
    }
    var dirs = ['NE', 'SE', 'SW', 'NW'];
    for (var i = 45; i < 360; i += 90) {
      tickmarks.append("rect").attr("id", "box" + i)
        .attr("x", "385")
        .attr("y", "80")
        .attr("width", "30")
        .attr("height", "20")
        .attr("transform", "rotate(" + i + " 400 400)")
        .text(i);
      tickmarks.append("text").attr("id", "bearing" + i)
        .attr("x", "400")
        .attr("y", "95")
        .attr("font-size", "80%")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(" + i + " 400 400)")
        .attr("class", "text")
        .text(dirs[0]);
      dirs = dirs.splice(1);
    }
  },
  onData: function onMessage(msg) {
    switch (msg.type) {
      case 'depth':
        this.depthStream.push(msg);
        break;
      case 'course':
        this.updateCourse(msg);
        break;
    }
  },
  trackTrue:0,
  bearingToMark:45,
  updateCourse: function(msg) {
    this.trackTrue = msg.heading;
    d3.select('#tracktruetext').text(this.trackTrue.toFixed(0) + '°');
    this.rotateAnimated('#rose', -1 * this.trackTrue, 400, 400, 200);
    d3.select('#marktext').attr("transform", "rotate(" + (-1 * this.bearingToMark + this.trackTrue) + " 400 70)");
    d3.select('#markdistance').attr("transform", "rotate(" + (-1 * this.bearingToMark + this.trackTrue) + " 400 118)");
  },
  lastDepthReceiveTime: 0,
  updateDepthDisplay: function (msg) {
    var depth = Number(msg.depth);
    if (depth < 200) {
      var depthText = d3.select('#depth');
      depthText.text(depth.toFixed(1)).attr("display", "inline");
      var fontSize = this.depthFontSize(depth);
      depthText.attr('font-size', fontSize);
      depthText.attr('dy', (fontSize * 0.7 ) - 60);
      depthText.attr('fill', depth < 6 ? 'red' : null);
      depthText.attr('font-weight', depth < 6 ? 'bold' : null);
      this.depthStream.push(Number(depth));
      this.lastDepthReceiveTime = Date.now();
    }
  },
  depthFontSize: function (depth) {
    var minFontSize = 60;
    var maxFontSize = 300;
    var shallowThreshold = 6;
    var minThreshold = 3;
    if (depth > shallowThreshold) {
      return minFontSize
    }
    if (depth < minThreshold) {
      return maxFontSize;
    }
    return minFontSize + (shallowThreshold - depth) / (shallowThreshold - minThreshold) * (maxFontSize - minFontSize);
  },
  initStreams: function () {
    this.depthStream.onValue(this.updateDepthDisplay.bind(this));
    this.depthStream.slidingTimeWindow(60 * 1000).onValue(function (data) {
//      drawSparkline("#depthSpark", data, 100, 50);
    });
  }


}