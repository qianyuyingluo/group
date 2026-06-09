# Three.js 晶体点群可视化项目开发指导文档

## 1. 项目目标

开发一个基于 Three.js 的三维交互式晶体点群可视化工具，用于展示 32 个晶体学点群的典型球棍结构、对称轴、镜面、反演中心、旋转反映轴以及对应的对称操作动画。

项目重点不是做真实分子数据库，而是做“点群教学可视化工具”。每个点群只需要使用一个具有该点群对称性的典型几何模型来表达其对称性。

最终效果应包括：

1. 左侧或中央显示 Three.js 三维场景。
2. 用户可以旋转、缩放、平移观察模型。
3. 用户可以从列表中选择点群。
4. 显示该点群的 Schoenflies 符号和 Hermann-Mauguin 符号。
5. 显示该点群所属晶系。
6. 显示对应的对称元素。
7. 提供操作按钮，例如 E、C3、C3²、σv、i、S4 等。
8. 点击操作按钮后，模型执行对应的对称操作动画。
9. 可开关显示：
   - 球棍模型
   - 对称轴
   - 镜面
   - 反演中心
   - 操作轨迹
   - 标签文字

---

## 2. 技术栈要求

使用：

txt Vite Three.js JavaScript 或 TypeScript CSS OrbitControls CSS2DRenderer 或 CSS3DRenderer lil-gui 可选 

推荐使用 TypeScript，但如果项目当前已经是 JavaScript，则保持 JavaScript，不要强行重构。

---

## 3. 推荐项目结构

请按照如下结构组织代码：

txt point-group-viewer/ ├─ index.html ├─ package.json ├─ vite.config.js ├─ src/ │  ├─ main.js │  ├─ scene/ │  │  ├─ initScene.js │  │  ├─ camera.js │  │  ├─ lights.js │  │  └─ controls.js │  ├─ data/ │  │  ├─ pointGroups.js │  │  ├─ crystalSystems.js │  │  └─ operationNames.js │  ├─ math/ │  │  ├─ operations.js │  │  ├─ matrices.js │  │  └─ vectors.js │  ├─ objects/ │  │  ├─ atom.js │  │  ├─ bond.js │  │  ├─ ballStick.js │  │  ├─ symmetryAxis.js │  │  ├─ mirrorPlane.js │  │  ├─ inversionCenter.js │  │  └─ labels.js │  ├─ generators/ │  │  ├─ generateCn.js │  │  ├─ generateCnv.js │  │  ├─ generateCnh.js │  │  ├─ generateDn.js │  │  ├─ generateDnh.js │  │  ├─ generateDnd.js │  │  ├─ generateTetrahedral.js │  │  └─ generateCubic.js │  ├─ animation/ │  │  ├─ animateRotation.js │  │  ├─ animateReflection.js │  │  ├─ animateInversion.js │  │  └─ animateOperation.js │  ├─ ui/ │  │  ├─ panel.js │  │  ├─ groupSelector.js │  │  └─ operationButtons.js │  └─ styles/ │     └─ main.css 

---

## 4. 数据驱动原则

不要把 32 个点群分别写死成 32 套独立代码。

必须使用数据驱动结构：

js const pointGroups = {   C3v: {     crystalSystem: "Trigonal",     schoenflies: "C3v",     hermannMauguin: "3m",     family: "Cnv",     n: 3,     model: "trigonalPyramid",     symmetryElements: [       { type: "axis", name: "C3", n: 3, direction: [0, 0, 1] },       { type: "mirrorVertical", name: "σv", count: 3 }     ],     operations: [       { name: "E", type: "identity" },       { name: "C3", type: "rotation", n: 3, k: 1, axis: [0, 0, 1] },       { name: "C3²", type: "rotation", n: 3, k: 2, axis: [0, 0, 1] },       { name: "σv1", type: "reflectionVertical", angle: 0 },       { name: "σv2", type: "reflectionVertical", angle: 120 },       { name: "σv3", type: "reflectionVertical", angle: 240 }     ]   } }; 

点群数据只负责描述“有什么”，不要负责 Three.js 具体绘制细节。绘制逻辑应由 generator 和 object 函数完成。

---

## 5. 需要支持的 32 个晶体点群

请按照晶系分类实现：

### 5.1 Triclinic

txt C1    → 1 Ci    → -1 

### 5.2 Monoclinic

txt Cs    → m C2    → 2 C2h   → 2/m 

### 5.3 Orthorhombic

txt C2v   → mm2 D2    → 222 D2h   → mmm 

### 5.4 Tetragonal

txt C4    → 4 S4    → -4 C4h   → 4/m D2d   → -42m C4v   → 4mm D4    → 422 D4h   → 4/mmm 

