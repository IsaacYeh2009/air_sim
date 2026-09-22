/* global BABYLON */
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
const scene = new BABYLON.Scene(engine);
scene.clearColor = new BABYLON.Color4(0.84, 0.91, 0.91, 1);

const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2.7, 1.12, 13, new BABYLON.Vector3(0, 0.3, 0), scene);
camera.lowerRadiusLimit = 5; camera.upperRadiusLimit = 23; camera.wheelDeltaPercentage = .01;
camera.attachControl(canvas, true);
const light = new BABYLON.HemisphericLight("fill", new BABYLON.Vector3(-1, 1, -1), scene); light.intensity = 1.25;
const key = new BABYLON.DirectionalLight("key", new BABYLON.Vector3(-.4, -1, .35), scene); key.position = new BABYLON.Vector3(5, 8, -5); key.intensity = .6;

const grid = BABYLON.MeshBuilder.CreateGround("grid", { width: 20, height: 14, subdivisions: 20 }, scene);
const gridMat = new BABYLON.StandardMaterial("gridmat", scene); gridMat.diffuseColor = new BABYLON.Color3(.63,.76,.76); gridMat.alpha = .38; gridMat.wireframe = true; grid.material = gridMat; grid.position.y = -2.15;

const modelRoot = new BABYLON.TransformNode("model-root", scene);
let modelMeshes = [];
function material(name, hex, alpha = 1) { const m = new BABYLON.StandardMaterial(name, scene); m.diffuseColor = BABYLON.Color3.FromHexString(hex); m.specularColor = new BABYLON.Color3(.3,.4,.42); m.alpha = alpha; return m; }
function createDemo() {
  modelMeshes.forEach(m => m.dispose()); modelMeshes = [];
  const bodyMat = material("body", "#205e79"), glass = material("glass", "#64d4d4", .72), tire = material("tire", "#182e39"); glass.backFaceCulling = false;
  const body = BABYLON.MeshBuilder.CreateBox("vehicle-body", { width: 4.7, height: .82, depth: 1.75 }, scene); body.position.y = -1.12; body.parent = modelRoot; body.material = bodyMat;
  const nose = BABYLON.MeshBuilder.CreateCylinder("nose", { diameterTop: 1.72, diameterBottom: .65, height: 1.15, tessellation: 32 }, scene); nose.rotation.z = Math.PI/2; nose.position.set(-2.33,-1.12,0); nose.parent=modelRoot; nose.material=bodyMat;
  const cabin = BABYLON.MeshBuilder.CreateCylinder("cabin", { diameterTop: .95, diameterBottom: 1.5, height: 2.05, tessellation: 32 }, scene); cabin.scaling.z=1.25; cabin.rotation.z=Math.PI/2; cabin.position.set(.35,-.42,0); cabin.parent=modelRoot; cabin.material=glass;
  const wing = BABYLON.MeshBuilder.CreateBox("wing", { width: 1.15,height:.1,depth:3.05},scene); wing.position.set(1.7,-.78,0);wing.parent=modelRoot;wing.material=bodyMat;
  [-1.55,1.55].forEach(x=>[-.86,.86].forEach(z=>{const w=BABYLON.MeshBuilder.CreateCylinder("wheel",{diameter:.65,height:.23,tessellation:20},scene);w.rotation.x=Math.PI/2;w.position.set(x,-1.72,z);w.parent=modelRoot;w.material=tire;modelMeshes.push(w)}));
  modelMeshes.push(body,nose,cabin,wing);
}
createDemo();

