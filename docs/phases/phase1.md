# Phase 1: Frontal Hair-State Manipulation (VLA Benchmark Specification)

## English

## 1. Phase Objective

Phase 1 evaluates whether a vision-language-action (VLA) model can perform **language-conditioned primitive manipulation of hair states** within a constrained frontal region.

Formally, this phase assesses the ability of a policy
\[
\pi(a_t \mid o_t, \ell)
\]
to transform an initial hair state \(s_0\) into a target state \(s^*\) through **short-horizon, single-tool interactions**, where the transformation is specified implicitly by a natural language instruction \(\ell\).

Phase 1 intentionally excludes:
- structured partitioning (e.g., precise parting),
- multi-step workflows,
- multi-agent or multi-tool coordination.

Instead, it focuses on **minimal state transitions** that constitute necessary preconditions for higher-level haircutting operations.

## 2. Unified Representation and Notation

### 2.1 Hair Representation

The frontal hair region is discretized into a set of patches:
\[
\mathcal{P} = \{1, 2, \dots, N\}
\]

Each patch \(i \in \mathcal{P}\) is associated with:

- Direction vector:
\[
v_i \in \mathbb{R}^2
\]

- Orientation angle:
\[
\theta_i = \arctan2(v_i)
\]

- Visibility indicator:
\[
o_i \in \{0,1\}
\]
where \(o_i = 1\) indicates that the underlying surface is visible at patch \(i\).

### 2.2 Region Definitions

- Target region (ROI):
\[
\mathcal{R} \subseteq \mathcal{P}
\]

- Base (underlying) region:
\[
\mathcal{R}_{base} \subseteq \mathcal{P}
\]

### 2.3 Derived Quantities

#### Directional Alignment
\[
A(\mathcal{R}, v^*) = \frac{1}{|\mathcal{R}|} \sum_{i \in \mathcal{R}} \frac{1 + \cos(v_i, v^*)}{2}
\]

#### Directional Variance (Disorder)
\[
\sigma_\theta(\mathcal{R}) = \text{Var}\left( \{\theta_i \mid i \in \mathcal{R}\} \right)
\]

#### Exposure Ratio
\[
E(\mathcal{R}) = \frac{1}{|\mathcal{R}|} \sum_{i \in \mathcal{R}} o_i
\]

#### Isolation Score
\[
I(\mathcal{R}) = 1 - \frac{\text{overlap}(\mathcal{R}, \mathcal{R}_{env})}{|\mathcal{R}|}
\]

#### Gap Width and Continuity

- Minimum gap width:
\[
w_{min}
\]

- Normalized gap length:
\[
\ell \in [0,1]
\]

## 3. Common Task Interface (VLA Standard)

Each task is defined as a tuple:
\[
\mathcal{T} = (\mathcal{L}, \mathcal{O}, \mathcal{A}, \mathcal{I}, \mathcal{M})
\]

### 3.1 Language Space \(\mathcal{L}\)

A set of natural language instructions specifying:
- region of interest,
- desired transformation (e.g., align, expose, separate).

### 3.2 Observation Space \(\mathcal{O}\)

At time step \(t\):
\[
o_t = (I_t^{rgb}, I_t^{wrist}, q_t)
\]
where:
- \(I_t^{rgb}\): frontal RGB image
- \(I_t^{wrist}\): optional wrist camera
- \(q_t\): proprioceptive state

### 3.3 Action Space \(\mathcal{A}\)
\[
a_t = (\Delta x, \Delta y, \Delta z, \Delta r_x, \Delta r_y, \Delta r_z)
\]
End-effector Cartesian displacement.

### 3.4 Initialization \(\mathcal{I}\)

Each episode samples:
- initial hair configuration \(s_0\)
- target region \(\mathcal{R}\)
- optional direction \(v^*\)

### 3.5 Evaluation Metrics \(\mathcal{M}\)

Each task defines:
- Goal score:
\[
S_{goal} \in [0,1]
\]
- Success:
\[
\text{Success} =
\begin{cases}
1 & S_{goal} \ge \tau \\
0 & \text{otherwise}
\end{cases}
\]

## 4. Phase 1 Task Definitions

## Task 1: Local Combing

### Definition
Transform a disordered hair configuration within \(\mathcal{R}\) into a more ordered configuration.

### Goal Metric
\[
S_{goal} = 1 - \frac{\sigma_\theta^{final}(\mathcal{R})}{\sigma_\theta^{init}(\mathcal{R}) + \epsilon}
\]

### Success Condition
\[
\sigma_\theta^{final}(\mathcal{R}) \le \tau_\theta
\]

### Interpretation
Measures the ability to reduce local directional variance.

## Task 2: Directional Combing

### Definition
Align hair directions in \(\mathcal{R}\) with a target direction \(v^*\).

### Goal Metric
\[
S_{goal} = A(\mathcal{R}, v^*)
\]

