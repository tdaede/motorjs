var dt = 1/60;

var motor = {
  iq: 0,
  loadtype: ''
}
motor.state = new Object();
motor.state.theta = 0;
motor.state.angVel = 0.5;

var load = new Object();
load.car = new Object();
load.car.airDrag = 0.1;

var defaultParams = {
  polePairs: 6,
  kt: 1,
  kv: 1,
  J: 1,
  drag: 0.1,
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

motor.update = function (dt) {
  var motor_t = this.iq * this.params.kt - this.state.angVel * this.params.drag;
  this.emf = motor.state.angVel * motor.params.kv;
  this.vq = this.emf + this.iq * this.params.Rs;
  
  if (this.loadtype == 'speed') {
    this.loadtorque = motor_t;
    t = 0;
    this.state.angVel = this.loadVel;
  } else if (this.loadtype == 'torque') {
    t = motor_t - this.loadtorque;
    this.state.angVel += (dt * t / motor.params.J);
  } else {
    var windTorque = motor.state.angVel*motor.state.angVel*load.car.airDrag;
    if (this.state.angVel < 0) {
      windTorque *= -1;
    }
    t = motor_t - windTorque;
    this.state.angVel += (dt * t / this.params.J);
  }
  
  this.state.theta += this.state.angVel*dt;
  this.state.e_theta = (this.state.theta * this.params.polePairs);
}

function updateMotor() {
  var form = document.forms['motor'];
  motor.params.polePairs = form.elements['polePairs'].value;
  motor.loadtorque = parseFloat(form.elements['loadtorque'].value);
  motor.iq = parseInt(form.elements['iq'].value);
  motor.loadVel = parseFloat(form.elements['angVel'].value);
  motor.loadtype = form.elements['loadtype'].value;
  
  motor.update(dt);

  var power = (iq * vq);
  var mechpower = motor.state.angVel * motor.loadtorque;
  
  d = $V([1,0]).rotate(motor.state.e_theta,center);
  q = $V([0,1]).rotate(motor.state.e_theta,center);
  a = a_ref.x(d.dot(a_ref));
  b = b_ref.x(d.dot(b_ref));
  c = c_ref.x(d.dot(c_ref));

  $("#rpm").html((motor.state.angVel * 9.5493).toFixed(2));
  $("#emf").html((motor.emf).toFixed(2));
  $("#torque").html((iq * motor.params.kt).toFixed(2));
  $("#power").html(power.toFixed(2));
  $("#mechpower").html(mechpower.toFixed(2));
  $("#efficiency").html((mechpower/power*100).toFixed(2));
  $("#vq").html(motor.vq.toFixed(2));
  $("#resistanceloss").html((iq*iq*motor.params.Rs).toFixed(2));
  $("#bearingloss").html((motor.state.angVel*motor.params.drag*motor.state.angVel).toFixed(2));
  
  if (motor.state.angVel > 200) {
    $("body").css("padding-left", Math.random()*motor.state.angVel/100);
  }
}