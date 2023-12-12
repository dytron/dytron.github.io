// Modelo do carro: https://sketchfab.com/3d-models/low-poly-lamborghini-6f2a4555a33d4e6aadb142b5cca3f07b

const SCENE_W = 700;
const SCENE_H = 700;
const AXIS_SIZE = 5000;
const MODELS = ["hydrant", "sphere"];

let cameraControlling = false;
let mouseDrag = false;
let mousePoint = new Point(0, 0, 0);
let cameraRotation = new Point(0, 0, 0);
let cameraDrag = new Point(0, 0, 0);
let cameraPosition = new Point(0, 0, 0);
let modifiedView = true;
let firstFrame = true;

let zoomLevel = 1.0; 
let zoomIncrement = 0.1;
let cameraSpeed = 2;

let modelName = "hydrant";
let primitiveName = "box";

let selectedModel = null;

let checkboxVisible;
let canvas;

let config = {
    wireframe: true,
    fill: true,
    axis: true
};

function getAvailableName(name) {
    let index = 1;
    let newName = name;
    while (scene.find((e) => e.name == newName)) {
        newName = `${name} ${++index}`
    }
    return newName;
}

function getModelPath() {
    return `./models/${modelName}.obj`;
}

let hold = {};

function keyHolding(key) {
    if (key in hold) return hold[key];
    return false;
}

let tetrahedron;

function setup() {
    canvas = createCanvas(SCENE_W, SCENE_H, WEBGL);
    canvas.parent('canvas-container');
    canvas.elt.addEventListener("mousedown", () => {
        modifiedView = true;
        cameraControlling = true;
    });
    modifiedView = true;
    // Detect mouse click outside the canvas
    document.addEventListener("mousedown", (event) => {
        if (event.target !== canvas.elt) {
            cameraControlling = false;
        }
    });
    setupViewSettings();
    setupLoadModel();
    setupAddPrimitive();
    setupSceneView();
    setupObjectView();
    setupOctreeView();
    setupCSGView();
    setupDropModel();
    
    scene = [];

    
    //new Solid();
//    tetrahedron.print();
   // console.log(e1);

//    scene.push(tetrahedron);
    frameRate(60);
}

function setupDropModel() {
    let mainCanvas = document.querySelector('canvas');
    // Carregar arquivo de modelo
    mainCanvas.addEventListener('drop', e => {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = () => {
          addModel("model", reader.result);
          console.log(reader.result);
        }
        reader.readAsDataURL(e.dataTransfer.files[0]);
    });
    mainCanvas.addEventListener("dragover", e => {
        e.preventDefault();
    });
    mainCanvas.addEventListener("dragleave", e => {
        e.preventDefault();
    });
      

}

function setupViewSettings() {
    checkboxWireframe = createCheckbox("Wireframe", config.wireframe);
    checkboxWireframe.changed(() => { config.wireframe = checkboxWireframe.checked(); modifiedView = true; })
    checkboxWireframe.parent('view-settings');
    
    checkboxFill = createCheckbox("Fill", config.fill);
    checkboxFill.changed(() => { config.fill = checkboxFill.checked(); modifiedView = true; })
    checkboxFill.parent('view-settings');

    checkboxAxis = createCheckbox("Axis", config.axis);
    checkboxAxis.changed(() => { config.axis = checkboxAxis.checked(); modifiedView = true; })
    checkboxAxis.parent('view-settings');
}

function addModel(name, path) {
    let newName = getAvailableName("model " + name);
    let model = new ModelObject(path);
    model.name = newName;
    scene.push(model);
    selectScene.option(newName);
    selectScene.adjust();
    modifiedView = true;
}

function setupLoadModel() {
    selectLoadModel = createSelect();
    MODELS.forEach(m => selectLoadModel.option(m));
    selectLoadModel.changed(() => {
        modelName = selectLoadModel.value();
    });
    selectLoadModel.parent('load-model');
    buttonLoadModel = createButton("Load");
    buttonLoadModel.mousePressed(() => {
        addModel(modelName, getModelPath());
        modifiedView = true;
    });
    buttonLoadModel.parent('load-model');
}