### Success Condition
\[
A(\mathcal{R}, v^*) \ge \tau_A
\]

### Interpretation
Evaluates directional control conditioned on language input.

## Task 3: ROI Exposure

### Definition
Expose a target region \(\mathcal{R}\) by removing occluding hair.

### Goal Metric
\[
S_{goal} = E(\mathcal{R})
\]

### Success Condition
\[
E(\mathcal{R}) \ge \tau_E
\]

### Interpretation
Measures the ability to make a region visible and accessible.

## Task 4: Local Hair Opening

### Definition
Create a continuous opening within a specified region.

### Goal Metric
\[
S_{goal} = \frac{1}{2} \left( \frac{w_{min}}{w_{max}} + \ell \right)
\]

### Success Condition
\[
w_{min} \ge \tau_w \quad \land \quad \ell \ge \tau_\ell
\]

### Interpretation
Captures local structural separation without explicit region targeting.

## Task 5: Patch Isolation

### Definition
Isolate a subset \(\mathcal{R}\) from surrounding hair.

### Goal Metric
\[
S_{goal} = I(\mathcal{R})
\]

### Success Condition
\[
I(\mathcal{R}) \ge \tau_I
\]

### Interpretation
Measures object-level separation prior to structured partitioning.

## Task 6: Root/Base Exposure

### Definition
Expose the underlying base region \(\mathcal{R}_{base}\) beneath surface hair.

### Goal Metric
\[
S_{goal} = E(\mathcal{R}_{base})
\]

### Success Condition
\[
E(\mathcal{R}_{base}) \ge \tau_{base}
\]

### Interpretation
Evaluates layer-aware manipulation.

## 5. Phase-Level Evaluation

### Primary Metric
\[
\text{Phase1 Success} = \frac{1}{6} \sum_{k=1}^{6} \text{Success}_k
\]

### Secondary Metric
\[
\text{Phase1 Score} = \frac{1}{6} \sum_{k=1}^{6} \mathbb{E}[S_{goal}^{(k)}]
\]

## 6. Design Rationale

Phase 1 defines a **minimal and complete set of primitive hair-state transformations**, including:
- disorder reduction,
- directional alignment,
- visibility control,
- local separation,
- object-level isolation,
- layer exposure.

These primitives are:
1. **Necessary**: each corresponds to a common preparatory operation in haircutting practice.
2. **Orthogonal**: each task captures a distinct transformation type.
3. **Evaluable**: all metrics can be approximated from visual observations in both simulation and real-world settings.
4. **Composable**: they form the basis for higher-level structured tasks in subsequent phases.

---

## 中文

## 1. 阶段目标

Phase 1 用于评估视觉-语言-动作（VLA）模型是否能够在受限的前额区域内，完成**受语言条件驱动的基础头发状态操控**。

形式化地说，本阶段评估策略
\[
\pi(a_t \mid o_t, \ell)
\]
是否能通过**短时程、单工具交互**，将初始头发状态 \(s_0\) 转换到目标状态 \(s^*\)，其中转化目标由自然语言指令 \(\ell\) 隐式给出。

Phase 1 有意不包含：
- 结构化分区（如精确分缝）、
- 多步骤工作流、
- 多主体或多工具协同。

它聚焦于构成高层理发任务前提条件的**最小状态转移能力**。

## 2. 统一表示与符号

### 2.1 头发表示

将前额头发区域离散为 patch 集合：
\[
\mathcal{P} = \{1, 2, \dots, N\}
\]

每个 patch \(i \in \mathcal{P}\) 定义为：

- 方向向量：
\[
v_i \in \mathbb{R}^2
\]

- 朝向角：
\[
\theta_i = \arctan2(v_i)
\]

- 可见性指示：
\[
o_i \in \{0,1\}
\]
其中 \(o_i = 1\) 表示该 patch 处底层区域可见。

### 2.2 区域定义

- 目标区域（ROI）：
\[
\mathcal{R} \subseteq \mathcal{P}
\]

- 底层区域：
\[
\mathcal{R}_{base} \subseteq \mathcal{P}
\]

### 2.3 派生量

#### 方向对齐度
\[
A(\mathcal{R}, v^*) = \frac{1}{|\mathcal{R}|} \sum_{i \in \mathcal{R}} \frac{1 + \cos(v_i, v^*)}{2}
\]

#### 方向方差（无序度）
\[
\sigma_\theta(\mathcal{R}) = \text{Var}\left( \{\theta_i \mid i \in \mathcal{R}\} \right)
\]

#### 暴露率
\[
E(\mathcal{R}) = \frac{1}{|\mathcal{R}|} \sum_{i \in \mathcal{R}} o_i
\]

#### 分离度
\[
I(\mathcal{R}) = 1 - \frac{\text{overlap}(\mathcal{R}, \mathcal{R}_{env})}{|\mathcal{R}|}
\]

#### 开口宽度与连续性