### 5.5 Trigonal / Rhombohedral

txt C3    → 3 C3i   → -3 C3v   → 3m D3    → 32 D3d   → -3m 

### 5.6 Hexagonal

txt C3h   → -6 C6    → 6 C6h   → 6/m D3h   → -62m C6v   → 6mm D6    → 622 D6h   → 6/mmm 

### 5.7 Cubic

txt T     → 23 Th    → m-3 O     → 432 Td    → -43m Oh    → m-3m 

注意：晶体学 32 点群不包含 Icosahedral group I，因为五重对称不允许出现在三维周期晶体中。不要把 I、Ih 加入 32 晶体点群列表。

---

## 6. 基础对称操作函数

请在 src/math/operations.js 中实现基础操作。

### 6.1 恒等操作

js function identityMatrix() {   return new THREE.Matrix4().identity(); } 

### 6.2 绕任意轴旋转

实现绕任意单位向量 axis 旋转角度 theta 的矩阵。

js function rotationMatrix(axis, theta) {   const q = new THREE.Quaternion();   q.setFromAxisAngle(axis.clone().normalize(), theta);    const m = new THREE.Matrix4();   m.makeRotationFromQuaternion(q);    return m; } 

### 6.3 Cn 操作

js function Cn(axis, n, k = 1) {   const theta = 2 * Math.PI * k / n;   return rotationMatrix(axis, theta); } 

### 6.4 反演操作

js function inversionMatrix() {   return new THREE.Matrix4().set(     -1,  0,  0, 0,      0, -1,  0, 0,      0,  0, -1, 0,      0,  0,  0, 1   ); } 

### 6.5 镜面反射

镜面对称可以用平面法向量 normal 表示。

对于单位法向量 n = (nx, ny, nz)，反射矩阵为：

txt R = I - 2 n n^T 

实现：

js function reflectionMatrix(normal) {   const n = normal.clone().normalize();   const x = n.x;   const y = n.y;   const z = n.z;    return new THREE.Matrix4().set(     1 - 2*x*x,   -2*x*y,     -2*x*z,     0,       -2*y*x, 1 - 2*y*y,     -2*y*z,     0,       -2*z*x,   -2*z*y,   1 - 2*z*z,    0,        0,        0,          0,          1   ); } 

### 6.6 水平镜面 σh

默认主轴为 z 轴时，水平镜面为 xy 平面：

js const sigmaH = reflectionMatrix(new THREE.Vector3(0, 0, 1)); 

### 6.7 垂直镜面 σv

垂直镜面包含 z 轴。可以用方位角 phi 定义镜面方向。

若镜面方向为：

txt d = (cos phi, sin phi, 0) 

则镜面法向量为：

txt n = (-sin phi, cos phi, 0) 

实现：

js function verticalMirrorMatrix(phi) {   const normal = new THREE.Vector3(     -Math.sin(phi),      Math.cos(phi),      0   );   return reflectionMatrix(normal); } 

### 6.8 旋转反映 Sn

Sn 表示先绕主轴旋转 360°/n，再对垂直于主轴的水平镜面反射。

js function Sn(axis, n, k = 1) {   const rotation = Cn(axis, n, k);   const mirror = reflectionMatrix(axis);   return mirror.multiply(rotation); } 

---

## 7. 球棍模型生成规则

### 7.1 原子

在 objects/atom.js 中写：

js function createAtom(position, radius, color, name) {   const geometry = new THREE.SphereGeometry(radius, 32, 16);   const material = new THREE.MeshStandardMaterial({     color,     roughness: 0.4,     metalness: 0.05   });    const atom = new THREE.Mesh(geometry, material);   atom.position.copy(position);   atom.userData.name = name || "atom";    return atom; } 

### 7.2 化学键

在 objects/bond.js 中写：

js function createBond(start, end, radius, color) {   const direction = new THREE.Vector3().subVectors(end, start);   const length = direction.length();    const geometry = new THREE.CylinderGeometry(radius, radius, length, 24);   const material = new THREE.MeshStandardMaterial({     color,     roughness: 0.5   });    const bond = new THREE.Mesh(geometry, material);    const midpoint = new THREE.Vector3()     .addVectors(start, end)     .multiplyScalar(0.5);    bond.position.copy(midpoint);    bond.quaternion.setFromUnitVectors(     new THREE.Vector3(0, 1, 0),     direction.clone().normalize()   );    return bond; } 

### 7.3 通用环形模型

用于 Cn、Cnh、Cnv、Dn、Dnh、Dnd。

