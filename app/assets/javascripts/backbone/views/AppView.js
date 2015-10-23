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
		'click #strum' : 'strumButton',
		'click #newBeatNode' : 'addBeatNode',
		'click #desaturate' : 'desaturate',
		'click #invert' : 'invert'
	},

	initialize: function() {
		app.audioContext = new AudioContext()
		app.playing = false;
	},

	invert: function () {
		$("body").addClass('inverted').removeClass('desaturated');
	},

	desaturate: function () {
		$("body").addClass('desaturated').removeClass('inverted');
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
		if (!app.beatInterval){
			console.log('hhh')
		  setupBeatInterval( calculateBPS( 60 ) );
		}
	},

	stop: function() {
		app.playing = false
		if (app.beatInterval){
			clearBeatInterval();
			app.beatInterval = null;
		}
	},

	addBeatNode: function() {
		app.createBeatNode();
	},

	addNode: function() {
		var destinationX = app.beatNode.position.x;
		var destinationY = app.beatNode.position.y;

		var startX = _.random( 0, window.innerWidth ) || 300;
		var startY = _.random( 0, window.innerHeight ) || 200;

		var myPath = new Path();
		myPath.strokeColor = 'white';
		myPath.strokeWidth = 5;
		myPath.strokeCap = 'round';
		myPath.add(new Point(destinationX, destinationY));
		myPath.add(new Point(startX, startY));
		myPath.itemType = 'connection';

		app.myCircle = new app.paper.Path.Circle(new app.paper.Point(startX, startY), 15);
		app.myCircle.fillColor = 'gold';
		app.myCircle.itemType = 'soundNode';

		app.myCircle.nodePaths = [];
		app.beatNode.connections.push( myPath );
		app.beatNode.connections.circles.push( app.myCircle )
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
			}, 500)
		} else {
			app.tool.onMouseMove = null
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
		if (click < 80) {
			note = -1700
		} else if (click < 160) {
			note = -1500
		} else if (click < 240) {
			note = -1200
		} else if (click < 320) {
			note = -1000
		} else if (click < 400) {
			note = -700
		} else if (click < 480) {
			note = -500
		} else if (click < 560) {
			note = -300
		} else if (click < 640) {
			note = 0
		} else if (click < 720) {
			note = 200
		} else if (click < 800) {
			note = 500
		} else if (click < 880) {
			note = 700
		} else if (click < 960 ) {
			note = 900
		} else if (click < 1040 ) {
			note = 1200
		} else if (click < 1120) {
			note = 1400
		} else if (click < 1200) {
			note = 1700
		} else if (click < 1280) {
			note = 1900
		} else if (click < 1360) {
			note = 2100
		} else if (click < 1440) {
			note = 2400
		} else 	{
			note = 2600
		}
		console.log(note)
		return note; 
  },

  strumButton: function() {
  	if (!app.strumState) {
			app.strumState = true
			$('#strum').html('Strum Off')
		} else {
			app.strumState = false
			$('#strum').html('Strum On')

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

		delay.delayTime.value = 0
		feedback.gain.value = .5 // dangerous when > 1 ;-)
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
		app.oscillator.stop(app.audioContext.currentTime + .1)
	},

	draw: function(){
		app.canvasHeight = $('canvas').height()
    app.canvasWidth = $('canvas').width()

		for (var i = 0; i < canvas.width; i += 80) {
			 app.newPath = new app.paper.Path.Line({
	      from: [i, 0],
	      to: [i, app.canvasHeight * 5],
	      strokeColor: 'orange',
	      strokeWidth: 2,
	      fillColor: 'orange',
	      opacity: 0.1,
	      closed: true
	    });
			 app.newPath.itemType = 'line'
		}	

		app.tool.onMouseDown = function (event) {

			var hitResult = project.hitTest(event.point);
			if ( !hitResult || !hitResult.item ) { return false; }
			var itemType = hitResult.item.itemType;

			if (event.event.shiftKey) {
				if (app.beatNodes.length === 1 && hitResult.item.itemType === 'beatNode') {
							//error handling here
					console.log('only one')
					for (var i = 0; i < hitResult.item.connections.length; i++) {
						for (var j = 0; j < hitResult.item.connections.circles.length; j++) {
							hitResult.item.connections.circles[j].remove();
						}

						hitResult.item.connections[i].remove();
						clearBeatInterval()
					}
					hitResult.item.remove()
				} else if (hitResult.item.itemType === 'beatNode') {
					//clicked beatNode, remove node paths connected and soundnodes connected 
					for (var i = 0; i < hitResult.item.connections.length; i++) {

						hitResult.item.connections[i].remove()

					}
					hitResult.item.remove()
				} else if (hitResult.item.itemType === 'soundNode') {
					//remove soundnode and path
				}

			}

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

					} else {
						for ( var i = 0; i < app.selectedItem.nodePaths.length; i++ ) {
							app.selectedItem.nodePaths[0].segments[1].point.x = event.point.x;
							app.selectedItem.nodePaths[0].segments[1].point.y = event.point.y;
						}
					}
					for (var i = 0; i < app.animationGroup.children.length; i++) {
							var child = app.animationGroup.children[i]
							child.remove()
						}				
				}
			}
		}		
	}
});