- 最小开口宽度：
\[
w_{min}
\]

- 归一化开口长度：
\[
\ell \in [0,1]
\]

## 3. 通用任务接口（VLA 标准）

每个任务定义为：
\[
\mathcal{T} = (\mathcal{L}, \mathcal{O}, \mathcal{A}, \mathcal{I}, \mathcal{M})
\]

### 3.1 语言空间 \(\mathcal{L}\)

自然语言指令集合，指定：
- 目标区域，
- 目标转化（如对齐、暴露、分离）。

### 3.2 观测空间 \(\mathcal{O}\)

在时刻 \(t\)：
\[
o_t = (I_t^{rgb}, I_t^{wrist}, q_t)
\]
其中：
- \(I_t^{rgb}\)：前视 RGB 图像
- \(I_t^{wrist}\)：可选腕部相机
- \(q_t\)：本体状态

### 3.3 动作空间 \(\mathcal{A}\)
\[
a_t = (\Delta x, \Delta y, \Delta z, \Delta r_x, \Delta r_y, \Delta r_z)
\]
即末端执行器笛卡尔位姿增量。

### 3.4 初始化 \(\mathcal{I}\)

每个 episode 采样：
- 初始头发状态 \(s_0\)
- 目标区域 \(\mathcal{R}\)
- 可选目标方向 \(v^*\)

### 3.5 评测指标 \(\mathcal{M}\)

每个任务定义：
- 目标分数：
\[
S_{goal} \in [0,1]
\]
- 成功判定：
\[
\text{Success} =
\begin{cases}
1 & S_{goal} \ge \tau \\
0 & \text{otherwise}
\end{cases}
\]

## 4. Phase 1 任务定义

## 任务 1：局部梳理

### 定义
将 \(\mathcal{R}\) 内无序头发转化为更有序状态。

### 目标指标
\[
S_{goal} = 1 - \frac{\sigma_\theta^{final}(\mathcal{R})}{\sigma_\theta^{init}(\mathcal{R}) + \epsilon}
\]

### 成功条件
\[
\sigma_\theta^{final}(\mathcal{R}) \le \tau_\theta
\]

### 解释
衡量降低局部方向方差的能力。

## 任务 2：定向梳理

### 定义
将 \(\mathcal{R}\) 内头发方向对齐到 \(v^*\)。

### 目标指标
\[
S_{goal} = A(\mathcal{R}, v^*)
\]

### 成功条件
\[
A(\mathcal{R}, v^*) \ge \tau_A
\]

### 解释
评估语言条件下的方向控制能力。

## 任务 3：ROI 暴露

### 定义
移除遮挡头发，使目标区域 \(\mathcal{R}\) 可见。

### 目标指标
\[
S_{goal} = E(\mathcal{R})
\]

### 成功条件
\[
E(\mathcal{R}) \ge \tau_E
\]

### 解释
衡量使目标区域“可见且可达”的能力。

## 任务 4：局部开口形成

### 定义
在指定区域形成连续开口。

### 目标指标
\[
S_{goal} = \frac{1}{2} \left( \frac{w_{min}}{w_{max}} + \ell \right)
\]

### 成功条件
\[
w_{min} \ge \tau_w \quad \land \quad \ell \ge \tau_\ell
\]

### 解释
衡量不依赖显式 ROI 的局部结构分离能力。

## 任务 5：局部发束分离

### 定义
将子区域 \(\mathcal{R}\) 从周围头发中分离。

### 目标指标
\[
S_{goal} = I(\mathcal{R})
\]

### 成功条件
\[
I(\mathcal{R}) \ge \tau_I
\]

### 解释
衡量结构化分区前的对象级分离能力。

## 任务 6：底层暴露

### 定义
暴露表层头发下方的 \(\mathcal{R}_{base}\)。

### 目标指标
\[
S_{goal} = E(\mathcal{R}_{base})
\]

### 成功条件
\[
E(\mathcal{R}_{base}) \ge \tau_{base}
\]

### 解释
评估分层感知与分层操控能力。

## 5. 阶段级评测

### 主指标
\[
\text{Phase1 Success} = \frac{1}{6} \sum_{k=1}^{6} \text{Success}_k
\]

### 次指标
\[
\text{Phase1 Score} = \frac{1}{6} \sum_{k=1}^{6} \mathbb{E}[S_{goal}^{(k)}]
\]

## 6. 设计理由

Phase 1 覆盖一组**最小且完整**的基础头发状态转化能力：
- 降无序、
- 方向对齐、
- 可见性控制、
- 局部分离、
- 对象级隔离、
- 分层暴露。

这些原语具备：
1. **必要性**：对应真实理发中的常见准备动作；
2. **正交性**：每个任务描述不同类型的状态转化；
3. **可评测性**：可在仿真与现实中由视觉近似评估；
4. **可组合性**：可作为后续阶段结构化任务的基础。
