# Haircutting-VLA Benchmark Overview

---

## 中文版本

### 概述

Haircutting-VLA Benchmark 是一个面向视觉-语言-动作（Vision-Language-Action, VLA）模型的分阶段 benchmark，用于评估机器人在理发相关场景中的语言理解、视觉 grounding、工具使用和操作执行能力。

该 benchmark 不将理发视为单一端到端任务，而是将其分解为一组可复用、可组合的关键技能。这些技能从基础头发状态操控出发，逐步扩展到结构化头发组织、协同与稳定控制、推子执行，以及局部理发工作流。

Haircutting-VLA Benchmark 的目标是评估 VLA 模型是否能够：

1. 理解与理发相关的自然语言指令；
2. 将指令与视觉中的目标区域、发束和工具建立对应关系；
3. 以合适的方式抓取和使用工具；
4. 在逐步增加的任务复杂度下，完成理发相关技能及其组合。

---

### 设计动机

完整理发并不是单一能力，而是由多个相互依赖的操作步骤构成，包括目标区域暴露、分缝、分区、发束控制、区域稳定、工具切换、推子修剪以及结果检查等。如果直接将“完整理发”作为 benchmark 目标，会把多种失败来源压缩到一个终局结果中，导致 benchmark 难以解释、难以复现，也难以用于分析模型到底缺失了哪一类能力。

Haircutting-VLA Benchmark 通过分阶段设计来解决这一问题。每个阶段对应一类理发所需的关键技能，并在当前机器人系统和 VLA 模型能力范围内保持可实现性。这种设计使 benchmark 同时具备以下特点：

- 诊断性：能够明确区分不同类型能力的不足；
- 可扩展性：可以从基础技能逐步扩展到更复杂的工作流；
- 可复现性：每个阶段都可以定义清晰的任务范围和评测标准；
- 面向 VLA：强调语言条件下的视觉理解与动作执行，而非单纯的物理控制。

---

### 设计原则

Haircutting-VLA Benchmark 依据以下四项原则构建。

**技能分解。** benchmark 将理发视为一组可复用技能的组合，而不是单一端到端行为。基础技能在前期阶段中单独评测，后续阶段在其基础上构建更复杂的任务和工作流。

**可实现性优先。** 所有任务——无论是单臂还是双臂——都必须在当前机器人能力下具备可执行性。任务设计优先考虑工具抓取稳定性、操作过程可控性、成功条件清晰性以及评测可复现性。

**面向 VLA 的评测。** benchmark 的核心不只是操作本身，而是语言、视觉和动作之间的统一评测。所有任务均通过自然语言指令定义，并要求模型完成语言 grounding、视觉理解、工具使用和技能执行。

**渐进式技能组合。** 前期阶段关注基础操作原语，后期阶段逐步引入结构化技能、协同技能、推子执行以及 workflow 级别的技能组合，从而形成清晰的能力演进路径。

---

### Benchmark 范围

Haircutting-VLA Benchmark 关注的是理发相关技能，而不是完整的发型艺术控制。它主要覆盖理发过程中的准备与执行步骤，包括：

- 梳理与头发状态控制；
- 分缝、分区与层次组织；
- 发束提拉、保持与区域稳定；
- 推子驱动的局部修剪；
- 多步骤局部理发 workflow。

在初始阶段，benchmark 不以高保真完整发型结果、整头自由造型或真人部署作为主要评测目标，而是优先建立稳定、可解释、可扩展的 VLA benchmark 体系。

---

### Phase 结构

#### [阶段 1：头发状态操控（Hair-State Manipulation）](/docs/phase.html?id=1)

![阶段1概览](/docs/assets/phase1-overview.jpg)

Phase 1 评测最基础的理发操作原语。该阶段任务要求机器人抓取梳子类工具，在语言指令下完成单步、局部、可实现的头发状态改变。

代表性能力包括：

- 局部梳理；
- 定向梳理；
- 暴露目标区域；
- 直线分缝；
- 发束提拉与短时保持；
- 局部工作区整理。

这一阶段的目标是建立最基础的技能原语，验证 VLA 模型是否能够根据简单理发指令完成基础头发操作。

---

#### [阶段 2：头发结构组织（Hair Structuring）](/docs/phase.html?id=2)

阶段 2 评测头发结构化组织能力。与阶段 1 仅改变局部状态不同，该阶段要求机器人形成和维持具有明确几何或层次关系的头发结构。

代表性能力包括：

- 曲线分缝；
- 分层暴露；
- 多 section 组织；
- 结构化区域隔离。

这一阶段的目标是将头发从“可操作状态”进一步组织成“可管理、可修剪的结构化工作区”，为后续推子执行打下基础。

---

#### [阶段 3：协同与稳定控制（Coordination and Stabilization）](/docs/phase.html?id=3)

阶段 3 评测多步骤和协同式头发操作。该阶段要求机器人将前面获得的技能进行时间上的组合，并在执行过程中维持区域结构或发束状态。

代表性能力包括：

