// Work on beat nodes
// Get them animating
// Then add a path to them using it as the center
// Animate from end of the line to the other
// Once animation is complete
// Play any sound

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
    if ( app.beatNode.fillColor._canvasStyle === "rgb(255,215,0)" ) {
      app.beatNode.fillColor = 'red';
    } else {
      app.beatNode.fillColor = 'gold';
    };
  }, bpm * 2);
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
    var beatNode = new app.paper.Path.Circle(new app.paper.Point(100, 200), 50);
    beatNode.fillColor = 'gold';
    app.beatNode = beatNode;

    app.paper.view.draw();
  };


  // Create our note nodes
  app.createSoundNode = function () {
  };

  app.createBeatNode();
  setupBeatInterval( calculateBPS( 60 ) );

};