function setupAddPrimitive() {
    let parent = 'add-primitive';
    selectAddPrimitive = createSelect();
    PRIMITIVES.forEach(m => selectAddPrimitive.option(m));
    selectAddPrimitive.changed(() => {
        primitiveName = selectAddPrimitive.value();
    });
    selectAddPrimitive.parent(parent);
    buttonAddPrimitive = createButton("Add");
    buttonAddPrimitive.mousePressed(() => {
        let newName = getAvailableName(primitiveName);
        let primitive;
        if (primitiveName == "sphere") {
            primitive = new Sphere(100);
        } else if (primitiveName == "box") {
            primitive = new Box(100, 100, 100);
        } else if (primitiveName == "cylinder") {
            primitive = new Cylinder(100, 300);
        } else if (primitiveName == "cone") {
            primitive = new Cone(100, 300);
        } else if (primitiveName == "torus") {
            primitive = new Torus(300, 100);
        } else if (primitiveName == "pyramid") {
            primitive = new Pyramid(100, 100, 4);
        }
        primitive.name = newName;
        primitive.process();
        scene.push(primitive);
        selectScene.option(newName);
        selectScene.adjust();
        modifiedView = true;
    });
    buttonAddPrimitive.parent(parent);
}

function selectModel(model) {
    selectedModel = model;
    labelVolume.html("");
    labelArea.html("");
    if (selectedModel) {
        checkboxVisible.elt.firstChild.firstChild.checked = selectedModel.visible;
        if (selectedModel.volume) {
            labelVolume.html(`Volume: ${selectedModel.volume}`);
        }
        if (selectedModel.area) {
            labelArea.html(`Area: ${selectedModel.area}`);
        }
    }
    modifiedView = true;
}

function deleteSelectedModel() {
    if (!selectedModel) return;
    let index = scene.findIndex((e) => e.name == selectedModel.name);
    if (index == -1) return;
    selectScene.elt.remove(1 + index);
    scene.splice(index, 1);
    selectModel(null);
    selectScene.adjust();
}

function setupSceneView() {
    selectScene = createSelect();
    selectScene.attribute('size', 5);
    selectScene.style('min-width', '200px');
    selectScene.parent('scene');
    selectScene.option('none');
    selectScene.elt.addEventListener("click", () => {
        let model = scene.find((e) => e.name == selectScene.value());
        selectModel(model);
        selectScene.adjust();
    });
    selectScene.adjust = () => {
        selectScene.attribute('size', selectScene.elt.options.length);
    };
}

function setupObjectView() {
    checkboxVisible = createCheckbox("Visible", true);
    checkboxVisible.changed(() => { 
        if (!selectedModel) return;
        selectedModel.visible = checkboxVisible.checked(); 
        modifiedView = true;
    })
    checkboxVisible.parent('object-visible');
    
    labelVolume = createDiv('');
    labelVolume.parent('object-visible');

    labelArea = createDiv('');
    labelArea.parent('object-visible');

    buttonDeleteObject = createButton('Delete');
    buttonDeleteObject.parent('object');
    buttonDeleteObject.mousePressed(() => deleteSelectedModel());
    document.addEventListener("keydown", (event) => {
        if (event.key === "Delete" || event.key === "Del") {
            // Simulate a click on the delete button
            if (cameraControlling) {
                deleteSelectedModel();
            }
        }
    });
}

function setupOctreeView() {
    sliderDepth = createSlider(3, 9, 1);
    sliderDepth.parent('octree');
    sliderDepth.value(5);
    sliderDepth.input(() => {
        labelDepthValue.html(sliderDepth.value());
    })

    labelDepthValue = createDiv('5');
    labelDepthValue.parent('octree');

    buttonGenerateOctree = createButton('Generate');
    buttonGenerateOctree.parent('octree-generate');
    buttonGenerateOctree.mousePressed(() => {
        if (!selectedModel) return;
        let newName = getAvailableName(`octree ${selectedModel.type}`);
        let octreeCenter = selectedModel.center.mul(1);
        let oct = new Octree(octreeCenter, selectedModel.getMaxRadius(), sliderDepth.value());
        oct.build(selectedModel);
        oct.process();
        oct.name = newName;
        selectedModel.visible = false;
        selectModel(oct);
        scene.push(oct);
        selectScene.option(newName);
        selectScene.value(newName);
        selectScene.adjust();
    });
}

