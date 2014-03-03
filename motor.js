  var dt = 1/60;

var motor = new Object();
motor.state = {
  theta: 0,
  angVel: 0.5
};
  
var load = {
  torque: ko.observable(0)
};
load.car = new Object();
load.car.airDrag = 0.1;

var drive = {
  motor: motor,
  load: load,
  inverter: {
	iq: ko.observable(0)
  }
};

var defaultParams = {
	polePairs: ko.observable(6),
  kt: ko.observable(1),
	kv: ko.observable(1),
	J: ko.observable(1),
	drag: ko.observable(0.1),
	Rs: ko.observable(0.1)
};
motor.params = defaultParams;
function resetMotor() {
  motor.params = defaultParams;
}

var inverter = drive.inverter;

drive.electrical_torque = ko.computed(function() {
  return this.inverter.iq() * this.motor.params.kt();
});

drive.bearing_torque = ko.computed(function() {
  return this.motor.state.angVel * this.motor.params.drag();
});
  
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

function updateMotor() {
  var form = document.forms['motor'];
  var loadtorque = parseFloat(load.torque());
  iq = parseFloat(inverter.iq());
  var emf = motor.state.angVel * motor.params.kv();
  vq = emf + iq * motor.params.Rs();
  
  var motor_t = drive.electrical_torque() - drive.bearing_torque();
  
  if (form.elements['loadtype'].value == 'speed') {
    loadtorque = motor_t;
    t = 0;
    motor.state.angVel = parseFloat(form.elements['angVel'].value);
  } else if (form.elements['loadtype'].value == 'torque') {
    t = motor_t - loadtorque;
    motor.state.angVel += (dt * t / motor.params.J());
  } else {
    var windTorque = motor.state.angVel*motor.state.angVel*load.car.airDrag;
    if (motor.state.angVel < 0) {
      windTorque *= -1;
    }
    t = motor_t - windTorque;
    motor.state.angVel += (dt * t / motor.params.J());
  }
  var power = (iq * vq);
  var mechpower = motor.state.angVel * loadtorque;
  
  motor.state.theta += motor.state.angVel*dt;
  motor.state.e_theta = (motor.state.theta * motor.params.polePairs());
  d = $V([1,0]).rotate(motor.state.e_theta,center);
  q = $V([0,1]).rotate(motor.state.e_theta,center);
  a = a_ref.x(d.dot(a_ref));
  b = b_ref.x(d.dot(b_ref));
  c = c_ref.x(d.dot(c_ref));

  $("#rpm").html((motor.state.angVel * 9.5493).toFixed(2));
  $("#emf").html((emf).toFixed(2));
  $("#torque").html((iq * motor.params.kt()).toFixed(2));
  $("#power").html(power.toFixed(2));
  $("#mechpower").html(mechpower.toFixed(2));
  $("#efficiency").html((mechpower/power*100).toFixed(2));
  $("#vq").html(vq.toFixed(2));
  $("#resistanceloss").html((iq*iq*motor.params.Rs()).toFixed(2));
  $("#bearingloss").html((motor.state.angVel*motor.params.drag()*motor.state.angVel).toFixed(2));
  
  if (motor.state.angVel > 200) {
    $("body").css("padding-left", Math.random()*motor.state.angVel/100);
  }
}