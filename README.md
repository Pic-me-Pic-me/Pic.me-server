<div align="center">

![image](https://user-images.githubusercontent.com/79238676/210397614-f9d7549a-0a81-4da4-b432-308581c1b65c.png)

<h2> ✨ 빠르게 골라보는 나의 사진, 뭐 올릴지 고민 될 땐? 픽미! ✨ </h2>

![image](https://user-images.githubusercontent.com/79238676/210467092-feb8707f-9b6f-4e67-92f7-1ba491b05096.png)
![image](https://user-images.githubusercontent.com/79238676/210467191-27e0e42c-e993-4dc6-be45-3b3f2a16af2b.png)

</div>

<h1> 💡 Pic.me 서비스의 핵심 기능 </h1>

<h2> 📥 Maker </h2>
<h4> 1️⃣ 투표 생성</h4>

<div ><strong> 사진 선택 및 제목 입력 </strong> 단 두가지의 입력만으로 간단한 투표 생성을 진행합니다.  <br/>

<h4> 2️⃣ 링크 생성 및 공유</h4>

<div ><strong> 투표 링크 생성 및 인스타그램 공유하기 </strong> 를 통해 링크게시를 유도합니다.  <br/>

<h4> 3️⃣ 투표 모아보기 </h4>

<div ><strong> 진행했던 투표 목록을 모아보는 </strong> 라이브러리 기능을 통해 투표 현황 및 결과를 조회합니다. <br/>

<h2> 📥 Player </h2>
<h4> 1️⃣ 투표 참여</h4>

  <div > 인스타그램 스토리를 통해 <strong> 링크 입장, 익명 투표 </strong> 를 진행합니다</div>
  <div> 투표 참여자는 익명으로 투표 👉 (참여자는 로그인 X)</div>
  
<h4> 2️⃣ 이유 선택</h4>

<div ><strong> 사진 선택 후 이유 선택 진행 최종적으로 투표하기 </strong> 를 통해 최종 투표를 완료합니다. <br/>
  <div> 간단한 이유 선택 👉 (이유의 아이콘 화) 투표하기 클릭 </div>
<h4> 3️⃣ 스티커 픽미  </h4>

<div >선택한 사진 위에  <strong> 나의 시선이 머무른 곳에 스티커를 부착 </strong> 하여 직관적으로 결과를 나타냅니다. <br/>
  <div> 스티커 부착 뒤에는 현재까지 붙여진 스티커를 모두 나타내 현재 투표 상황을 보여줍니다. </div>
  
#  👩‍💻 Pic.Server

<table align="center">
    <tr align="center">
        <td style="min-width: 150px;">
            <a href="https://github.com/dragontaek-lee">
              <img src="https://i.kym-cdn.com/photos/images/facebook/001/642/536/91a" width="200" height="160">
              <br />
              <b>dragontaek-lee</b>
            </a>
        </td>
        <td style="min-width: 150px;" background-color="white">
            <a href="https://github.com/wlwpfh">
              <img src="https://user-images.githubusercontent.com/54241139/210503471-0d79536e-da2c-43c3-8348-c80808a76567.jpg" width="200" height="180">
              <br />
              <b>wlwpfh</b>
            </a> 
        </td>
        <td style="min-width: 150px;">
            <a href="https://github.com/GaHee99">
              <img src="https://user-images.githubusercontent.com/54241139/210498336-03751639-db63-4bbd-9e6c-679446f0b0da.jpg" width="200" height="150">
              <br />
              <b>GaHee99</b>
            </a>
        </td>
    </tr>
    <tr align="center">
        <td>
           이용택<br/>
           BE
      </td>
        <td>
            양지영<br />
            BE
        </td>
        <td>
            최가희<br />
            BE
        </td>
    </tr>
</table>

# ⚒️ ERD

![KakaoTalk_20230104_153216811](https://user-images.githubusercontent.com/54241139/210499157-923d86f2-7088-4020-9bff-9dae66352436.png)

# 역할 분담 및 API 로직 구현 진척도

https://charm-wolfsbane-f42.notion.site/API-ff429d56790c4ecb8c0d877852bf95a2

# ✅ 커밋 컨벤션

### 1 Issue = 1 Branch = 1 PR

## Commit

``[분류]` : `작업 내역` - `#이슈 번호`

```bash
chore: 세팅, 변수 설정 등 #2
feat: 새로운 주요 기능 추가 #2
add: 파일 추가 #2
fix: 버그 수정 #2
del: 쓸모없는 코드 삭제 #2
refactor: 코드 리팩토링 #2
move: 프로젝트 구조 변경(폴더링 등) #2
rename: 파일, 클래스, 변수명 등 이름 변경 #2
docs: Wiki, README 파일 수정 #2
```

## Branch Naming

`분류` /`#이슈 번호` - `상세 작업 내역`

```jsx
chore/#3-project-setting
feat/#4-kakao-auth
fix/#2-login-type-error
refactor/#1-code-indent
```

## 작업 순서

```
1. 이슈 생성
2. 브랜치 생성
3. 작업, 커밋
4. push
5. pr 작성
6. 코드리뷰
7. Approve 받았을 경우 self merge
8. Delete Branch
```

# ✅ 코딩 컨벤션

https://darkened-purpose-5e9.notion.site/Coding-Convention-4934afbbf5ad4a7a9ad3570cca736a9f

# ✅ branch 전략

https://darkened-purpose-5e9.notion.site/Branch-326ab8efcd3242f2838dd93a079958c5

# 📁 폴더 구조

```
.
└── Pic.me-server/
    ├── .github
    ├── .husky
    ├── prisma/
    │   └── schema.prisma
    ├── src/
    │   ├── config
    │   ├── constants
    │   ├── controller
    │   ├── interfaces
    │   ├── middlewares
    │   ├── modlues
    │   ├── router
    │   ├── service
    │   └── indext.ts
    ├── .eslintrc
    ├── .gitignore
    ├── .prettierrc.json
    ├── nodemon.json
    ├── package.json
    ├── README.md
    └── tsconfig.json
```

<br/>

# package.json

```
{
    "name": "Pic.me-server",
    "version": "1.0.0",
    "description": "pic.me API",
    "main": "index.js",
    "repository": "https://github.com/Pic-me-Pic-me/Pic.me-server",
    "author": "<dragontaek98@naver.com>",
    "license": "MIT",
    "scripts": {
        "dev": "nodemon",
        "build": "tsc && node dist",
        "db:pull": "npx prisma db pull",
        "db:push": "npx prisma db push",
        "generate": "npx prisma generate",
        "prepare": "husky install",
        "greeting": "hello husky!",
        "test": "yarn mocha test/**/*.ts -r ts-node/register --exit"
    },
    "dependencies": {
        "@prisma/client": "^4.8.0",
        "@types/cors": "^2.8.13",
        "aws-sdk": "^2.1286.0",
        "axios": "^1.2.2",
        "bcryptjs": "^2.4.3",
        "cors": "^2.8.5",
        "dayjs": "^1.11.7",
        "dotenv": "^16.0.3",
        "express": "^4.18.2",
        "express-validator": "^6.14.2",
        "jsonwebtoken": "^9.0.0",
        "multer": "^1.4.5-lts.1",
        "multer-s3": "^3.0.1",
        "prisma": "^4.8.0",
        "typescript": "^4.9.4"
    },
    "devDependencies": {
        "@types/bcryptjs": "^2.4.2",
        "@types/chai": "^4.3.4",
        "@types/express": "^4.17.15",
        "@types/express-validator": "^3.0.0",
        "@types/jsonwebtoken": "^9.0.0",
        "@types/mocha": "^10.0.1",
        "@types/multer": "^1.4.7",
        "@types/multer-s3": "^3.0.0",
        "@types/node": "^18.11.18",
        "@types/supertest": "^2.0.12",
        "chai": "^4.3.7",
        "eslint": "^8.31.0",
        "eslint-config-airbnb-base": "^15.0.0",
        "eslint-config-airbnb-typescript": "^17.0.0",
        "eslint-config-prettier": "^8.6.0",
        "eslint-plugin-import": "^2.26.0",
        "eslint-plugin-prettier": "^4.2.1",
        "husky": "^8.0.0",
        "mocha": "^10.2.0",
        "nodemon": "^2.0.20",
        "prettier": "^2.8.1",
        "supertest": "^6.3.3",
        "ts-node": "^10.9.1"
    }
}

```

<br />

## 서버 구조

<img width="80%" src="https://user-images.githubusercontent.com/77230391/212266294-c3c84421-ba85-4edd-9a02-58e5ba826a8a.png"/>
