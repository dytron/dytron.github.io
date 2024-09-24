import { ModelOBJ } from "./ModelOBJ.js";
import { Model } from "./Model.js";
import { Camera } from "./Camera.js";
import { DirectionalLight } from "./light/DirectionalLight.js";
import { ShaderManager } from "./ShaderManager.js";
import { PointLight } from "./light/PointLight.js";
import { SpotLight } from "./light/SpotLight.js";
import { MaterialManager } from "./MaterialManager.js";
import { CameraController } from "./CameraController.js";
import { SkyBox } from "./SkyBox.js";
import { TextureManager } from "./TextureManager.js";
import { ShadowMapping } from "./ShadowMapping.js";

export class Scene {
    constructor() {
        this.models = [];
        this.objToModelOBJ = {};
        this.camera = new Camera();
        this.camera.setScene(this);
        this.directionalLight = new DirectionalLight().setScene(this);
        this.pointLight = [0, 0, 0, 0].map((_, index) => new PointLight(index).setScene(this));
        this.spotLight = new SpotLight().setScene(this);
        this.renderer = {};
        this.shaderManager = new ShaderManager();
        this.materialManager = new MaterialManager();
        this.textureManager = new TextureManager();
        this.backgroundColor = [0, 0, 0, 1];
        this.planeCamera = new Camera();
        this.shadowMapping = null;
        // Configurações da camera principal
        this.camera.setPosition([0, 0, 4])
            .setTarget([0, 0, 0])
            .setUpVector([0, 1, 0])
            .setBackgroundColor([0, 0, 0, 1]);
        // Configurações da camera do plano
        this.planeCamera.setPosition([0, 0, 4])
            .setTarget([0, 0, 0])
            .setUpVector([0, 1, 0])
            .setBackgroundColor([0.1, 0.1, 0.1, 1]);

        this.camera.autoUpdateAspectRatio = false;
        
        this.mainCameraController = new CameraController();
        this.mainCameraController.setCamera(this.camera);
        this.planeCameraController = new CameraController();
        this.planeCameraController.setCamera(this.planeCamera);
        this.cameraController = this.mainCameraController;
        this.skybox = new SkyBox(this.camera, this.textureManager);
        
        this.lastTime = 0;
        this.step = ()=>{}
    }
    toggleCameraController() {
        if (this.cameraController == this.mainCameraController) {
            this.cameraController = this.planeCameraController;
        } else {
            this.cameraController = this.mainCameraController;
        }
    }
    init() {
//        this.textureManager.loadCubeMap("cubemap");
        this.materialManager.init();
        this.skybox.init(this.shaderManager.getProgram("cube-map"));
//        this.skybox.setTextureName("cubemap");
        
        this.shadowMapping = new ShadowMapping(this.spotLight);
    }
    addModel(model) {
        this.models.push(model);
        model.scene = this;
        return model;
    }
    createShaderProgram(shader) {
        const program = webglUtils.createProgramFromSources(gl, this.shaderManager.getSources(shader));
        this.shaderManager.setProgram(shader, program);
    }
    isLoaded() {
        return !this.models.find(m => !m.isLoaded());
    }
    
    draw(currentTime) {     
        let deltaTime = currentTime - this.lastTime;
        this.step(deltaTime); 
        this.lastTime = currentTime; 
        this.shadowMapping.apply(scene);  
        gl.clearColor(...this.camera.backgroundColor, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.skybox.render();
        
        for (let model of this.models) {
            
            const viewMatrix = mat4.create();
            const projectionMatrix = mat4.create();

            model.renderer.updateShader(gl, this.shaderManager);
            
            this.camera.updateAspectRatio(gl.canvas);
            this.camera.apply(viewMatrix, projectionMatrix);
            this.camera.setUniforms(model.renderer.program);
            
            model.draw(viewMatrix, projectionMatrix, {
                directionalLight: this.directionalLight, 
                ...this.pointLight,
                spotLight: this.spotLight
            });
        }
        //this.shadowMapping.drawDebugQuad(0.1, 50);
    }
    importOBJ(name) {
        if (name in this.objToModelOBJ) return;
        let obj = new ModelOBJ(name);
        this.objToModelOBJ[name] = obj;
    }
    async loadAll() {
        await Promise.all(Object.values(this.objToModelOBJ).map(async obj => {
            if (obj.isLoaded()) return;
            await obj.loadFromName();
        }));
    }
    addModelFromOBJ(name) {
        let model = new Model();
        let obj = this.objToModelOBJ[name];
        model.setOBJ(obj);
    
        let num = 1;
        const existingNames = this.models.map(m => m.name);
        
        while (existingNames.includes(`${name}${num}`)) {
            num++;
        }
    
        model.name = `${name}${num}`;
        
        return this.addModel(model);
    }
}