js function createRegularPolygonPoints(n, radius, z = 0, phase = 0) {   const points = [];    for (let i = 0; i < n; i++) {     const theta = phase + 2 * Math.PI * i / n;     points.push(new THREE.Vector3(       radius * Math.cos(theta),       radius * Math.sin(theta),       z     ));   }    return points; } 

---

## 8. 各类点群的模型生成策略

### 8.1 C1

使用完全不对称的四原子球棍模型，不显示任何非平凡对称元素。

### 8.2 Ci

使用一组关于原点反演对称的原子对。显示反演中心 i。

### 8.3 Cs

使用一个完全位于某镜面两侧对称的模型。显示一个镜面 σ。

### 8.4 Cn

使用一个围绕 z 轴的 n 边形结构，并稍微加入中心原子或上下原子，使主轴清晰。显示 Cn 主轴。

### 8.5 Cnv

使用 n 角锥结构：

txt 顶部一个中心原子 底部 n 个等价原子组成正 n 边形 z 轴为 Cn 主轴 有 n 个竖直镜面 σv 

典型例子：

txt C3v → 三角锥 C4v → 四角锥 C6v → 六角锥 

### 8.6 Cnh

使用平面正 n 边形结构，并显示水平镜面 σh。

包含：

txt Cn 主轴 σh 水平镜面 如果有反演中心，则显示 i 

### 8.7 Sn

例如 S4，显示一个四重旋转反映轴。模型可以使用上下错位的四原子结构，强调先旋转再反射后重合。

### 8.8 Dn

使用上下两个正 n 边形结构，或者一个正 n 边形加上若干副 C2 轴。

包含：

txt 主 Cn 轴 n 个垂直于主轴的 C2 副轴 

### 8.9 Dnh

在 Dn 基础上增加水平镜面 σh，适合画成上下对称的双层 n 边形。

### 8.10 Dnd

使用上下错位的双层 n 边形。显示：

txt 主 Cn 轴 n 个 C2 副轴 n 个 σd 对角镜面 

### 8.11 T、Td、Th

使用正四面体模型。

txt T  → 只显示旋转轴 Td → 显示四面体镜面 Th → 显示反演相关元素 

### 8.12 O、Oh

使用正八面体或立方体模型。

txt O  → 立方体/八面体旋转群 Oh → 在 O 基础上增加镜面和反演中心 

---

## 9. 对称元素可视化

### 9.1 对称轴

使用细圆柱或 ArrowHelper。

要求：

txt C2 轴：短轴 C3 轴：中等长度轴 C4/C6 轴：主轴加标签 

标签示例：

txt C3 C4 C6 C2' 

### 9.2 镜面

使用半透明 PlaneGeometry。

要求：

js const material = new THREE.MeshBasicMaterial({   color: 0x66ccff,   transparent: true,   opacity: 0.18,   side: THREE.DoubleSide,   depthWrite: false }); 

### 9.3 反演中心

用一个小球或发光点表示，标签为：

txt i 

### 9.4 旋转反映轴

用虚线轴或特殊颜色轴表示，标签为：

txt S4 S6 

---

## 10. 操作动画要求

每个点群的操作按钮应来自 operations 数据，不要手写 UI。

例如：

js operations: [   { name: "E", type: "identity" },   { name: "C3", type: "rotation", n: 3, k: 1, axis: [0, 0, 1] },   { name: "σv1", type: "reflectionVertical", angle: 0 } ] 

### 10.1 旋转动画

绕指定轴旋转指定角度。

js function animateRotation(object, axis, angle, duration = 800) {   const startTime = performance.now();   const startQuat = object.quaternion.clone();    const deltaQuat = new THREE.Quaternion()     .setFromAxisAngle(axis.clone().normalize(), angle);    const endQuat = startQuat.clone().premultiply(deltaQuat);    function step(now) {     const t = Math.min((now - startTime) / duration, 1);     object.quaternion.slerpQuaternions(startQuat, endQuat, t);      if (t < 1) {       requestAnimationFrame(step);     }   }    requestAnimationFrame(step); } 

### 10.2 镜面动画

镜面反射不适合直接连续插值，因为反射会改变手性。建议动画方式：

txt 1. 显示镜面高亮 2. 显示原模型半透明 ghost 3. 显示反射后的目标位置 4. 用粒子或虚线连接对应原子 5. 最后将模型切换到反射后状态 

### 10.3 反演动画

反演操作：

txt 1. 显示反演中心 2. 原子沿穿过中心的直线移动到反向位置 3. 显示原位置 ghost 

### 10.4 Sn 动画

旋转反映操作：

txt 1. 先播放 Cn 旋转 2. 再播放 σh 镜面反射 3. 最后显示变换后的重合结果 

