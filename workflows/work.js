export const meta = {
  name: 'work',
  description: '작업 설명 하나로 계획 → 구현 → lint 게이트 → 병렬 검증(code-reviewer, a11y-checker, 단위 테스트) → review.md 까지. 수정과 커밋은 사람이 정한다',
  whenToUse: '/work <작업 설명>. 선택 인자: --autofix (P0, P1 을 1회 자동 수정 후 재검증), --scope <이름>. args 는 {task, autofix, scope} 객체 또는 작업 설명 문자열. 단위 테스트는 사람과 합의 없이 계획 단계의 시나리오로 쓴다 - /work 를 돌린 것이 그 합의다',
  phases: [
    { title: 'Plan', detail: '코드베이스를 읽고 변경 계획과 요구사항 빈틈을 낸다' },
    { title: 'Implement', detail: '계획대로 구현한다 (에이전트 1개)' },
    { title: 'Verify', detail: 'lint 게이트 후 code-reviewer, a11y-checker, 단위 테스트를 병렬로' },
    { title: 'Fix', detail: '--autofix 일 때만. P0, P1 을 1회 수정하고 다시 검토한다' },
    { title: 'Report', detail: 'review.md 를 쓰고 다음 명령을 안내한다' },
  ],
}

// ---- 입력 ------------------------------------------------------------------
const input = typeof args === 'string' ? { task: args } : (args || {})
let task = String(input.task || '').trim()
let autofix = Boolean(input.autofix)
let scopeArg = input.scope ? String(input.scope) : ''
// 문자열 인자 안의 플래그도 받는다: "/work --autofix --scope slot-list 목록 화면 추가"
if (/--autofix\b/.test(task)) { autofix = true; task = task.replace(/--autofix\b/, '').trim() }
const scopeMatch = task.match(/--scope\s+(\S+)/)
if (scopeMatch) { scopeArg = scopeMatch[1]; task = task.replace(/--scope\s+\S+/, '').trim() }
if (!task) return { error: '작업 설명이 없다. /work <작업 설명> 으로 부른다.' }

const STYLE = [
  '규칙: .claude/rules/ 의 룰이 자동으로 로드된다. 한국어로 쓰고, 하이픈만 쓴다(줄표, 가운뎃점, 이모지 금지).',
  '하지 않은 검증을 했다고 쓰지 않는다. 확인한 것과 확인하지 않은 것을 나눈다.',
].join('\n')

// ---- Plan -----------------------------------------------------------------
phase('Plan')
const PLAN_SCHEMA = {
  type: 'object',
  properties: {
    scope: { type: 'string', description: 'kebab-case 작업 이름. 지정된 것이 있으면 그대로' },
    summary: { type: 'string', description: '무엇을 어떻게 바꿀지 3줄 이내' },
    files: { type: 'array', items: { type: 'string' }, description: '만들거나 고칠 파일' },
    steps: { type: 'array', items: { type: 'string' }, description: '구현 순서' },
    scenarios: { type: 'array', items: { type: 'string' }, description: '순수 로직의 단위 테스트 시나리오 (Given-When-Then 한 줄씩, 최대 5개). 없으면 빈 배열' },
    touchesUi: { type: 'boolean', description: 'tsx 나 css 를 바꾸는가' },
    gaps: {
      type: 'array',
      description: '요구사항이 정하지 않아 구현을 막는 빈틈. decisions.md 에 이미 정해진 것은 넣지 않는다',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          options: { type: 'array', items: { type: 'string' }, description: '선택지 2~3개와 각각 무엇이 깨지는지' },
          recommended: { type: 'string' },
        },
        required: ['question', 'options', 'recommended'],
      },
    },
  },
  required: ['scope', 'summary', 'files', 'steps', 'scenarios', 'touchesUi', 'gaps'],
}
const plan = await agent([
  '작업 설명을 읽고 이 저장소에서 어떻게 구현할지 계획을 낸다. 코드를 바꾸지 않는다.',
  '',
  '## 작업',
  task,
  '',
  '## 할 일',
  '1. git branch --show-current 와 관련 파일(폴더 구조, 비슷한 기존 구현, package.json 의 의존성)을 읽는다.',
  '2. scope 이름을 정한다' + (scopeArg ? ' - 지정된 이름 "' + scopeArg + '" 을 그대로 쓴다.' : ' - 브랜치 이름에서 feat/, fix/ 같은 접두어를 뗀 것. main 이면 작업 설명에서 kebab-case 로.'),
  '3. .claude/_workspace/<scope>/decisions.md 가 있으면 읽는다. 거기서 이미 정한 지점은 빈틈으로 올리지 않는다.',
  '4. 요구사항이 정하지 않은 지점(정책 값, 라이브러리 선택, 화면 동작의 갈림길)이 있으면 gaps 에 선택지 2~3개와 각각 무엇이 깨지는지, 추천 하나를 적는다. 빈틈이 있으면 구현은 시작되지 않는다 - 사람이 정한 뒤 다시 돌린다.',
  '5. 바꿀 파일, 구현 순서, 순수 로직이 있으면 단위 테스트 시나리오(최대 5개)를 적는다. 렌더만 하는 컴포넌트는 시나리오에 넣지 않는다.',
  '',
  STYLE,
].join('\n'), { label: 'plan', phase: 'Plan', schema: PLAN_SCHEMA })

