<!doctype html>
<html>
  <head>
    <title>socket.io client test</title>
    <!-- IPHONE WEB APP META/LINK TAGS -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black" />
    <meta name="viewport" content="user-scalable=no, width=device-width, minimum-scale=1.0, maximum-scale=1.0" />
    <link rel="apple-touch-icon" href="./images/apple-touch-icon.png" />

    <style>
      #touchArea {width: 100%, height: 100%; overflow: auto;  border: 1px solid #eee; font: 11px Helvetica, Arial; }
    </style>

   	<script src="http://code.jquery.com/jquery-1.4.3.min.js"></script>
   	<script src="/json.js"></script> <!-- for ie -->
  	<script src="/socket.io/socket.io.js"></script>
  </head>
  <body>

    <script>
		var socket = new io.Socket(null, {port: 1234});

		socket.connect();
		socket.on('message', function(obj)
		{
			if ('buffer' in obj) {
				for (var i in obj.buffer)
				handleIncomingMessage(obj.buffer[i]);
			} else {
				handleIncomingMessage(obj);
			}
		});
		function handleIncomingMessage(obj)
		{
			var el = document.createElement('p');

			/*
			if ('announcement' in obj)
				el.innerHTML = '<em>' + esc(obj.announcement) + '</em>';
			else if ('message' in obj)
				el.innerHTML = '<b>' + esc(obj.message[0]) + ':</b> ' + esc(obj.message[1]);
			*/
		};

		function send()
		{
			var val = document.getElementById('text').value;
			socket.send(val);

			// Send self fake message
			handleIncomingMessage({ message: ['you', val] });
			// Clear typing area
			document.getElementById('text').value = '';
		};

		// Escape messages
		function esc(msg) {
			return msg.replace(/</g, '&lt;').replace(/>/g, '&gt;');
		};

		function onDocumentReady()
		{
			this.bounds = {left:0, top: 0, bottom:$(window).height(), right: $(window).width()};

			$(document).mousemove(function(event)
			{
				//CSV: x,y
				socket.send("[*p*],"+event.pageX/this.bounds.right+","+event.pageY/this.bounds.bottom);
				event.preventDefault();
			});

			// Convert iphone touchevent to mouseevent
			function touchHandler(event)
			{
			    var touches = event.changedTouches,
			        first = touches[0],
			        type = "";

			    switch(event.type)
			    {
			        case "touchstart": type = "mousedown"; break;
			        case "touchmove":  type="mousemove"; break;
			        case "touchend":   type="mouseup"; break;
			        default: return;
			    }

			    var fakeMouseEvent = document.createEvent("MouseEvent");
			    fakeMouseEvent.initMouseEvent(type, true, true, window, 1,
			                              first.screenX, first.screenY,
			                              first.clientX, first.clientY, false,
			                              false, false, false, 0/*left*/, null);

			    first.target.dispatchEvent(fakeMouseEvent);
			    event.preventDefault(); // Stop overscroll
			}

			function sendPositionToSocketUsingArray(arrayOfTouchPoints)
			{
				for(var i=0; i<arrayOfTouchPoints.length; i++) {
					socket.send("#MP:,"+arrayOfTouchPoints[i][0]+","+arrayOfTouchPoints[i][1]);
				}
			}

			document.addEventListener("touchstart", touchHandler, true);
			document.addEventListener("touchmove", touchHandler, true);
			document.addEventListener("touchend", touchHandler, true);
			document.addEventListener("touchcancel", touchHandler, true);
		}

		$(document).ready(onDocumentReady);

    </script>

    <h1>Touch!</h1>
    <div id="touchArea"></div>
  </body>
</html>