const flowLines = []; const flowMat = new BABYLON.StandardMaterial("flow", scene); flowMat.emissiveColor = new BABYLON.Color3(.02,.75,.79); flowMat.alpha = .76;
function createFlow() {
  flowLines.forEach(f => f.dispose()); flowLines.length = 0;
  for (let y=-1.7;y<=1.7;y+=.47) for(let z=-2.75;z<=2.75;z+=.45) {
    const points=[]; for(let x=-6;x<=6;x+=.22){ const influence=Math.exp(-((x*x)/9+(y*y)/2+(z*z)/4)); points.push(new BABYLON.Vector3(x, y + (y||.12)*influence*.28, z + z*influence*.12)); }
    const line=BABYLON.MeshBuilder.CreateLines("flow",{points,updatable:true},scene);line.color=new BABYLON.Color3(.03,.62,.67);line.alpha=.63;flowLines.push(line);
  }
}
createFlow();
let windSpeed=48, density=1.225, direction=270, playing=true, elapsed=0;
const $=id=>document.getElementById(id);
function cardinal(deg){const names=["North","North-east","East","South-east","South","South-west","West","North-west"];return names[Math.round(((deg%360)+360)%360/45)%8]}
function updateReadouts(){
  $("speedOut").innerHTML=`${windSpeed} <em>km/h</em>`; $("densityOut").innerHTML=`${density.toFixed(3)} <em>kg/m³</em>`; $("directionOut").textContent=`${direction}°`; $("windName").textContent=cardinal(direction);
  $("compass").querySelector(".arrow").style.transform=`rotate(${direction}deg)`;
  const v=windSpeed/3.6, area=3.6, cd=.32 + .3*Math.abs(Math.sin(modelRoot.rotation.y)); const drag=.5*density*v*v*area*cd;
  $("dragValue").textContent=`${drag.toFixed(1)} N`; $("dragDetail").textContent=`Cd ${cd.toFixed(2)} · frontal area ${area.toFixed(1)} m²`;
  const r=direction*Math.PI/180; flowLines.forEach(line=>line.rotation.y=-(r-Math.PI*1.5));
}
$("windSpeed").oninput=e=>{windSpeed=+e.target.value;updateReadouts()}; $("airDensity").oninput=e=>{density=+e.target.value;updateReadouts()};
$("modelRotation").oninput=e=>{modelRoot.rotation.y=+e.target.value*Math.PI/180; $("rotationOut").textContent=`${e.target.value}°`;updateReadouts()};
$("compass").onclick=e=>{const r=e.currentTarget.getBoundingClientRect(),x=e.clientX-r.left-r.width/2,y=e.clientY-r.top-r.height/2; direction=(Math.round((Math.atan2(x,-y)*180/Math.PI+360)%360/5)*5)%360;updateReadouts()};
$("resetCamera").onclick=()=>camera.setPosition(new BABYLON.Vector3(-9,6,-9));
$("playToggle").onclick=e=>{playing=!playing;e.currentTarget.textContent=playing?"Ⅱ":"▶"};
$("modelUpload").onchange=async e=>{const file=e.target.files[0]; if(!file)return; const name=file.name; try { modelMeshes.forEach(m=>m.dispose()); modelMeshes=[]; const url=URL.createObjectURL(file); const result=await BABYLON.SceneLoader.ImportMeshAsync("", "", url, scene); result.meshes.forEach(m=>{if(m!==scene.meshes[0] && m!==grid){m.parent=modelRoot;modelMeshes.push(m)}}); URL.revokeObjectURL(url); $("modelName").textContent=name.replace(/\.[^.]+$/,"").toUpperCase(); $("loadedFile").children[1].textContent=name; } catch { createDemo(); alert("This model could not be loaded. Please use GLB, GLTF, OBJ, or STL."); }};
$("restoreDemo").onclick=()=>{createDemo();$("modelName").textContent="DEMO VEHICLE";$("loadedFile").children[1].textContent="Demo vehicle"};
$("exportButton").onclick=()=>{const report={windSpeedKmh:windSpeed,windDirectionDegrees:direction,airDensityKgM3:density,modelRotationDegrees:Math.round(modelRoot.rotation.y*180/Math.PI),estimatedDragNewtons:$("dragValue").textContent,generatedAt:new Date().toISOString()};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(report,null,2)],{type:"application/json"}));a.download="flowlab-report.json";a.click();$("toast").classList.add("show");setTimeout(()=>$("toast").classList.remove("show"),2200)};
updateReadouts(); engine.runRenderLoop(()=>{if(playing){elapsed+=engine.getDeltaTime()/1000; $("timeReadout").textContent=new Date(elapsed*1000).toISOString().slice(11,19);const drift=(elapsed*windSpeed/160)%1;flowLines.forEach((line,i)=>line.position.x=(drift*2+i%4*.01)%2)}scene.render()}); window.addEventListener("resize",()=>engine.resize());