- 分缝后维持两侧分离；
- 暴露并继续整理目标区域；
- 一边提拉发束、一边进行局部整理；
- 执行“先A再B”类 grooming 指令。

这一阶段的目标是从单步技能转向协调式子任务，评估模型是否具备完成局部 preparatory workflow 的能力。

---

#### [阶段 4：推子执行（Clipper-Based Execution）](/docs/phase.html?id=4)

阶段 4 引入推子驱动的修剪任务。该阶段的重点从“准备头发”转向“对准备好的区域执行修剪动作”。

代表性能力包括：

- 对准备好的 section 执行一次推子 pass；
- 对指定 patch 进行均匀修剪；
- 沿边界执行局部推子路径；
- 对稳定区域执行修剪。

为了兼顾可实现性，该阶段可以优先采用 clipper proxy，而不是直接要求高保真的发丝级真实切割。该阶段的核心是评估模型是否能够在前面阶段提供的结构和稳定条件下，正确使用推子完成局部修剪。

---

#### [阶段 5：局部理发工作流（Workflow-Level Local Haircutting）](/docs/phase.html?id=5)

阶段 5 评测局部理发工作流。该阶段不再关注单个技能，而是关注机器人是否能够将多个技能按顺序组合成一个局部 haircut workflow。

代表性 workflow 包括：

- 暴露 → 分缝 → 分区 → 稳定 → 推子修剪；
- 隔离 → 提拉 → 修剪 → 检查；
- 局部准备后进行补修与调整。

这一阶段的目标是将前面阶段中的技能原语、结构技能和协同技能真正组合起来，形成接近真实理发逻辑的局部操作流程。

---

### 工具使用

工具使用是 benchmark 的组成部分，而不是附加条件。考虑到多数 VLA 机器人采用夹爪末端，任务默认要求机器人先抓取工具，再执行任务。

为避免 benchmark 演化为通用 grasping benchmark，工具抓取过程会进行标准化设置，例如将工具放置在可达、可抓取的规范位姿中，同时保留“抓取姿态是否适合后续使用”的评测空间。

各阶段工具复杂度逐步增加：

- 阶段 1：单工具抓取与使用，主要为梳子和尖尾梳；
- 阶段 2：在同一工具上实现更多结构化用法；
- 阶段 3：引入工具与手、或双工具的协同使用；
- 阶段 4：引入推子执行；
- 阶段 5：在 workflow 中组合使用梳子与推子等工具。

---

### 技能组合关系

Haircutting-VLA Benchmark 的阶段之间是递进关系，而不是互相替代关系。

- 阶段 1 提供基础操作原语；
- 阶段 2 将这些原语组织成结构化技能；
- 阶段 3 将结构化技能进一步组合为协同子任务；
- 阶段 4 在这些准备好的状态上执行推子修剪；
- 阶段 5 将所有前序能力组合成局部理发 workflow。

因此，后续阶段不是脱离前序阶段的新任务，而是建立在前序技能之上的更高层次能力评测。

---

### 发布策略

Haircutting-VLA Benchmark 计划采用分阶段发布方式。
其中，阶段 1 作为最可实现、最可复现的部分，适合作为 benchmark 的首个正式版本。后续阶段则作为扩展方向，逐步纳入结构化任务、协同任务、推子执行和 workflow 级别任务。

这种发布方式能够确保 benchmark 在每个阶段都具备独立价值，同时保留一条清晰的、通向更真实理发能力评测的扩展路径。

---

## English Version

### Overview

Haircutting-VLA Benchmark is a staged benchmark for vision-language-action (VLA) models, designed to evaluate language understanding, visual grounding, tool use, and manipulation execution in haircutting-related scenarios.

Instead of treating haircutting as a single end-to-end task, the benchmark decomposes it into reusable and composable skills. The progression starts from primitive hair-state manipulation and extends to structured organization, coordination and stabilization, clipper execution, and workflow-level local haircutting.

Haircutting-VLA Benchmark evaluates whether a VLA model can:

1. understand haircutting-related natural language instructions,
2. ground instructions to target regions, hair sections, and tools in vision,
3. grasp and use tools in task-appropriate ways,
4. complete haircutting-related skills and their compositions under increasing task complexity.

---

### Motivation

Full haircutting is not a single capability. It is a dependency chain of operational steps: exposure, parting, sectioning, strand control, stabilization, tool switching, clipper trimming, and result checking.

If "full haircutting" is used as one benchmark endpoint, multiple failure sources collapse into one outcome. This makes the benchmark hard to interpret, hard to reproduce, and weak for diagnosing which capability is missing.

Haircutting-VLA Benchmark solves this with staged design. Each phase isolates a key capability category while remaining feasible under current robot and VLA constraints. This gives the benchmark four properties:

- **Diagnostic**: separates failure modes by capability type.
- **Scalable**: grows from primitives to workflow-level tasks.
- **Reproducible**: each phase has clear scope and evaluation criteria.
- **VLA-centered**: emphasizes language-conditioned perception-action integration, not only low-level control.

---

### Design Principles

The benchmark is built on four principles.

