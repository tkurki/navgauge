function SailGauge() {
}

SailGauge.prototype = {
  init: function(selector, size) {
    var chart = d3.select(selector)
      .append('svg:svg')
      .attr('viewBox', "0 0 " + size + " " + size)
      .attr('preserveAspectRatio', "xMidYMid meet")
      .attr('class', 'chart');
    var defs = chart.append('defs');
    var gradient = defs.append('linearGradient')
      .attr('id', 'rosegradient')
      .attr('x1','0')
      .attr('x2', '0')
      .attr('y1','0')
      .attr('y2','1')
    gradient.append('stop').attr('offset','0%').attr('stop-color','#0c5da5');
    gradient.append('stop').attr('offset','100%').attr('stop-color','#ff4f00');
    var rose = chart.append('g').attr('id','rose').attr('class','rose');
    rose.append('g').attr('id','edge').attr('class','p1');
    rose.append('circle').attr('cx', size / 2).attr('cy',size / 2).attr('r', size / 2 - 80).attr('fill', 'gray').attr('stroke-width','2px');
    rose.append('path')
      .attr('d', "M 700 400 A 300 300 0 1 1  100,400 A 300 300 0 1 1  700 400 z")
      .attr('class', 'p-1')
      .attr('fill', 'url(#rosegradient)')
      .attr('opacity', '0.8')
      .attr('stroke-width', '2px');
    rose.append('g').attr('id','tickmarks');
    rose.append('g').attr('id', 'tickmarksTop');

    var mark = rose.append('g').attr('id', 'mark');
    mark.append('path').attr('d',"M 385,60 L 415,60 400,90 z").attr('class', 'mark');
    mark.append('circle').attr('cx','400').attr('cy','70').attr('r', '11').attr('stroke','none').attr('fill','white');
    mark.append('text')
      .attr('x','400').attr('y','70')
      .attr('class', 'marktext')
      .attr('text-anchor','middle').attr('dominant-baseline','middle').text('000');
    mark.append('circle').attr('cx','400').attr('cy','118').attr('r', '18').attr('stroke','none').attr('fill','white');
    mark.append('text').attr('x','400').attr('y','118').attr('class', 'marktext')
      .attr('text-anchor','middle').attr('dominant-baseline','middle').text('0.0');

    this.drawTicks();

    chart.append('rect')
      .attr('x','370').attr('y','70')
      .attr('rx','5').attr('ry','5')
      .attr('width','60').attr('height','40')
      .attr('class','rose');
    chart.append('text')
      .attr('id','tracktruetext')
      .attr('x','400').attr('y','90')
      .attr('text-anchor','middle').attr('dominant-baseline','middle').attr('font-size','25').text('000');
  }
  ,

  arcForAngle: function (angle) {
    return 'M400,400 v-300 a300,300 1 0,1 ' +
      Math.sin(angle * Math.PI / 180) * 300 + ',' +
      (1 - Math.cos(angle * Math.PI / 180)) * 300 + ' z';
  }
  ,
  rotateAnimated: function (selector, angleTo, x, y, millis) {
    var d3g = d3.select(selector);
    var previousTransform = d3g.attr('transform');
    var tween = function (d, i, a) {
      return d3.interpolateString(previousTransform, 'rotate(' + angleTo + " " + x + " " + y + ")");
    }
    d3g.transition().duration(millis).attrTween('transform', tween);
  }
  ,
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
  }
}