import React from "react"
import * as BABYLON from 'babylonjs';

import BabylonScene from './BabylonScene'
import './scene.css'
import { GMAIL_LINK, GITHUB_PROFILE_LINK, FACEBOOK_PROFILE_LINK, LINKEDIN_PROFILE_LINK } from '../constants'

import Resume from '../../assets/andrija_perusic_resume.pdf'

class Scene extends React.Component {
  meshesConfig = [
    {
      name: 'linkedin',
      position: new BABYLON.Vector3(3, 2, 1),
      scaling: new BABYLON.Vector3(0.3, 0.3, 0.3),
    },
    {
      name: 'facebook',
      position: new BABYLON.Vector3(-3, 3, 2),
      scaling: undefined,
    },
    {
      name: 'gmail',
      position: new BABYLON.Vector3(-2, 1.5, -1),
      scaling: new BABYLON.Vector3(0.5, 0.5, 0.5),
    },
    {
      name: 'github',
      position: new BABYLON.Vector3(2, 1, -2),
      scaling: new BABYLON.Vector3(15, 15, 15),
    },
    {
      name: 'cv',
      position: new BABYLON.Vector3(0, 3, 0),
      scaling: new BABYLON.Vector3(0.5, 0.5, 0.5),
    }
  ]

  meshes = {}

  linkRefs = {
    cv: React.createRef(),
    linkedin: React.createRef(),
    github: React.createRef(),
    gmail: React.createRef(),
    facebook: React.createRef(),
  }

  addMeskImportTask = (config, assetsManager, scene) => {
    const meshTask = assetsManager.addMeshTask(`${config.name}Task`, '', '', `${config.name}.babylon`);
    meshTask.onSuccess = task => {
      this.meshes[config.name] = task.loadedMeshes[0]
      this.meshes[config.name].position = config.position
      if (config.scaling) {
        this.meshes[config.name].scaling = config.scaling
      }
      if (config.name === 'gmail') {

      }
      const actionMesh = config.name === 'gmail' ? task.loadedMeshes[2] : task.loadedMeshes[0]
      actionMesh.actionManager = new BABYLON.ActionManager(scene);
      actionMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickTrigger,
          () => {
            this.linkRefs[config.name].current.click()
          },
        )
      )
    }
    meshTask.onError = function (task, message, exception) {
      console.log(message, exception);
    }
  }

  onSceneMount = (sceneArgs) => {
    const { canvas, scene, engine } = sceneArgs

    // scene.debugLayer.show();

    scene.createDefaultLight()
    scene.lights[0].intensity = 1

    const camera = new BABYLON.ArcRotateCamera("Camera", 0, 0, 10, new BABYLON.Vector3(-2, 1, 0), scene);
    camera.setPosition(new BABYLON.Vector3(1, 4, -8));
    camera.upperBetaLimit = Math.PI / 2;
    // camera.useAutoRotationBehavior = true;
    camera.attachControl(canvas, true);

    // window.addEventListener('resize', (event, event2) => {
    //   console.log(event, event2)
    // })

    // is this ok?
    // camera.fovMode = BABYLON.Camera.FOVMODE_HORIZONTAL_FIXED;
    // camera.setPosition(new BABYLON.Vector3(8, 4, -8));

    const light = new BABYLON.SpotLight("*spot00", new BABYLON.Vector3(-2.19, 6.68, -4.62), new BABYLON.Vector3(-0.06, -0.75, 0.66), 1.7, 1, scene);
    light.shadowMinZ = 1;
    light.shadowMaxZ = 20;
    light.intensity = 0.7;


    var generator = new BABYLON.ShadowGenerator(512, light);
    generator.usePoissonSampling = true;

    const assetsManager = new BABYLON.AssetsManager(scene);
    this.meshesConfig.forEach(config => this.addMeskImportTask(config, assetsManager, scene))

    assetsManager.onFinish = () => {
      Object.keys(this.meshes).forEach(key => {
        generator.addShadowCaster(this.meshes[key])
      })
      const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      console.log(viewportWidth)
      // if(viewportWidth < 1000) {
      //   camera.setTarget(this.meshes['cv'])
      // }
      // camera.radius = 20

      const helper = scene.createDefaultEnvironment({
        skyboxSize: 1500,
        groundShadowLevel: 0.5,
        enableGroundMirror: true,
      });

      helper.setMainColor(new BABYLON.Color3(2.8, 2.8, 2.8));

      scene.environmentTexture.lodGenerationScale = 0.6;

      scene.registerBeforeRender(() => {
        Object.keys(this.meshes).forEach(key => {
          this.meshes[key].rotation.y += 0.003;
        })
      });

      engine.runRenderLoop(() => {
          if (scene) {
              scene.render();
          }
      });
    }
    assetsManager.load()
  }
  render () {
    return (
      <>
        <BabylonScene onSceneMount={this.onSceneMount} adaptToDeviceRatio={true} />
        <a ref={this.linkRefs.cv} className="hidden" target="_blank" rel="noopener noreferrer" href={Resume}>Resume</a>
        <a ref={this.linkRefs.linkedin} className="hidden" target="_blank" rel="noopener noreferrer" href={LINKEDIN_PROFILE_LINK}>Linkedin</a>
        <a ref={this.linkRefs.gmail} className="hidden" href={GMAIL_LINK}>Gmail</a>
        <a ref={this.linkRefs.facebook} className="hidden" target="_blank" rel="noopener noreferrer" href={FACEBOOK_PROFILE_LINK}>Facebook</a>
        <a ref={this.linkRefs.github} className="hidden" target="_blank" rel="noopener noreferrer" href={GITHUB_PROFILE_LINK}>Github</a>
      </>
    )
  }
}

export default Scene
