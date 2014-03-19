var motor3d = new Object();

motor3d.scene = new THREE.Scene();
motor3d.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
motor3d.manager = new THREE.LoadingManager();
motor3d.loader = new THREE.OBJLoader( motor3d.manager );

motor3d.renderer = new THREE.WebGLRenderer();
motor3d.renderer.setSize( 300,300 );
motor3d.renderer.setClearColor(0xFFFFFF, 1);

motor3d.createRotor = function() {
  var rotor = new THREE.Object3D();
  /*
  this.loader.load( 'obj/d1_ee_motor_rotor_may23.obj', function ( object ) {
    object.rotateOnAxis(new THREE.Vector3(0,-1,0), Math.PI/2);
    motor3d.rotor.add( object );
  } );
  */
  //var steel = new THREE.MeshLambertMaterial( { color: 0x7F7F7F, transparent: true, opacity: 0.4});
  var steel = new THREE.MeshPhongMaterial( {color: 0x7F7F7F} );
  var rotorDiskGeometry = new THREE.CylinderGeometry(5,5,0.5,40);
  var rotorDisk = new THREE.Mesh(rotorDiskGeometry, steel);
  rotorDisk.rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI/2);
  rotorDisk.translateY(0.75);
  rotor.add(rotorDisk);
  var magnet_geometry = new THREE.CubeGeometry(1,1,1);
  var magnet_north_material = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
  var magnet_south_material = new THREE.MeshLambertMaterial( { color: 0x0000FF } );
  for (var i = 0; i < motor.params.polePairs; i++) {
    var north = new THREE.Mesh( magnet_geometry, magnet_north_material );
    north.rotateOnAxis(new THREE.Vector3(0,0,1), (i/motor.params.polePairs)*2*Math.PI);
    north.translateX(4.5);
    rotor.add( north );
    var south = new THREE.Mesh( magnet_geometry, magnet_south_material );
    south.rotateOnAxis(new THREE.Vector3(0,0,1), (i/motor.params.polePairs+(0.5/motor.params.polePairs))*2*Math.PI);
    south.translateX(4.5);
    rotor.add( south );
  }
  return rotor;
}

motor3d.createStator = function() {
  var stator = new THREE.Object3D();
  var copper = new THREE.MeshPhongMaterial( {color: 0xCA4400} );
  var coilShape = new THREE.Shape();
  var innerRadius = 3;
  var outerRadius = 6;
  var arcLength = Math.PI*1/3/motor.params.polePairs;
  coilShape.moveTo(innerRadius,0);
  coilShape.lineTo(outerRadius,0);
  //coilShape.absarc(0,0,outerRadius,0,arcLength,false);
  coilShape.lineTo(outerRadius*Math.cos(arcLength),outerRadius*Math.sin(arcLength));
  coilShape.lineTo(innerRadius*Math.cos(arcLength),innerRadius*Math.sin(arcLength));
  coilShape.lineTo(innerRadius,0);
  //coilShape.absarc(0,0,innerRadius,arcLength,0,true);
  var coilGeometry = new THREE.ExtrudeGeometry(coilShape, {amount: 1, bevelEnabled: false, curveSegments: 8});
  //var coilGeometry = new THREE.ShapeGeometry(coilShape);
  for (coilNum in motor.coils) {
    var coil = new THREE.Mesh(coilGeometry, copper);
    coil.rotateOnAxis(new THREE.Vector3(0,0,1),motor.coils[coilNum].center);
    stator.add(coil);
  }
  return stator;
}

motor3d.init = function() {
  $("#silly-3d").append( this.renderer.domElement );
  this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
  
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
  this.scene.remove(this.rotor1);
  this.scene.remove(this.rotor2);
  this.rotor1 = this.createRotor();
  this.rotor1.translateZ(2);
  this.scene.add(this.rotor1);
  
  this.scene.remove(this.stator);
  this.stator = this.createStator();
  this.scene.add(this.stator);
  /*
  this.rotor2 = this.createRotor();
  this.rotor2.rotateOnAxis(new THREE.Vector3(1,0,0), Math.PI);
  this.scene.add(this.rotor2);
  */
};


motor3d.draw = function() {
  this.rotor1.rotation = new THREE.Euler(0,0, motor.state.theta, 'XYZ');
  /*this.rotor2.rotation = new THREE.Euler(0,0, motor.state.theta, 'XYZ');*/
  this.renderer.render(this.scene, this.camera);
};
