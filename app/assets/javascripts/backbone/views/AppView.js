var app = app || {};
app.nodes = [];
app.myCircles = [];
var selected = false;

window.requestAnimFrame = (function(){ 
    return (
        window.requestAnimationFrame       || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame    || 
        window.oRequestAnimationFrame      || 
        window.msRequestAnimationFrame     || 
        function(/* function */ callback){
            window.setTimeout(callback, 1000 / 60);
        }
    );
})();

app.AppView = Backbone.View.extend({
	el: '#main',

	events: {
		'click #newNode' : 'addNode',
		'click #start' : 'start',
		'click #stop' : 'stop',
		'click #strum' : 'strumButton'
	},

	initialize: function() {
		app.audioContext = new AudioContext()
		app.playing = false;
	},

	render: function() {
		var appViewTemplate = $('#appViewTemplate').html();
		this.$el.html( appViewTemplate );
		paper.install( window );

		app.paper = new PaperScope();
		app.tool = new Tool();
    app.paper.setup( $("canvas")[0] );

    app.updater = new PaperAnimate.Updater();

    app.paper.view.onFrame = function ( event ) {
    	app.updater.update( event );
    }

 		this.draw()
    this.frameLooper();
    setupNodes();
	},

	start: function() {
		app.playing = true
	},

	stop: function() {
		app.playing = false
	},

	addNode: function() {
		var destinationX = app.beatNode.position.x;
		var destinationY = app.beatNode.position.y;

		var startX = 300;
		var startY = 200;

		var myPath = new Path();
		myPath.strokeColor = 'white';
		myPath.strokeWidth = 10;
		myPath.strokeCap = 'round';
		myPath.add(new Point(destinationX, destinationY));
		myPath.add(new Point(startX, startY));
		myPath.itemType = 'connection';

		app.myCircle = new app.paper.Path.Circle(new app.paper.Point(startX, startY), 20);
		app.myCircle.fillColor = 'gold';
		app.myCircle.itemType = 'soundNode';

		app.myCircle.nodePaths = [];
		app.beatNode.connections.push( myPath );
		app.myCircles.push( app.myCircle );
		app.myCircle.nodePaths.push( myPath );

		app.nodes.push( app.myCircle );
	},

	frameLooper: function(time) {
		window.requestAnimFrame( this.frameLooper.bind(this) );
    app.paper.view.draw();
    this.loop();
  },

  loop: function() {
		var view = this;

		if (app.strumState) {
			app.tool.onMouseMove = _.throttle(function (event) {
				view.strum(event);
			}, 100)
		} else {
			app.tool.onMouseMove = null
		}
		if ( !app.playID && app.playing) {
			app.playID = window.setInterval( function () { 
				for ( var i = 0; i < app.nodes.length; i++ ) {
					var circle = app.nodes[i];
			  	var delay = 0
			  	var pitch = view.getNote(circle.position.x)
					var duration = circle.getBounds().width / 100

					view.play( delay, pitch, duration );
				}
			}, 1000);
		} else if (!app.playing) {
			clearInterval(app.playID);
		}
  },

  play: function( delay, pitch, duration ) {
  	var oscillator = app.audioContext.createOscillator()
  	oscillator.connect(app.audioContext.destination)
  	oscillator.type = 'sine'

  	var startTime = app.audioContext.currentTime + delay
  	var endTime = startTime + duration
  	oscillator.start(startTime)
  	oscillator.stop(endTime)
  	oscillator.detune.value = app.appView.getNote( pitch );
  },

  getNote: function(position) {
  	var note;	
		var click = position
		if (click < 50) {
			note = -1700
		} else if (click < 100) {
			note = -1500
		} else if (click < 150) {
			note = -1200
		} else if (click < 200) {
			note = -1000
		} else if (click < 250) {
			note = -700
		} else if (click < 300) {
			note = -500
		} else if (click < 350) {
			note = -300
		} else if (click < 400) {
			note = 0
		} else if (click < 450) {
			note = 200
		} else if (click < 500) {
			note = 500
		} else if (click < 550) {
			note = 700
		} else if (click < 600 ) {
			note = 900
		} else if (click < 650 ) {
			note = 1200
		} else if (click < 700) {
			note = 1400
		} else if (click < 750) {
			note = 1700
		} else if (click < 800) {
			note = 1900
		} else if (click < 850) {
			note = 2100
		} else if (click < 900) {
			note = 2400
		} else 	{
			note = 2600
		}
		return note; 
  },

  strumButton: function() {
  	if (!app.strumState) {
			app.strumState = true
		} else {
			app.strumState = false
		}
  },

	strum: function(event) {

		event.preventDefault();	
		app.oscillator = app.audioContext.createOscillator()
		app.oscillator.connect(app.audioContext.destination)	
		app.oscillator.type = 'sine'

		// var input = app.audioContext.createGain()
		var feedback = app.audioContext.createGain()
		var delay = app.audioContext.createDelay()

		var output = app.audioContext.createGain()
		output.connect(app.audioContext.destination)

		delay.delayTime.value = 0.3
		feedback.gain.value = 0.2 // dangerous when > 1 ;-)
		// dry path
		app.oscillator.connect(output)
		// wet path
		app.oscillator.connect(delay)

		// feedback loop
		delay.connect(feedback)
		feedback.connect(delay)
		feedback.connect(output)

		var click = event.pageX || event.point.x;
		var note = this.getNote(click);	

		app.oscillator.detune.value = note
		app.oscillator.start(app.audioContext.currentTime)
		app.oscillator.stop(app.audioContext.currentTime + .5)
	},

	draw: function(){
		app.canvasHeight = $('canvas').height()
    app.canvasWidth = $('canvas').width()

		for (var i = 0; i < canvas.width; i += 50) {
			 app.newPath = new app.paper.Path.Line({
	      from: [i, 0],
	      to: [i, app.canvasHeight],
	      strokeColor: 'white',
	      strokeWidth: 1,
	      fillColor: 'white',
	      opacity: 0.1,
	      closed: true
	    });
			 app.newPath.itemType = 'line'
		}	

		app.tool.onMouseDown = function (event) {
			var hitResult = project.hitTest(event.point);
			if ( !hitResult || !hitResult.item ) { return false; }
			var itemType = hitResult.item.itemType;

			app.selectedItem = null;

			if ( itemType	=== 'beatNode' || itemType === 'soundNode') {
				if ( hitResult && !selected ) {
					var selected = true;
					app.selectedItem = hitResult.item;
					hitResult.item.fillColor = "blue";
				} else {
					selected = false;
					app.selectedItem = null;
				}
			} else { return false; }
		}

		app.tool.onMouseUp = function ( event ) {
			if ( app.selectedItem ) {
				app.selectedItem.fillColor = "gold";
			}
		}

		app.tool.onMouseDrag = function (event) {
			if ( app.selectedItem ) {
				app.selectedItem.position = event.point;

				if ( app.selectedItem.nodePaths || app.selectedItem.connections ) {
					if ( app.selectedItem.itemType === 'beatNode' ) {
						for ( var i = 0; i < app.selectedItem.connections.length; i++ ) {
							app.selectedItem.connections[i].segments[0].point.x = event.point.x;
							app.selectedItem.connections[i].segments[0].point.y = event.point.y;						
						}
						for (var i = 0; i < app.animationGroup.children.length; i++) {
							var child = app.animationGroup.children[i]
							child.remove()
						}
					} else {
						for ( var i = 0; i < app.selectedItem.nodePaths.length; i++ ) {
							app.selectedItem.nodePaths[0].segments[1].point.x = event.point.x;
							app.selectedItem.nodePaths[0].segments[1].point.y = event.point.y;
						}
					}
				}

				// Change the end point of the paths between it
			}
		}
		
		
	}

});