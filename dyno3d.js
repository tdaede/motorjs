var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
var rotor = new THREE.Object3D();
var manager = new THREE.LoadingManager();
var loader = new THREE.OBJLoader( manager );
loader.load( 'obj/d1_ee_motor_rotor_may23.obj', function ( object ) {
object.rotateOnAxis(new THREE.Vector3(0,-1,0), Math.PI/2);
rotor.add( object );
} );

light = new THREE.DirectionalLight( 0xffffff );
light.position.set( 1, 1, 1 );
scene.add( light );
light = new THREE.DirectionalLight( 0x555555 );
light.position.set( -1, -1, -1 );
scene.add( light );
light = new THREE.AmbientLight( 0x222222 );
scene.add( light );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( 300,300 );
renderer.setClearColor(0xFFFFFF, 1);
function init3D() {
$("#silly-3d").append( renderer.domElement );
var controls = new THREE.OrbitControls( camera, renderer.domElement );
var form = document.forms['motor'];

var magnet_geometry = new THREE.CubeGeometry(1,1,1);
var magnet_north_material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
var magnet_south_material = new THREE.MeshLambertMaterial( { color: 0x0000FF } );
for (var i = 0; i < motor.params.polePairs(); i++) {
	var north = new THREE.Mesh( magnet_geometry, magnet_north_material );
	north.rotateOnAxis(new THREE.Vector3(0,0,1), (i/motor.params.polePairs())*2*Math.PI);
	north.translateX(4.5);
	rotor.add( north );
	var south = new THREE.Mesh( magnet_geometry, magnet_south_material );
	south.rotateOnAxis(new THREE.Vector3(0,0,1), (i/motor.params.polePairs()+(0.5/motor.params.polePairs()))*2*Math.PI);
	south.translateX(4.5);
	rotor.add( south );
}
scene.add(rotor);
camera.position.z = 10;
}
function draw3D() {
rotor.rotation = new THREE.Euler(0,0, motor.state.theta, 'XYZ');
renderer.render(scene, camera);
}