import './styles/main.css';
import { crystalSystems, getCrystalSystem } from './data/crystalSystems.js';
import { getPointGroup, pointGroups } from './data/pointGroups.js';
import { PointGroupScene } from './scene/PointGroupScene.js';

const root = document.getElementById('app');

const state = {
  view: 'home',
  selectedSystem: null,
  selectedGroup: null,
  activeOperation: null,
  animationSpeed: 0.6,
  toggles: {
    model: true,
    axes: true,
    mirrors: true,
    inversion: true,
    trajectories: true,
    labels: true,
  },
};

let sceneController = null;

render();

root.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target) return;

  const { action } = target.dataset;

  if (action === 'home') {
    goHome();
  }

  if (action === 'system') {
    selectSystem(target.dataset.system);
  }

  if (action === 'group') {
    selectGroup(target.dataset.group);
  }

  if (action === 'operation') {
    runOperation(target.dataset.operation);
  }

  if (action === 'reset-view') {
    sceneController?.resetView();
  }

  if (action === 'reset-model') {
    sceneController?.resetModel();
  }

  if (action === 'back') {
    selectSystem(state.selectedSystem);
  }
});

root.addEventListener('change', (event) => {
  const target = event.target.closest('[data-toggle]');
  if (!target) return;

  const key = target.dataset.toggle;
  state.toggles[key] = target.checked;
  sceneController?.setToggles(state.toggles);
});

root.addEventListener('input', (event) => {
  const target = event.target.closest('[data-speed]');
  if (!target) return;

  state.animationSpeed = Number(target.value);
  sceneController?.setAnimationSpeed(state.animationSpeed);
  const value = document.getElementById('speedValue');
  if (value) value.textContent = `${state.animationSpeed.toFixed(2)}x`;
});

function goHome() {
  state.view = 'home';
  state.selectedSystem = null;
  state.selectedGroup = null;
  state.activeOperation = null;
  render();
}

function selectSystem(systemKey) {
  state.view = 'system';
  state.selectedSystem = systemKey;
  state.selectedGroup = null;
  state.activeOperation = null;
  render();
}

function selectGroup(groupKey) {
  const group = getPointGroup(groupKey);
  state.view = 'viewer';
  state.selectedSystem = group.crystalSystem;
  state.selectedGroup = groupKey;
  state.activeOperation = null;
  render();
}

function runOperation(operationName) {
  const group = getPointGroup(state.selectedGroup);
  const operation = group.operations.find((item) => item.name === operationName);
  state.activeOperation = operation;
  renderControlPanel();
  sceneController?.runOperation(operation);
}

function render() {
  if (state.view !== 'viewer') {
    destroyScene();
  }

  if (state.view === 'home') {
    root.innerHTML = renderHome();
    return;
  }

  if (state.view === 'system') {
    root.innerHTML = renderSystemPage(state.selectedSystem);
    return;
  }

  root.innerHTML = renderViewerPage();
  mountScene();
  renderControlPanel();
}

function renderHome() {
  return `
    <main class="home-page">
      <section class="home-hero">
        <h1>晶体点群可视化</h1>
        <p>请选择下方晶系，进入对应点群的三维球棍模型与对称操作页面。</p>
      </section>
      <section class="home-card-grid" aria-label="晶系选择">
        ${crystalSystems.map((system) => {
          const count = groupsForSystem(system.key).length;
          return `
            <button class="home-card" type="button" data-action="system" data-system="${system.key}">
              <strong>${system.zh}</strong>
              <span>${system.label}</span>
              <em>${count} 个点群</em>
            </button>
          `;
        }).join('')}
      </section>
    </main>
  `;
}

function renderSystemPage(systemKey) {
  const system = getCrystalSystem(systemKey);
  const groups = groupsForSystem(systemKey);

  return `
    <main class="menu-page">
      <nav class="page-nav">
        <button type="button" data-action="home">返回主页</button>
      </nav>
      <section class="home-hero compact">
        <h1>${system.zh}晶系</h1>
        <p>${system.label}，请选择具体点群。</p>
      </section>
      <section class="group-card-grid" aria-label="${system.zh}点群">
        ${groups.map((group) => `
          <button class="group-card" type="button" data-action="group" data-group="${group.key}">
            <strong>${group.schoenflies}</strong>
            <span>${group.hermannMauguin}</span>
          </button>
        `).join('')}
      </section>
    </main>
  `;
}