---

## 11. UI 要求

右侧面板应包含：

txt 点群选择 晶系 Schoenflies 符号 Hermann-Mauguin 符号 对称元素列表 对称操作按钮 显示开关 重置视角按钮 重置模型按钮 

示例：

txt Point Group: C3v  Crystal System: Trigonal / Rhombohedral  Symbols: Schoenflies: C3v Hermann-Mauguin: 3m  Symmetry Elements: E 2C3 3σv  Operations: [E] [C3] [C3²] [σv1] [σv2] [σv3] 

---

## 12. 第一阶段必须优先完成的点群

不要一开始就做完 32 个。先完成以下 8 个作为基础模板：

txt C1 Ci Cs C2 C2v C3v C4v D3d 

这 8 个完成后，再扩展剩下的点群。

原因：

txt C1  → 无对称性模板 Ci  → 反演模板 Cs  → 镜面模板 C2  → 旋转轴模板 C2v → 多镜面模板 C3v → n 重轴 + n 个竖直镜面模板 C4v → Cnv 通用模板验证 D3d → Dnd / 反演 / 多 C2 副轴模板 

---

## 13. 第二阶段扩展顺序

完成第一阶段后，按这个顺序扩展：

txt 1. C3, C4, C6 2. C2h, C3h, C4h, C6h 3. S4 4. D2, D3, D4, D6 5. D2h, D3h, D4h, D6h 6. D2d, D3d 7. T, Td, Th 8. O, Oh 

---

## 14. 样式要求

整体风格要求：

txt 深色背景 浅色网格 球棍模型颜色区分明显 对称轴使用醒目颜色 镜面半透明 标签清晰 按钮简洁 不要堆太多文字 

Three.js 场景建议：

js scene.background = new THREE.Color(0x111111); 

灯光建议：

js AmbientLight DirectionalLight PointLight 

必须加入：

txt OrbitControls 坐标辅助轴可选 网格辅助线可选 

---

## 15. 代码质量要求

1. 不要把所有代码写进 main.js。
2. 每个功能模块独立成文件。
3. 点群数据和渲染逻辑分离。
4. 对称操作矩阵和动画逻辑分离。
5. 所有 generator 函数返回 THREE.Group。
6. 切换点群时，应先清理旧 group，再添加新 group。
7. 所有对象应设置合理的 userData，方便调试。
8. 不要使用魔法数字，半径、高度、颜色等放入配置。
9. 需要写必要注释，尤其是对称操作矩阵部分。
10. 不要引入过重依赖。

---

## 16. 最小可运行版本要求

先实现一个可运行 MVP：

txt Vite 启动成功 Three.js 场景正常显示 OrbitControls 正常 C3v 球棍模型正常 C3 主轴正常 3 个 σv 镜面正常 右侧按钮可以切换 E、C3、C3²、σv1、σv2、σv3 点击 C3 时模型旋转 120° 点击 σv 时高亮对应镜面并显示镜像 ghost 

MVP 完成后再扩展其它点群。

---

## 17. 验收标准

项目完成后，至少满足以下标准：

1. 可以通过 npm install 和 npm run dev 启动。
2. 页面无控制台报错。
3. 至少实现 32 个晶体点群的数据。
4. 至少 8 个核心点群有完整可视化模型。
5. 所有点群都能显示基本信息。
6. 所有点群都能显示对应操作按钮。
7. Cn、Cnv、Cnh、Dn、Dnh、Dnd 系列应由通用函数生成。
8. C3v、D3d、Oh 等典型点群展示效果正确。
9. 用户可以重置视角和重置模型状态。
10. 代码结构清晰，方便继续扩展。

---

## 18. 不要做的事情

1. 不要把 32 个点群全部写成 32 个静态 3D 文件。
2. 不要使用真实分子数据库作为核心逻辑。
3. 不要把对称操作只写成文字说明。
4. 不要省略动画系统。
5. 不要把所有逻辑堆进一个文件。
6. 不要加入 icosahedral group I 到 32 晶体点群中。
7. 不要为了视觉效果牺牲对称性正确性。
8. 不要一开始就追求全部点群完整动画，先完成 MVP。

---

## 19. 最终目标

最终项目应该像一个“交互式点群教材”：

txt 选择点群 → 看到典型球棍结构 → 看到对称轴、镜面、反演中心 → 点击操作按钮 → 观看该点群的对称操作 → 理解该点群为什么属于对应晶系和符号 

该项目后续可以继续扩展为：

txt 晶体学 32 点群教学网站 分子点群教学网站 群论可视化工具 固体物理课程辅助工具 材料科学交互式课件 