function setupCSGView() {
    csgInput = document.getElementById("csg-input");
    csgInput.addEventListener("keydown", (event) => {
        if (event.key === "Tab" || event.keyCode === 9) {
            event.preventDefault();
            const start = csgInput.selectionStart;
            const end = csgInput.selectionEnd;
            const lines = csgInput.value.split('\n');
            const space = "  ";
            const startLine = csgInput.value.substring(0, start).split('\n').length - 1;
            const endLine = csgInput.value.substring(0, end).split('\n').length - 1;
            // Adicionando tabs 
            if (!event.shiftKey) {
                // Adiciona 2 espaços em cada linha selecionada
                for (let i = startLine; i <= endLine; i++) {
                    lines[i] = space + lines[i];
                }
                csgInput.value = lines.join('\n');
                // Move o cursor
                const newStart = start + space.length;
                const newEnd = end + (space.length * (endLine - startLine + 1));
                csgInput.selectionStart = newStart;
                csgInput.selectionEnd = newEnd;
            } else {
                let spaceCount = 0;
                let removedFirst = false;
                // Remove 2 espaços de cada linha selecionada (se houver)
                for (let i = startLine; i <= endLine; i++) {
                    if (lines[i].startsWith(space)) {
                        lines[i] = lines[i].substring(space.length);
                        spaceCount += space.length;
                        if (i === startLine && lines[i].length >= space.length) {
                            removedFirst = true;
                        }
                    }
                }
                csgInput.value = lines.join('\n');
                // Move o cursor
                let newStart = start - space.length;
                if (newStart < 0 || (csgInput.value.substring(0, newStart).split('\n').length - 1) < startLine) {
                    newStart = start;
                }
                const newEnd = end - (spaceCount);
                csgInput.selectionStart = newStart;
                csgInput.selectionEnd = newEnd >= 0 ? newEnd : 0;
            }
        }
    });
    buttonGenerateCSG = createButton('Generate');
    buttonGenerateCSG.parent('csg-generate');
    buttonGenerateCSG.mousePressed(() => {
        let newName, newModel;
        if (window['csg-brep'].value === 'csg') {
            newName = getAvailableName(`csg`);
            newModel = CSGTree.parseCSGTree(csgInput.value);
        } else {
            newName = getAvailableName(`solid`);
            newModel = new SolidObject(csgInput.value);
        }
        newModel.name = newName;
        if (selectedModel)
            selectedModel.visible = false;
        selectModel(newModel);
        scene.push(newModel);
        selectScene.option(newName);
        selectScene.value(newName);
        selectScene.adjust();
    });
    buttonShowCSG = createButton('Show Selected Output');
    buttonShowCSG.parent('csg-generate');
    buttonShowCSG.mousePressed(() => {
        if (selectedModel && selectedModel.type != "octree") {
            csgInput.value = selectedModel.print();
        }
    });
    buttonBox = createButton('Box');
    buttonBox.parent('csg-generate');
    buttonBox.mousePressed(() => {
        csgInput.value = SolidObject.generateBoxInput();
    });
    buttonSphere = createButton('Icosahedron');
    buttonSphere.parent('csg-generate');
    buttonSphere.mousePressed(() => {
        csgInput.value = SolidObject.generateIcosphereInput();
    });
}

