import * as THREE from 'three';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { COLORS } from '../config.js';
import { animateOperation, clearOverlay } from '../animation/animateOperation.js';
import { generateModel } from '../generators/generateModel.js';
import { generateSymmetryElements } from '../generators/generateSymmetryElements.js';
import { operationPlaneNormal } from '../math/operations.js';
import { disposeObject, resetBallStick } from '../objects/ballStick.js';
import { createInversionCenter } from '../objects/inversionCenter.js';
import { createMirrorPlane } from '../objects/mirrorPlane.js';
import { createCamera } from './camera.js';
import { createControls } from './controls.js';
import { addLights } from './lights.js';

export class PointGroupScene {
  constructor(container) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(COLORS.background);
    this.scene.fog = new THREE.Fog(COLORS.background, 7, 14);

    const { width, height } = this.container.getBoundingClientRect();
    this.camera = createCamera(width || 1, height || 1);
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width || 1, height || 1, false);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.container.append(this.renderer.domElement);

    this.labelRenderer = new CSS2DRenderer();
    this.labelRenderer.setSize(width || 1, height || 1);
    this.labelRenderer.domElement.className = 'label-layer';
    this.container.append(this.labelRenderer.domElement);

    this.controls = createControls(this.camera, this.renderer.domElement);

    this.modelSlot = new THREE.Group();
    this.elementSlot = new THREE.Group();
    this.activeCueSlot = new THREE.Group();
    this.overlaySlot = new THREE.Group();
    this.scene.add(this.modelSlot, this.elementSlot, this.activeCueSlot, this.overlaySlot);

    addLights(this.scene);
    this.addReferenceGrid();

    this.toggles = {
      model: true,
      axes: true,
      mirrors: true,
      inversion: true,
      trajectories: true,
      labels: true,
    };
    this.animationSpeed = 0.6;

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(this.container);
    this.animate = this.animate.bind(this);
    this.frame = requestAnimationFrame(this.animate);
  }

  setPointGroup(pointGroup) {
    if (!pointGroup) {
      this.clearPointGroup();
      return;
    }

    this.pointGroup = pointGroup;
    this.clearSlot(this.modelSlot);
    this.clearSlot(this.elementSlot);
    this.clearSlot(this.activeCueSlot);
    clearOverlay(this.overlaySlot);
    this.clearLabelDom();

    this.model = generateModel(pointGroup);
    this.elements = generateSymmetryElements(pointGroup);
    this.modelSlot.add(this.model);
    this.elementSlot.add(this.elements);
    this.applyToggles();
  }

  clearPointGroup() {
    this.pointGroup = null;
    this.model = null;
    this.elements = null;
    this.clearSlot(this.modelSlot);
    this.clearSlot(this.elementSlot);
    this.clearSlot(this.activeCueSlot);
    clearOverlay(this.overlaySlot);
    this.clearLabelDom();
  }

  async runOperation(operation) {
    if (!operation || !this.model) return;
    this.showActiveCue(operation);
    await animateOperation(this.model, operation, this.overlaySlot, { duration: this.operationDuration(operation) });
    this.applyToggles();
  }

  resetView() {
    this.camera.position.set(4.8, 3.7, 5.2);
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  resetModel() {
    if (this.model) resetBallStick(this.model);
    clearOverlay(this.overlaySlot);
    this.clearSlot(this.activeCueSlot);
  }

  setToggles(toggles) {
    this.toggles = { ...this.toggles, ...toggles };
    this.applyToggles();
  }

  setAnimationSpeed(speed) {
    this.animationSpeed = Math.max(0.25, Math.min(Number(speed) || 0.6, 1.5));
  }

  operationDuration(operation) {
    const baseDuration = 1450;
    let multiplier = 1;

    if (operation.type === 'rotation' || operation.type === 'improper' || operation.type === 'rotationInversion') {
      const power = Math.abs(operation.k ?? 1);
      multiplier += Math.max(0, power - 1) * 0.38;
    }

    if (operation.type === 'improper') multiplier += 0.45;
    if (operation.type === 'rotationInversion') multiplier += 0.28;

    return (baseDuration * multiplier) / this.animationSpeed;
  }

  applyToggles() {
    this.modelSlot.visible = this.toggles.model;
    this.overlaySlot.visible = this.toggles.trajectories;

    const setVisibility = (object) => {
      if (object.userData.kind === 'symmetryAxis') object.visible = this.toggles.axes;
      if (object.userData.kind === 'mirrorPlane') object.visible = this.toggles.mirrors;
      if (object.userData.kind === 'inversionCenter') object.visible = this.toggles.inversion;
      if (object.userData.kind === 'label') object.visible = this.toggles.labels;
    };
    this.elementSlot.traverse(setVisibility);
    this.activeCueSlot.traverse(setVisibility);
  }

  showActiveCue(operation) {
    this.clearSlot(this.activeCueSlot);
    if (operation.type === 'identity') return;

    if (['reflectionHorizontal', 'reflectionVertical', 'reflectionPlane', 'improper'].includes(operation.type)) {
      const normal = operationPlaneNormal(operation);
      if (normal) {
        this.activeCueSlot.add(createMirrorPlane({
          normal,
          label: '',
          color: operation.type === 'improper' ? COLORS.mirrorAlt : COLORS.mirror,
          opacity: 0.28,
        }));
      }
    }

    if (operation.type === 'inversion' || operation.type === 'rotationInversion') {
      this.activeCueSlot.add(createInversionCenter(''));
    }

    this.applyToggles();
  }

  addReferenceGrid() {
    const grid = new THREE.GridHelper(5.2, 16, COLORS.gridCenter, COLORS.grid);
    grid.position.z = -1.34;
    grid.rotation.x = Math.PI / 2;
    grid.material.transparent = true;
    grid.material.opacity = 0.34;
    this.scene.add(grid);
  }

  clearSlot(slot) {
    while (slot.children.length > 0) {
      const child = slot.children[0];
      slot.remove(child);
      disposeObject(child);
    }
  }

  clearLabelDom() {
    this.labelRenderer.domElement.replaceChildren();
  }

  resize() {
    const rect = this.container.getBoundingClientRect();
    const width = Math.max(rect.width, 1);
    const height = Math.max(rect.height, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
    this.labelRenderer.setSize(width, height);
  }

  animate() {
    this.frame = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    this.labelRenderer.render(this.scene, this.camera);
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver.disconnect();
    this.clearSlot(this.modelSlot);
    this.clearSlot(this.elementSlot);
    this.clearSlot(this.activeCueSlot);
    clearOverlay(this.overlaySlot);
    this.controls.dispose();
    this.renderer.dispose();
    this.container.replaceChildren();
  }
}
