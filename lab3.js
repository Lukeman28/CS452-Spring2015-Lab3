var canvas;
var gl;

var numVertices  = 45;

var pointsArray = [];
var normalsArray = [];

var vertices = [
        vec4(  0.0, -1.0,  0.0, 1.0 ),
        vec4( -0.5,  0.0,  0.0, 1.0 ),
        vec4(  0.0,  1.0,  0.0, 1.0 ),
        vec4(  0.5,  0.0,  0.0, 1.0 ),
        vec4(  0.0,  0.0,  0.5, 1.0 ),
        vec4(  0.0,  0.0, -0.5, 1.0 )
    ];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.2, 0.2, 0.2, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 1.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.3, 0.9, 0.1, 1.0);
var materialSpecular = vec4( 0.2, 0.2, 0.2, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = flag;
var theta =[0, 0, 0];

var check = 0;

var thetaLoc;

var flag = true;

function tri(a, b, c ) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);


     pointsArray.push(vertices[a]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[b]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal);   
     pointsArray.push(vertices[a]);  
     normalsArray.push(normal); 
     pointsArray.push(vertices[c]); 
     normalsArray.push(normal); 
     pointsArray.push(vertices[b]); 
     normalsArray.push(normal);    
}


function colorCube()
{
	tri( 5, 1, 0 );
	tri( 5, 2, 1 );
    tri( 1, 4, 2 );
    tri( 1, 0, 4 );
    tri( 4, 0, 3 );
    tri( 4, 3, 2 );
    tri( 3, 5, 2 );
    tri( 3, 0, 5 );
	
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );
    
    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );
    
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta"); 
    
    viewerPos = vec3(0.0, 0.0, -20.0 );

    projection = ortho(-1, 1, -1, 1, -100, 100);
    
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
	
	document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), 
       flatten(specularProduct) );	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), 
       flatten(lightPosition) );
       
    gl.uniform1f(gl.getUniformLocation(program, 
       "shininess"),materialShininess);
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));
    
    render();
}

var render = function(){
            
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
     
	if(flag)
	{  
		if(check == 0)
		{        
			theta[axis] += 2.0;
		} else if(check == 1)
		{
			theta[axis] -= 2.0;
		}
	}
            
    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );
            
            
    requestAnimFrame(render);
}

var currentlyPressedKeys = {};

function handleKeyDown(event) {
	
    currentlyPressedKeys[event.keyCode] = true;

    if (event.keyCode == 37) 
	{
		check = 1;
    	axis = yAxis;  
    } else if (event.keyCode == 38) 
	{
		check = 1;
    	axis = xAxis;  
    } else if (event.keyCode == 39) 
	{
		check = 0;
    	axis = yAxis;  
    } else if (event.keyCode == 40) 
	{
		check = 0;
    	axis = xAxis;  
    }			
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
	axis = flag;
}
