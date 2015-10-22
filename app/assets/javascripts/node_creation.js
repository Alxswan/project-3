// We need to work out the for loops for:
  // app.beatNode.connections
  // Through all of app.myCircles
    // Then through all of the current circles nodePaths

var app = app || {};
app.beatNodes = []; 
app.soundNodes = [];

var calculateBPS = function ( bpm ) {
  // Our interval setup
  var bps = 60000 / bpm;
  return bps;
};

var setupBeatInterval = function ( bpm ) {
  clearBeatInterval();
  app.beatInterval = window.setInterval(function () {
    app.animationGroup = app.animationGroup || new Group();
    if ( app.beatNode.fillColor._canvasStyle === "rgb(255,215,0)" ) {
      app.beatNode.fillColor = 'red';
    } else {
      app.beatNode.fillColor = 'gold';
      if (app.beatNode.connections.length) {
        for (var i = 0; i < app.beatNode.connections.length; i++) {
          (function (i) {
            var startX = app.beatNode.getBounds().x + (app.beatNode.getBounds().width / 2)
            var startY = app.beatNode.getBounds().y + (app.beatNode.getBounds().width / 2)
            var myCircle = new app.paper.Path.Circle(new app.paper.Point(startX, startY), 10);
            myCircle.fillColor = 'white';
            myCircle.itemType = 'emissionNode';
            app.animationGroup.addChild( myCircle );  

            var destinationXPoint = app.beatNode.connections[i].segments[1].point.x;
            var destinationYPoint = app.beatNode.connections[i].segments[1].point.y;

            var distanceX;
            if ( startX >= destinationXPoint ) {
              distanceX = Math.abs( app.beatNode.connections[i].segments[1].point.x - startX );
            } else {
              distanceX = Math.abs( startX - app.beatNode.connections[i].segments[1].point.x );
            }

            var distanceY;
            if ( startY >= destinationYPoint ) {
              distanceY = Math.abs( app.beatNode.connections[i].segments[1].point.y - startY );
            } else {
              distanceY = Math.abs( startY - app.beatNode.connections[i].segments[1].point.y );
            }

            var destinationX = app.beatNode.connections[i].segments[1].point.x - startX;
            var destinationY = app.beatNode.connections[i].segments[1].point.y - startY;

            var distanceX = Math.abs( distanceX );
            var distanceY = Math.abs( distanceY );
            var distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));

            myCircle.animate(distance / 100, app.updater).translate(new Point(destinationX, destinationY));

            window.setTimeout(function(){
              app.appView.play(0, destinationXPoint, 1)
              myCircle.remove();

            }, distance * 10)
          })(i);
        }
      }
    };
  }, bpm);
};



var clearBeatInterval = function () {
  if ( app.beatInterval ) {
    window.clearInterval( app.beatInterval );
  };
};

var setupNodes = function () {
  // Create our emission nodes
  app.createBeatNode = function () {
    // Squares or Big Circles (big Circle)
    var beatNode = new app.paper.Path.Circle( app.paper.view.center, 50);
    beatNode.fillColor = 'gold';
    app.beatNode = beatNode;
    app.paper.view.draw();
    app.beatNode.connections = [];
    app.beatNode.itemType = 'beatNode'
  };

  // Create our note nodes
  app.createSoundNode = function () {
  };

  app.createBeatNode();
  setupBeatInterval( calculateBPS( 60 ) );

};