function cameraMovement() {
    if (!cameraControlling) return;
    let velocity = new Point(0, 0, 0);
    let upDirection = keyHolding("e") - keyHolding("c");
    let xDirection = keyHolding("d") - keyHolding("a");
    let zDirection = keyHolding("w") - keyHolding("s");
    let moveSpeed = cameraSpeed;
    velocity.x -= xDirection * moveSpeed;
    velocity.z += zDirection * moveSpeed;
    velocity.y -= upDirection * moveSpeed;
    let primitive = new Primitive();
    primitive.addVertex(velocity.x, velocity.y, velocity.z);
    primitive.rotateY(-cameraRotation.y);
    primitive.rotateZ(-cameraRotation.z);
    primitive.preProcess();
    velocity = primitive.points[0];
    if (keyHolding("v")) {
        cameraPosition = new Point(0, 0, 0);
    }
    if (velocity.magnitude() > 0) {
        modifiedView = true;
    }
    cameraPosition = cameraPosition.add(velocity);
}

function draw() {
    scale(1, -1, 1);
    // Ajustar perspectiva da câmera baseado no zoom
    let fov = PI / 3;  // Campo de visão inicial
    let camZ = (height / 2.0) / tan(fov / 2.0);
    perspective(PI / 3, width / height, camZ / 10, camZ * 10);
    
    // Aplicar zoom
    scale(zoomLevel);
    if (mouseDrag) {
        modifiedView = true;
        cameraRotation.x = cameraDrag.x + 1/180*(mouseY - mousePoint.y);
        cameraRotation.y = cameraDrag.y + 1/180*(mouseX - mousePoint.x);
    }
    cameraMovement();
    if (!modifiedView) return;
    pointLight(255, 255, 255, 100, -200, 400);
    ambientLight(60);
    rotateX(cameraRotation.x);
    rotateY(cameraRotation.y);
    strokeWeight(min(1/zoomLevel, 1));
    background(48);
    translate(cameraPosition.x, cameraPosition.y, cameraPosition.z);

    if (config.axis) {
        // Desenho do eixo y:
        beginShape();
        stroke(255,0,0);
        vertex(0,-AXIS_SIZE,0);
        vertex(0,AXIS_SIZE,0);
        endShape();

        // Desenho do eixo x:
        beginShape();
        stroke(0,255,0);
        vertex(-AXIS_SIZE,0, 0);
        vertex(AXIS_SIZE,0, 0);
        endShape();

        // Desenho do eixo z:
        beginShape();
        stroke(0,0,255);
        vertex(0,0,-AXIS_SIZE);
        vertex(0,0,AXIS_SIZE);
        endShape();
    }
    // Objetos da cena
    scene.forEach(o => {
        if (!o.visible) return;
        push();
        shininess(30);
        o.selected = (selectedModel === o);
        o.draw();
        pop();
    });
    

    modifiedView = false;
}

function mousePressed() {
    if (mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height) {
        mouseDrag = true;
        mousePoint.x = mouseX;
        mousePoint.y = mouseY;
        cameraDrag.x = cameraRotation.x;
        cameraDrag.y = cameraRotation.y;
    }
}

function mouseReleased() {
    mouseDrag = false;
}

function mouseWheel(event) {
    if (!mouseDrag && !cameraControlling) return false;
    // Ajustar nível do zoom
    if (event.delta > 0) {
        zoomLevel -= zoomIncrement;  // Zoom out
        modifiedView = true;
    } else {
        zoomLevel += zoomIncrement;  // Zoom in
        modifiedView = true;
    }
    // Limitar zoom
    zoomLevel = constrain(zoomLevel, 0.2, 8.0);
    return false;
}

function keyPressed() {
    hold[key] = true;
    if (keyCode === ESCAPE) {
        selectedModel = null;
        selectScene.selected();
        modifiedView = true;
    }
}

function keyReleased() {
    hold[key] = false;
}

function handleKeyDown(e) {
    if (e.key == "Tab") {
      e.preventDefault();
  
      const start = this.selectionStart;
      const end = this.selectionEnd;
  
      this.value =
        this.value.substring(0, start) + "\t" + this.value.substring(end);
  
      this.selectionStart = this.selectionEnd = start + 1;
    }
  }