

function Busdata() {
  this.selector = "not_defined"
}

Busdata.prototype = {
  init: function (theSelector) {
    this.selector = theSelector;
    var table = $(this.selector)
      .append(
        $('<table/>')
        .addClass('table table-bordered sorted_table')
        .append(
          $('<thead/>')
          .append(
            $('<tr/>')
            .append($('<th/>').text('PGN/Msg'))
            .append($('<th/>').text('Source'))
            .append($('<th/>').text('Description'))
            .append($('<th/>').text('Data'))
            )
          )
          .append($('<tbody/>'))
        );

    /*
     <table class="table table-striped table-bordered sorted_table">
     <thead>
     <tr>
     <th>PGN/Msg</th>
     <th>Source</th>
     <th>Description</th>
     <th>Data</th>
     </tr>
     </thead>
     <tbody>
     <tr class="placeholder"></tr>
     </tbody>
     </table>
     */
  },
  onData: function message(data) {
    if (data.pgn != undefined) {
      var id = data.src + "_" + data.pgn;
      var element = $('#' + id);
      if (!element.length) {
        appendRow(id, getGlyph(data.pgn), [data.pgn, data.src, getName(data.pgn, data.description), data.fields]);
      } else {
        element.html(toHtmlString(data.fields, id));
      }
    } else {
      var element = $('#' + data.type);
      if (!element.length) {
        appendRow(data.type, getGlyph(data.type), [data.type, "-", "-", data])
      } else {
        element.html(toHtmlString(data, data.type));
      }

    }
  }
};



function appendRow(id, glyph, data) {
  $('tbody').append(
    $("<tr/>").append($("<td/>").html('<i class="glyphicon glyphicon-' + glyph + '"></i>&nbsp;' + data[0]).attr("style",
        "width:10%"))
      .append($("<td/>").text(data[1]).attr("style", "width:10%"))
      .append($("<td/>").text(data[2]).attr("style", "width:20%"))
      .append($("<td/>").append($("<div/>").attr("id", id).html(toHtmlString(data[3], id)))));
}

var maxlinesPerMsg = new Object();

function toHtmlString(msg, uniqueId) {
  var lines = [];
  Object.getOwnPropertyNames(msg).forEach(function (propName) {
    lines.push(propName + ":" + JSON.stringify(msg[propName]) + "<br/>");
  });
  if (maxlinesPerMsg[uniqueId] === undefined) {
    maxlinesPerMsg[uniqueId] = lines.length;
  } else {
    while (maxlinesPerMsg[uniqueId] > lines.length) {
      lines.push("<br/>");
    }
    maxlinesPerMsg[uniqueId] = lines.length;
  }
  return lines.join('');
}