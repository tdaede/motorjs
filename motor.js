var dt = 1/60;

var motor = {
  iq: 0,
  loadtype: ''
}
motor.state = new Object();
motor.state.theta = 0;
motor.state.angVel = 0.5;
motor.state.temp = 25;

var load = new Object();
load.car = new Object();
load.car.airDrag = 0.13568;  
load.car.wheelRadius = 0.25;

var defaultParams = {
  polePairs: 6,
  kt: 1,
  kv: 1,
  J: 1,
  drag: 0,
  Rs: 0.1
};
motor.params = defaultParams;
function resetMotor() {
  motor.params = defaultParams;
}

var center = $V([0,0]);

var a_ref = $V([1,0]);
var b_ref = a_ref.rotate(Math.PI*2/3,center);
var c_ref = b_ref.rotate(Math.PI*2/3,center);


var a;
var b;
var c;

var d;
var q;

var id;
var iq;

var vd;
var vq;

function angleDifference(x, y) {
  return Math.atan2(Math.sin(x-y), Math.cos(x-y))
}

motor.ab = function(v){
  var ab = $M([
    [1, -1/2, -1/2],
    [0, Math.sqrt(3)/2, Math.sqrt(3)/-2],
    [1/Math.sqrt(2),1/Math.sqrt(2),1/Math.sqrt(2)]
  ]);
  ab = ab.x(Math.sqrt(2/3));
  return ab.x(v);
};

motor.lookupFlux = function(theta) {
  var i = (angleDifference(0,theta)+Math.PI)/2/Math.PI*this.thetaPrecision;
  var j = Math.floor(i);
  var k = i % 1;
  return this.fluxALookup[j]*(1-k) + this.fluxALookup[j+1]*k;
};

motor.lookupEmf = function(theta) {
  var i = (angleDifference(0,theta)+Math.PI)/2/Math.PI*this.thetaPrecision;
  var j = Math.floor(i);
  var k = i % 1;
  return this.emfALookup[j]*(1-k) + this.emfALookup[j+1]*k;
};

motor.regenerate = function() {
  updateFlux();
  var polePairs = motor.params.polePairs;
  var numWindings = 3 * motor.params.polePairs;
  this.magnets = [];
  
  for (var i = 0; i < (polePairs*2); i++) {
    var magnet = new Object();
    magnet.center = i * Math.PI / polePairs;
    if (i % 2) {
      magnet.B = this.airgapFluxDensity;
    } else {
      magnet.B = -1*this.airgapFluxDensity;
    }
    this.magnets.push(magnet);
  }
  // generate lookup tables for one mechanical rotation at 1 rad/s
  this.fluxALookup = [];
  this.emfALookup = [];
  this.fluxPeak = 0;
  //var coilWidth = Math.PI/numWindings;
  var coilWidth = Math.PI/polePairs;
  this.thetaPrecision = 200; // number of lookup points for flux table
  for (var thetaIndex = 0; thetaIndex < this.thetaPrecision; thetaIndex++) {
    var theta = Math.PI * 2 * thetaIndex / this.thetaPrecision;
      var coils = [];
      var magnetWidth = motor.params.magnetArc/polePairs;
      for (var i = 0; i < numWindings; i++) {
        var coil = new Object();
        coil.center = i * Math.PI * 2 / 3 / polePairs;
        coil.flux = 0;
        coil.width = coilWidth;
        coil.phase = i % 3;
        // we assume symmetrical phases, offset only by 120 degrees
        if (coil.phase == 0) {
          var slice = 0.002; // quality of sampling of flux
          var sliceArea = (motor.params.outerRadius*motor.params.outerRadius
            -motor.params.innerRadius*motor.params.innerRadius)*slice/2;
          for (var j = coilWidth/-2; j < coilWidth/2; j += slice) {
            var location = j + coil.center;
            for (magnetNum in this.magnets) {
              if (Math.abs(angleDifference(location,this.magnets[magnetNum].center + theta)) < (magnetWidth / 2)) {
                coil.flux += this.magnets[magnetNum].B*sliceArea;
              }
            }
          }
        }
        coils.push(coil);
      }
    var flux = 0;
    for (var coilNum in coils) {
      var coil = coils[coilNum];
      if (coil.phase == 0) {
        flux = flux + coil.flux;
      }
    }
    if (flux > this.fluxPeak) this.fluxPeak = flux;
    this.fluxALookup.push(flux);  
  }
  this.fluxALookup.push(this.fluxALookup[0]); // add extra entry for wraparound
  this.coils = coils;
  // emf of a phase is the emf of all its series coils
  this.ke = 0;
  for (var thetaIndex = 0; thetaIndex < (this.thetaPrecision-1); thetaIndex++) {
    var emf = (this.fluxALookup[thetaIndex+1] - this.fluxALookup[thetaIndex])/(2*Math.PI/this.thetaPrecision)*this.params.turns;
    if (this.ke < emf) {
      this.ke = emf;
    }
    this.emfALookup.push(emf);
  }
  this.kt = this.ke; // FIXME
  this.params.kv = this.ke * 2; // this should be in peak L-L
  this.params.kt = this.params.kv;
  this.emfALookup.push(this.emfALookup[this.thetaPrecision-2]);
  this.emfALookup.push(this.emfALookup[0]);
  
  // resistance computation
  // assume full fill at ID
  var copperArea = motor.params.statorThickness * 2*Math.PI*motor.params.innerRadius;
  // divide by two beacuse one coil goes out and in
  var conductorArea = copperArea / numWindings / 2 / this.params.turns;
  // FIXME: use actual end winding length instead of *2
  var phaseLength = (motor.params.outerRadius-motor.params.innerRadius)*2;
  phaseLength = phaseLength + (motor.params.innerRadius+motor.params.outerRadius)*coilWidth;
  phaseLength = phaseLength * polePairs * this.params.turns;
  var fill = 0.6;
  var resistivity = 1.68e-8;
  this.rp = resistivity*phaseLength/conductorArea/fill;
  this.params.Rs = this.rp*2;
  
  this.heatCapacity = 10;
  this.thermalResistance = 1;
};  