**Skill decomposition.** Haircutting is modeled as composable skills rather than one monolithic behavior. Primitive skills are evaluated early; later phases compose them into harder tasks and workflows.

**Feasibility first.** Every task must be executable with current robot capabilities (single-arm or bimanual). Task design prioritizes stable grasping, controllable execution, clear success criteria, and reproducible evaluation.

**VLA-oriented evaluation.** The benchmark core is unified language-vision-action evaluation. Tasks are defined via natural language and require grounding, visual understanding, tool use, and skill execution.

**Progressive composition.** Early phases focus on operational primitives. Later phases introduce structuring, coordination, clipper execution, and workflow-level composition to form a clear capability progression.

---

### Benchmark Scope

Haircutting-VLA Benchmark targets haircutting-related skills, not full hairstyle artistry control. The scope focuses on preparation and execution steps, including:

- combing and hair-state control,
- parting, sectioning, and layering,
- strand lifting/holding and regional stabilization,
- clipper-based local trimming,
- multi-step local haircut workflows.

In initial releases, the benchmark does **not** prioritize high-fidelity full-head styling, free-form complete hairstyle generation, or direct human deployment. The priority is a stable, interpretable, and extensible VLA benchmark framework.

---

### Phase Structure

#### [Phase 1: Hair-State Manipulation](/docs/phase.html?id=1)

![Phase 1 Overview](/docs/assets/phase1-overview.jpg)

Phase 1 evaluates core operational primitives in haircutting. Tasks require grasping comb-like tools and performing short-horizon, local, feasible state transitions under language instructions.

Representative capabilities:

- local combing,
- directional combing,
- target-region exposure,
- straight parting,
- strand lifting and short-term holding,
- local workspace cleanup.

Goal: establish primitive skill operators and verify whether VLA models can execute basic hair operations from simple instructions.

---

#### [Phase 2: Hair Structuring](/docs/phase.html?id=2)

Phase 2 evaluates structured hair organization. Unlike Phase 1 (local state changes), this phase requires forming and maintaining geometric/hierarchical structures.

Representative capabilities:

- curved parting,
- layered exposure,
- multi-section organization,
- structured region isolation.

Goal: convert hair from an "operable" state to a "manageable, trimmable" structured workspace.

---

#### [Phase 3: Coordination and Stabilization](/docs/phase.html?id=3)

Phase 3 evaluates multi-step and coordinated operations. The model must temporally compose prior skills while maintaining structure or strand states during execution.

Representative capabilities:

- keep both sides separated after parting,
- expose and continue organizing a target area,
- lift strands while performing local organization,
- execute "do A then B" grooming instructions.

Goal: move from single-step skills to coordinated preparatory subtasks.

---

#### [Phase 4: Clipper-Based Execution](/docs/phase.html?id=4)

Phase 4 introduces clipper-driven trimming. The focus shifts from preparation to executing trimming actions on prepared regions.

Representative capabilities:

- one clipper pass on prepared sections,
- uniform trimming on designated patches,
- boundary-following local clipper paths,
- trimming under stabilized setup.

For feasibility, clipper proxy settings are acceptable before full high-fidelity strand-level cutting.

---

#### [Phase 5: Workflow-Level Local Haircutting](/docs/phase.html?id=5)

Phase 5 evaluates local haircut workflows. The target is no longer isolated skills, but ordered composition into local haircut procedures.

Representative workflows:

- expose → part → section → stabilize → clipper trim,
- isolate → lift → trim → inspect,
- local preparation followed by touch-up and adjustment.

Goal: combine primitive, structured, and coordination skills into realistic local haircut logic.

---

### Tool Use

Tool use is a benchmark component, not an optional condition. Since most VLA robots use gripper end-effectors, tasks require tool acquisition before execution.

To avoid turning the benchmark into a generic grasping benchmark, tool setup is standardized (reachable, graspable canonical poses), while preserving evaluation room for whether grasp pose is suitable for downstream use.

Tool complexity increases by phase:

- Phase 1: single-tool grasp/use (comb, tail comb),
- Phase 2: richer structured use of the same tool,
- Phase 3: coordinated tool-hand or dual-tool usage,
- Phase 4: clipper introduction,
- Phase 5: workflow-level comb + clipper composition.

---

### Skill Composition Across Phases

Phases are progressive, not alternatives.

- Phase 1 provides primitive operators.
- Phase 2 organizes primitives into structured skills.
- Phase 3 composes structured skills into coordinated subtasks.
- Phase 4 executes clipper trimming on prepared states.
- Phase 5 composes all prior capabilities into local haircut workflows.

Later phases are higher-level evaluations built on prior capabilities, not disconnected new tasks.

---

### Release Strategy

Haircutting-VLA Benchmark follows staged release.

Phase 1 is the first formal release candidate because it is the most feasible and reproducible. Later phases are expansion tracks introducing structured tasks, coordinated tasks, clipper execution, and workflow-level composition.

This strategy ensures each phase has standalone value while preserving a clear expansion path toward realistic haircutting capability evaluation.