if (!plan) return { error: '계획 단계가 실패했다. 다시 시도한다.' }
const scope = scopeArg || plan.scope
if (plan.gaps && plan.gaps.length > 0) {
  log('요구사항 빈틈 ' + plan.gaps.length + '개 - 구현을 시작하지 않는다')
  return {
    status: 'needs-decision',
    scope,
    summary: plan.summary,
    gaps: plan.gaps,
    next: '선택지를 고르면 .claude/_workspace/' + scope + '/decisions.md 에 "- 빈틈 / 고른 것 / 이유" 한 줄씩 적고 /work 를 다시 돌린다.',
  }
}

// ---- Implement ------------------------------------------------------------
phase('Implement')
const IMPL_SCHEMA = {
  type: 'object',
  properties: {
    changedFiles: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string', description: '계획과 달리 한 것, 하지 못한 것' },
  },
  required: ['changedFiles', 'notes'],
}
const impl = await agent([
  '아래 계획대로 구현한다. 커밋하지 않는다. 계획에 없는 라이브러리를 추가하지 않는다.',
  '',
  '## 작업', task, '',
  '## 계획', plan.summary, '',
  '파일: ' + plan.files.join(', '),
  '순서:', ...plan.steps.map((s, i) => (i + 1) + '. ' + s),
  '',
  '## 끝내는 조건',
  '- 바꾼 파일을 전부 changedFiles 에 적는다. 계획과 달리 한 것과 하지 못한 것은 notes 에 적는다.',
  '- 테스트 파일을 만들지 않는다 - Verify 단계가 계획의 시나리오로 쓴다. 둘이 쓰면 한쪽이 덮어써져 작업이 사라진다. lint 도 다음 단계가 돌린다.',
  '',
  STYLE,
].join('\n'), { label: 'implement', phase: 'Implement', schema: IMPL_SCHEMA })

if (!impl) return { error: '구현 단계가 실패했다. git status 로 남은 변경을 확인한다.', scope }
const changed = impl.changedFiles || []
const touchesUi = plan.touchesUi || changed.some(f => /\.(tsx|css)$/.test(f))

// ---- Verify ---------------------------------------------------------------
phase('Verify')
const LINT_SCHEMA = {
  type: 'object',
  properties: {
    passed: { type: 'boolean' },
    fixed: { type: 'array', items: { type: 'string' }, description: '고친 것 (파일:줄 - 무엇을 왜)' },
    remaining: { type: 'array', items: { type: 'string' }, description: '남은 오류' },
  },
  required: ['passed', 'fixed', 'remaining'],
}
const lintPrompt = [
  '.claude/skills/lint/SKILL.md 를 읽고 그 절차대로 린트와 타입 검사를 돌려 기계적으로 판정되는 오류만 고친다.',
  'any, @ts-ignore, eslint-disable 로 우회하지 않는다. 로직을 바꾸지 않는다. 같은 오류를 2회 고쳐도 남으면 remaining 에 남긴다.',
  '대상 파일: ' + changed.join(', '),
].join('\n')
const lint = await agent(lintPrompt, { label: 'lint', phase: 'Verify', schema: LINT_SCHEMA, effort: 'low' })
// /check 와 같은 게이트: 린트나 타입 오류가 남으면 검토로 넘어가지 않는다 - 타입이 안 맞는 코드 위에서는 지적이 갈라진다.
if (!lint || !lint.passed) {
  log('lint 게이트 실패 - 검토를 시작하지 않는다')
  return {
    status: 'lint-failed',
    scope,
    changedFiles: changed,
    lint: lint ? { fixed: lint.fixed, remaining: lint.remaining } : null,
    next: '남은 오류를 고친 뒤 /check ' + scope + ' 로 검토를 이어간다. 구현은 작업 트리에 남아 있다.',
  }
}