motor.update = function (dt) {
  var numWindings = 3 * motor.params.polePairs;
  var polePairs = motor.params.polePairs;
  
  //this.fluxA = coils[0].flux;
  this.fluxA = this.lookupFlux(motor.state.theta);
  this.fluxB = this.lookupFlux(motor.state.theta - Math.PI * 2/3 / motor.params.polePairs);
  this.fluxC = this.lookupFlux(motor.state.theta - Math.PI * 4/3 / motor.params.polePairs);
  //this.emfA = (this.fluxA - this.lastFluxA)*dt;
  this.emfA = this.lookupEmf(motor.state.theta)*motor.state.angVel;
  this.emfB = this.lookupEmf(motor.state.theta - Math.PI * 2/3 / motor.params.polePairs)*motor.state.angVel;
  this.emfC = this.lookupEmf(motor.state.theta - Math.PI * 2/3 / motor.params.polePairs)*motor.state.angVel;
  this.emfThree = $V([this.emfA,this.emfB,this.emfC]);
  
  this.emf = motor.state.angVel * motor.params.kv;
  if (this.drivetype == 'current') {
    this.vq = this.emf + this.iq * this.params.Rs;
  } else if (this.drivetype == 'torque') {
    this.iq = this.targetTorque / this.kt / 2;
    this.vq = this.emf + this.iq * this.params.Rs;
  } else {
    this.iq = (this.vq - this.emf) / this.params.Rs;
  }
  
  this.motor_t = this.iq * this.params.kt - this.state.angVel * this.params.drag;
  if (this.loadtype == 'speed') {
    this.loadtorque = -1 * this.motor_t;
  }
    
  if (this.loadtype == 'car') {
    this.loadtorque = 0.5*1.164*motor.state.angVel*motor.state.angVel*load.car.airDrag*load.car.wheelRadius;
    if (this.state.angVel > 0) {
      this.loadtorque *= -1;
    }
  }
  
  var t = this.motor_t + this.loadtorque;
  
  if (this.loadtype == 'speed') {
    this.state.angVel = this.loadVel;
  } else {
    this.state.angVel += (dt * t / motor.params.J);
  }
  
  this.state.theta += this.state.angVel*dt;
  this.state.e_theta = (this.state.theta * this.params.polePairs) % (Math.PI * 2);
  
  var heat = this.iq*this.iq*this.params.Rs - (this.state.temp - 25)/this.thermalResistance;
  this.state.temp = this.state.temp + heat / this.heatCapacity * dt;
}

motor.reset = function () {
  this.state.angVel = 0;
  this.state.theta = 0;
  this.state.temp = 25;
};
