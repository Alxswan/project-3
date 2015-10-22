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
    for ( var i = 0; i < app.beatNodes.length; i++ ) {
      app.beatNode = app.beatNodes[i];
      (function (beatNode) {
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

                var distanceY;
                  distanceX = Math.abs( app.beatNode.connections[i].segments[1].point.x - startX );
                } else {
                  distanceX = Math.abs( startX - app.beatNode.connections[i].segments[1].point.x );
                }
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


                app.playNote = window.setTimeout(function(){
                  destinationYPoint;

                  var circles = _.filter( app.myCircles, function (circle) {
                    circle.centerX = circle.getBounds().x + ( circle.getBounds().width / 2 );
                    circle.centerY = circle.getBounds().y + ( circle.getBounds().width / 2 );

                    if ( destinationXPoint === circle.centerX && destinationYPoint === circle.centerY ) {
                      return true;
                    }
                  });

                  _.each( circles, function (circle) {
                    circle.fillColor = 'gold';
                    var newCircle = new app.paper.Path.Circle( new Point( circle.centerX, circle.centerY ), 10 );
                    newCircle.fillColor = "gold";
                    newCircle.opacity = 0.5;

                    newCircle.animate(0.8, app.updater).scale( 2.5 );
                    (function (newCircle) {
                      window.setTimeout(function () {
                        newCircle.remove();
                      }, 800);
                    })(newCircle);
                  } );

                  app.appView.play(0, destinationXPoint, 1)
                  myCircle.remove();
                }, distance * 10);


              })(i);
            }
          }
        };
      })( app.beatNode );
    }
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
    var startX = _.random( 0, window.innerWidth ) || 300;
    var startY = _.random( 0, window.innerHeight ) || 200;

    var beatNode = new app.paper.Path.Circle( new app.paper.Point(startX, startY), 50);
    beatNode.fillColor = 'gold';
    app.beatNode = beatNode;
    app.paper.view.draw();
    app.beatNode.connections = [];
    app.beatNode.connections.circles = [];
    app.beatNode.itemType = 'beatNode'
    app.beatNodes.push(app.beatNode)
  };


  app.createBeatNode();
  setupBeatInterval( calculateBPS( 60 ) );

};