const REVIEW_SCHEMA = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['P0', 'P1'] },
          file: { type: 'string' },
          line: { type: 'string' },
          title: { type: 'string' },
          evidence: { type: 'string' },
          repro: { type: 'string' },
        },
        required: ['severity', 'file', 'line', 'title', 'evidence', 'repro'],
      },
    },
    p2Count: { type: 'number' },
    summary: { type: 'string' },
  },
  required: ['findings', 'p2Count', 'summary'],
}
const TEST_SCHEMA = {
  type: 'object',
  properties: {
    written: { type: 'array', items: { type: 'string' } },
    passed: { type: 'boolean' },
    output: { type: 'string', description: '실패했으면 실패 출력 요약, 통과했으면 건수' },
    skipped: { type: 'string', description: '쓰지 않은 이유 (대상이 없으면)' },
  },
  required: ['written', 'passed', 'output', 'skipped'],
}
function reviewPrompt(kind) {
  return [
    'scope: ' + scope + '. 변경 범위는 git diff HEAD (첫 커밋 전이면 git diff --cached). 변경 파일: ' + changed.join(', '),
    kind === 'a11y' ? '화면 파일(tsx, css)의 접근성만 본다.' : '동작 결함과 소유자 규칙 위반을 본다. 접근성은 다른 검토자가 본다.',
    'P0 와 P1 만 findings 에, P2 는 개수만. 지적마다 파일:줄, 근거, 재현 절차. 재현을 못 쓰는 지적은 내지 않는다. 발견이 없으면 findings 는 빈 배열.',
  ].join('\n')
}
const verifyTasks = [
  () => agent(reviewPrompt('code'), { label: 'code-reviewer', phase: 'Verify', agentType: 'code-reviewer', schema: REVIEW_SCHEMA }),
  () => agent([
    '아래 시나리오에 해당하는 순수 로직의 단위 테스트를 쓰고 돌린다. .claude/skills/test-unit/SKILL.md 의 작성 단계와 .claude/rules/testing.md 의 형식을 따른다. 시나리오 합의 단계는 생략한다 - 사용자가 /work 로 한 번에 돌리기로 했고, 시나리오 목록은 보고서에 그대로 실려 사람이 뒤에 확인한다.',
    '시나리오가 비어 있거나 전부 화면으로 확인 가능한 것이면 쓰지 않고 skipped 에 이유를 적는다.',
    '대상 테스트 파일이 이미 있으면 덮어쓰지 않는다 - 기존 케이스는 그대로 두고 빠진 시나리오만 추가한다. 사람이 쓴 테스트가 사라지면 복구할 수 없다.',
    '테스트를 통과시키려고 구현을 바꾸지 않는다. 실패하면 output 에 실패 출력을 요약한다.',
    '변경 파일: ' + changed.join(', '),
    '시나리오:', ...(plan.scenarios.length ? plan.scenarios.map(s => '- ' + s) : ['- (없음)']),
  ].join('\n'), { label: 'test-unit', phase: 'Verify', schema: TEST_SCHEMA }),
]
if (touchesUi) {
  verifyTasks.push(() => agent(reviewPrompt('a11y'), { label: 'a11y-checker', phase: 'Verify', agentType: 'a11y-checker', schema: REVIEW_SCHEMA }))
}
// 검토자는 읽기 전용이고 테스트 작성은 새 파일만 만들므로 동시에 돌려도 충돌하지 않는다. 보고서에 전부 필요하므로 barrier.
let [codeReview, tests, a11yReview] = await parallel(verifyTasks)
let findings = [...((codeReview && codeReview.findings) || []), ...((a11yReview && a11yReview.findings) || [])]
log('검토 지적 P0/P1 ' + findings.length + '건, 테스트 ' + (tests ? (tests.passed ? '통과' : '실패 또는 미작성') : '없음'))

