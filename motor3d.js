var motor3d = new Object();

motor3d.scene = new THREE.Scene();
motor3d.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
motor3d.manager = new THREE.LoadingManager();
motor3d.loader = new THREE.OBJLoader( motor3d.manager );

motor3d.renderer = new THREE.WebGLRenderer();
motor3d.renderer.setSize( 300,300 );
motor3d.renderer.setClearColor(0xFFFFFF, 1);

motor3d.createRotor = function() {
  this.rotor = new THREE.Object3D();
  this.loader.load( 'obj/d1_ee_motor_rotor_may23.obj', function ( object ) {
    object.rotateOnAxis(new THREE.Vector3(0,-1,0), Math.PI/2);
    motor3d.rotor.add( object );
  } );
  var magnet_geometry = new THREE.CubeGeometry(1,1,1);
  var magnet_north_material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
  var magnet_south_material = new THREE.MeshLambertMaterial( { color: 0x0000FF } );
  for (var i = 0; i < motor.params.polePairs; i++) {
    var north = new THREE.Mesh( magnet_geometry, magnet_north_material );
    north.rotateOnAxis(new THREE.Vector3(0,0,1), (i/motor.params.polePairs)*2*Math.PI);
    north.translateX(4.5);
    this.rotor.add( north );
    var south = new THREE.Mesh( magnet_geometry, magnet_south_material );
    south.rotateOnAxis(new THREE.Vector3(0,0,1), (i/motor.params.polePairs+(0.5/motor.params.polePairs))*2*Math.PI);
    south.translateX(4.5);
    this.rotor.add( south );
  }
  this.scene.add(this.rotor);
}

motor3d.init = function() {
  $("#silly-3d").append( this.renderer.domElement );
  this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
  var form = document.forms['motor'];
  motor.params.polePairs = parseInt(form.elements['polePairs'].value);
  
  var scene = this.scene;
  var light;
  // set up lighting
  light = new THREE.DirectionalLight( 0xffffff );
  light.position.set( 1, 1, 1 );
  scene.add( light );
  light = new THREE.DirectionalLight( 0x555555 );
  light.position.set( -1, -1, -1 );
  scene.add( light );
  light = new THREE.AmbientLight( 0x222222 );
  scene.add( light );
  
  this.camera.position.z = 10;
};

motor3d.regenerate = function() {
  this.scene.remove(this.rotor);
  this.createRotor();
};


motor3d.draw = function() {
  this.rotor.rotation = new THREE.Euler(0,0, motor.state.theta, 'XYZ');
  this.renderer.render(this.scene, this.camera);
};
