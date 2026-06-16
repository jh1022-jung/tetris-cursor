# 테트리스

HTML, CSS, JavaScript만 사용하는 브라우저 테트리스 게임 교육용 프로젝트입니다.  
빌드 도구나 외부 라이브러리 없이 바로 실행할 수 있습니다.

## 프로젝트 소개

- **목적**: 입문자가 HTML / CSS / JavaScript 역할 분리와 게임 로직을 학습하기 위한 프로젝트
- **기술 스택**: HTML5, CSS3, Vanilla JavaScript
- **보드 크기**: 10열 × 20행
- **블록 종류**: I, O, T, S, Z, J, L (7가지 테트로미노)

## 실행 방법

### 로컬 실행

1. 이 프로젝트 폴더를 연다.
2. `index.html` 파일을 더블클릭하거나, 브라우저로 드래그한다.
3. 또는 브라우저 주소창에 파일 경로를 입력한다.

   ```
   file:///C:/Users/usejen_id/Downloads/CursorAI_basic-main/CursorAI_basic-main/src/tetris-cursor/index.html
   ```

4. **시작** 버튼을 눌러 게임을 시작한다.

### GitHub Pages 실행

배포 후 아래 URL로 접속한다. (`<사용자명>`, `<저장소명>`을 본인 값으로 바꾼다)

```
https://<사용자명>.github.io/<저장소명>/
```

저장소 루트가 `tetris-cursor` 폴더인 경우:

```
https://<사용자명>.github.io/<저장소명>/tetris-cursor/
```

## 조작법

게임이 진행 중일 때만 키 입력이 적용됩니다. 충돌 판정(`canMove`)을 통과할 때만 이동·회전이 적용되며, 벽이나 블록과 충돌하면 취소됩니다.

| 키 | 동작 |
|---|---|
| `ArrowLeft` (←) | 왼쪽 이동 |
| `ArrowRight` (→) | 오른쪽 이동 |
| `ArrowDown` (↓) | 한 칸 빠르게 내리기 (soft drop) |
| `ArrowUp` (↑) | 블록 회전 (충돌 시 취소) |
| `Space` | 즉시 바닥까지 낙하 (hard drop) |

| 버튼 | 동작 |
|---|---|
| **시작** | 보드·블록·타이머 초기화 후 낙하 시작 (점수 유지) |
| **재시작** | 점수·보드·타이머·상태 전부 초기화 후 새 게임 시작 |

## 구현 기능

- 10×20 게임 보드 (CSS Grid)
- I, O, T, S, Z, J, L 블록 생성 및 렌더링
- 자동 낙하 (800ms 간격)
- 키보드 조작 (이동, 회전, soft/hard drop)
- 충돌 판정 (`canMove`)
- 블록 고정 및 새 블록 스폰
- 가득 찬 줄 삭제
- 줄 삭제 점수 (1줄 100 / 2줄 300 / 3줄 500 / 4줄 800)
- 게임 오버 처리 (스폰 불가 시)
- 재시작 시 보드·점수·타이머·상태 초기화

## 파일 구조

```
tetris-cursor/
├── index.html   # 게임 화면 구조
├── style.css    # 스타일
├── script.js    # 게임 로직
└── README.md    # 프로젝트 안내
```

## 품질 점검 방법

프로젝트에 포함된 Cursor 명령으로 점검할 수 있습니다.

| 명령 | 용도 |
|---|---|
| `/review-structure` | HTML/CSS/JS 역할 분리, README 존재 여부 |
| `/review-game-logic` | 보드·충돌·고정·게임 오버 로직 |
| `/qa-playtest` | 기능별 QA 시나리오 |
| `/bug-hunt` | 잠재 버그 탐색 |
| `/release-check` | GitHub Pages 배포 전 최종 점검 |

### 수동 확인 체크리스트

1. `index.html`을 브라우저에서 연다.
2. F12 → **Console** 탭에서 에러가 없는지 확인한다.
3. F12 → **Network** 탭에서 `style.css`, `script.js`가 200으로 로드되는지 확인한다.
4. **시작** 클릭 → 블록 자동 낙하 확인
5. 키보드 조작 (←→↓↑, Space) 확인
6. 줄 삭제 시 점수 증가 확인
7. 천장까지 쌓아 **게임 오버** 메시지 확인
8. **재시작** 클릭 → 보드·점수 초기화 확인

## GitHub Pages 배포 방법

### 1. 커밋할 파일

```
index.html
style.css
script.js
README.md
.gitignore   (선택, .cursor/ 제외용)
```

### 2. 커밋에서 제외할 파일

```
.cursor/          # Cursor IDE 명령 파일 (배포 불필요)
```

### 3. 배포 절차

1. GitHub에 저장소를 생성한다.
2. 게임 파일을 push한다.

   ```bash
   git add index.html style.css script.js README.md .gitignore
   git commit -m "Deploy tetris-cursor to GitHub Pages"
   git push origin main
   ```

3. GitHub 저장소 → **Settings** → **Pages**
4. **Source**: `Deploy from a branch`
5. **Branch**: `main` / **Folder**: `/ (root)` (또는 `tetris-cursor`가 루트인 브랜치)
6. **Save** 후 1~2분 뒤 배포 URL로 접속한다.

### 4. 배포 후 확인

- 게임 보드와 UI가 정상 표시되는가?
- CSS·JS가 로드되는가? (Network 탭)
- Console에 에러가 없는가?
- 시작·재시작·키보드 조작이 동작하는가?

## 점수 규칙

블록이 고정된 뒤 가득 찬 줄이 삭제되면 아래 점수가 **한 번에** 더해집니다.

| 삭제 줄 수 | 점수 |
|---|---|
| 1줄 | 100 |
| 2줄 | 300 |
| 3줄 | 500 |
| 4줄 | 800 |

## 게임 오버

새 블록을 스폰 위치(보드 상단 중앙)에 둘 수 없으면 게임 오버가 됩니다.

- 화면에 **"게임 오버"** 메시지가 표시됩니다.
- 자동 낙하 타이머가 멈춥니다.
- 키보드 조작이 비활성화됩니다.