// ---- Fix (옵션, 1회) --------------------------------------------------------
let fixRound = null
if (autofix && findings.length > 0) {
  phase('Fix')
  const fix = await agent([
    '아래 지적만 고친다. 지적에 없는 것은 바꾸지 않는다. 커밋하지 않는다.',
    ...findings.map((f, i) => (i + 1) + '. [' + f.severity + '] ' + f.file + ':' + f.line + ' - ' + f.title + '\n   근거: ' + f.evidence + '\n   재현: ' + f.repro),
    '',
    STYLE,
  ].join('\n'), { label: 'fix', phase: 'Fix', schema: IMPL_SCHEMA })
  const relint = await agent(lintPrompt, { label: 'lint (재검사)', phase: 'Fix', schema: LINT_SCHEMA, effort: 'low' })
  const again = '\n직전 지적이 해소됐는지 먼저 확인하고, 새로 생긴 문제만 추가로 적는다.'
  const reTasks = [() => agent(reviewPrompt('code') + again, { label: 'code-reviewer (재검토)', phase: 'Fix', agentType: 'code-reviewer', schema: REVIEW_SCHEMA })]
  if (touchesUi) reTasks.push(() => agent(reviewPrompt('a11y') + again, { label: 'a11y-checker (재검토)', phase: 'Fix', agentType: 'a11y-checker', schema: REVIEW_SCHEMA }))
  const [reCode, reA11y] = await parallel(reTasks)
  // 재검토 결과가 있으면 그것으로 교체하고, 없으면(에이전트 실패) 이전 지적을 유지한다. 접근성 지적은 따로 유지한다.
  codeReview = reCode || codeReview
  if (touchesUi) a11yReview = reA11y || a11yReview
  findings = [...((codeReview && codeReview.findings) || []), ...((a11yReview && a11yReview.findings) || [])]
  fixRound = { fixed: fix, lint: relint }
  log('자동 수정 후 남은 지적 ' + findings.length + '건')
}

// ---- Report ---------------------------------------------------------------
// 보고서 본문은 스크립트가 결정적으로 만든다. 에이전트는 파일로 옮기기만 한다 - 옮기는 과정에서 지적이 빠질 자리를 없앤다.
phase('Report')
function section(title, review) {
  const lines = ['## ' + title, '']
  if (!review) return lines.concat(['확인 못 함 - 검토 에이전트가 결과를 돌려주지 않았다.', ''])
  if (!review.findings.length) lines.push('발견 없음.')
  for (const f of review.findings) {
    lines.push('### [' + f.severity + '] ' + f.file + ':' + f.line + ' - ' + f.title)
    lines.push('근거. ' + f.evidence)
    lines.push('재현. ' + f.repro)
    lines.push('')
  }
  lines.push('P2 ' + (review.p2Count || 0) + '건.', '')
  return lines
}
const reviewMd = [
  '# review - ' + scope,
  '',
  '작업: ' + task,
  '계획: ' + plan.summary,
  '',
  ...section('동작', codeReview),
  ...(touchesUi ? section('접근성', a11yReview) : []),
  '## lint',
  '',
  lint ? (lint.passed ? '통과.' : '남은 오류: ' + lint.remaining.join('; ')) : '확인 못 함.',
  ...(lint && lint.fixed.length ? ['고친 것: ' + lint.fixed.join('; ')] : []),
  '',
  '## 테스트',
  '',
  tests ? (tests.written.length ? ('작성 ' + tests.written.join(', ') + ' - ' + (tests.passed ? '통과' : '실패') + '. ' + tests.output) : ('미작성 - ' + tests.skipped)) : '확인 못 함.',
  '',
  '## 변경 파일',
  '',
  ...changed.map(f => '- ' + f),
  '',
  fixRound ? '자동 수정 1회 적용 후 재검토한 결과다.' : '',
  '다음. 지적을 재현하고 고칠 항목을 지정한다. 고친 뒤 git add <파일> → /commit ' + scope,
].join('\n')
const reviewPath = '.claude/_workspace/' + scope + '/review.md'
await agent([
  '아래 내용을 ' + reviewPath + ' 에 그대로 쓴다. 폴더가 없으면 만든다. 한 글자도 바꾸거나 요약하지 않는다. 쓴 뒤 "저장함" 한 줄만 반환한다.',
  '',
  '----- 파일 내용 시작 -----',
  reviewMd,
  '----- 파일 내용 끝 -----',
].join('\n'), { label: 'report', phase: 'Report', effort: 'low' })

return {
  status: 'done',
  scope,
  changedFiles: changed,
  lint: lint ? { passed: lint.passed, remaining: lint.remaining } : null,
  findings,
  p2Count: ((codeReview && codeReview.p2Count) || 0) + ((a11yReview && a11yReview.p2Count) || 0),
  tests: tests ? { written: tests.written, passed: tests.passed, skipped: tests.skipped } : null,
  autofix: fixRound ? '적용 1회' : '미적용',
  reviewFile: reviewPath,
  next: '지적을 재현하고 고칠 항목을 지정한다. 고친 뒤 git add <파일> → /commit ' + scope,
}
