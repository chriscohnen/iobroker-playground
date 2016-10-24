//
// ESP RGBWW Wifi Led Controller 
// Ansteuerung per HTTP REST
// implementiert nur "Farbe setzen als RGB"
var http = require('http');
var querystring = require('querystring');  

createState('rgbled.colorRGB', "", { 'role': 'light.color.rgb'} );  //   0 nein , 1 ja
 
on('javascript.0.rgbled.colorRGB', function (obj) {
    
   log("rgb led "+obj.newState.val);  
    setLED(obj.newState.val);
});
 
  
function setLED(rgbval) {
  // Build the post string from an object
  log ('convert ' + rgbval);
 
var r=hexToR(rgbval);
var g=hexToG(rgbval );
var b=hexToB(rgbval);
log(" test " +r +" "+ g + " "+ b);
  
  var post_data ='{"cmd":"fade","d":"1","raw":{"r":"'+  r*4+'","g":"'+  g*4+'","b":"'+  b*4+'","ww":"0","cw":"0"},"q":"false","t":"0"}';
  
  /**
   bugged, raw substructure fehlt by stringify
  querystring.stringify(
 { 
 
  "cmd": "solid",
  "d": "1",
  "raw": '{"r":"'+  r*4+'","g":"'+  g*4+'","b":"'+  b*4+'","ww: "0",   "cw": "0"  }',
  "q": "false",
  "t": "0"


 }
);*/

  // An object of options to indicate where to post to
  var post_options = {
      host: '192.168.188.55',
      port: '80',
      path: '/color?mode=RAW',
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(post_data),
          'Accept': '*/*'
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });
    
  // post the data
  post_req.write(post_data);
  post_req.end();
  log('http request: '+post_data);
  
 
}

function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
 
/**
 * https://gist.github.com/mjackson/5311256
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  return [ h, s, v ];
}