function renderViewerPage() {
  return `
    <main class="viewer-page">
      <aside id="controlPanel" class="control-panel"></aside>
      <section class="scene-shell">
        <div id="sceneRoot" class="scene-canvas"></div>
      </section>
    </main>
  `;
}

function renderControlPanel() {
  const panel = document.getElementById('controlPanel');
  if (!panel) return;

  const group = getPointGroup(state.selectedGroup);
  const system = getCrystalSystem(group.crystalSystem);
  const groups = groupsForSystem(group.crystalSystem);

  panel.innerHTML = `
    <section class="panel-section header-section">
      <div class="eyebrow">Crystal point group viewer</div>
      <h1>${group.schoenflies}</h1>
      <div class="symbol-row">
        <span>${system.label}</span>
        <strong>${group.hermannMauguin}</strong>
      </div>
    </section>

    <section class="panel-section">
      <div class="breadcrumb-row">
        <button type="button" class="text-button" data-action="back">返回</button>
        <button type="button" class="text-button" data-action="reset-view">重置视角</button>
        <button type="button" class="text-button" data-action="reset-model">重置模型</button>
      </div>
      <div class="section-title compact-title">当前晶系点群</div>
      <div class="point-group-grid compact">
        ${groups.map((item) => `
          <button
            type="button"
            class="${item.key === group.key ? 'is-active' : ''}"
            data-action="group"
            data-group="${item.key}"
          >
            <strong>${item.schoenflies}</strong>
            <span>${item.hermannMauguin}</span>
          </button>
        `).join('')}
      </div>
    </section>

    <section class="panel-section facts-grid">
      ${fact('Schoenflies', group.schoenflies)}
      ${fact('Hermann-Mauguin', group.hermannMauguin)}
      ${fact('晶系', system.zh)}
      ${fact('操作数', group.operations.length)}
    </section>

    <section class="panel-section">
      <div class="section-title">对称元素</div>
      <div class="element-list">
        ${group.symmetryElements.map((element) => `<span>${element}</span>`).join('')}
      </div>
    </section>

    <section class="panel-section">
      <div class="section-title operation-title">
        <span>对称操作</span>
        <strong>${state.activeOperation?.name ?? 'E'}</strong>
      </div>
      <div class="operation-grid">
        ${group.operations.map((operation) => `
          <button
            type="button"
            class="${state.activeOperation?.name === operation.name ? 'is-active' : ''}"
            data-action="operation"
            data-operation="${operation.name}"
          >
            ${operation.name}
          </button>
        `).join('')}
      </div>
    </section>

    <section class="panel-section">
      <div class="section-title">
        <span>动画速度</span>
        <strong id="speedValue">${state.animationSpeed.toFixed(2)}x</strong>
      </div>
      <input
        class="speed-slider"
        type="range"
        min="0.25"
        max="1.50"
        step="0.05"
        value="${state.animationSpeed}"
        data-speed="animation"
        aria-label="动画速度"
      >
    </section>

    <section class="panel-section">
      <div class="section-title">显示开关</div>
      <div class="toggle-grid">
        ${toggle('model', '球棍模型')}
        ${toggle('axes', '对称轴')}
        ${toggle('mirrors', '镜面')}
        ${toggle('inversion', '反演中心')}
        ${toggle('trajectories', '操作轨迹')}
        ${toggle('labels', '标签')}
      </div>
    </section>
  `;
}

function mountScene() {
  const container = document.getElementById('sceneRoot');
  if (!container) return;

  destroyScene();
  sceneController = new PointGroupScene(container);
  sceneController.setPointGroup(getPointGroup(state.selectedGroup));
  sceneController.setToggles(state.toggles);
  sceneController.setAnimationSpeed(state.animationSpeed);
  sceneController.resetView();
}

function destroyScene() {
  sceneController?.dispose();
  sceneController = null;
}

function groupsForSystem(systemKey) {
  return pointGroups.filter((group) => group.crystalSystem === systemKey);
}

function fact(label, value) {
  return `
    <div class="fact-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function toggle(key, label) {
  return `
    <label class="toggle-row">
      <input type="checkbox" data-toggle="${key}" ${state.toggles[key] ? 'checked' : ''}>
      <span>${label}</span>
    </label>
  `;
}
