# SENSE MAKER CMS 기능 상세 가이드

## 목차
1. [아키텍처 개요](#아키텍처-개요)
2. [파일 구조](#파일-구조)
3. [데이터베이스 스키마](#데이터베이스-스키마)
4. [API 레이어 (database.js)](#api-레이어)
5. [페이지별 상세 설명](#페이지별-상세-설명)
6. [테스트 방법](#테스트-방법)

---

## 아키텍처 개요

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│  Pages                │  Components         │  Lib           │
│  ├── Member/          │  ├── MemberLayout   │  ├── supabase.js│
│  │   ├── Login        │  ├── Navbar         │  └── database.js│
│  │   ├── Dashboard    │  └── Footer         │                │
│  │   ├── ProjectEditor│                     │                │
│  │   └── PostEditor   │                     │                │
│  ├── Projects (공개)  │                     │                │
│  └── Blog (공개)      │                     │                │
├─────────────────────────────────────────────────────────────┤
│                     Supabase Backend                         │
│  ├── Authentication (이메일/비밀번호)                         │
│  ├── PostgreSQL Database                                     │
│  │   ├── profiles (사용자 프로필)                             │
│  │   ├── projects (프로젝트)                                  │
│  │   └── posts (블로그 글)                                    │
│  └── Row Level Security (RLS)                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 파일 구조

```
src/
├── lib/
│   ├── supabase.js          # Supabase 클라이언트 초기화
│   └── database.js          # CRUD API 함수 모음
├── pages/
│   ├── Member/
│   │   ├── Login.jsx        # 로그인/회원가입
│   │   ├── Dashboard.jsx    # 멤버 대시보드 (내 콘텐츠 관리)
│   │   ├── ProjectEditor.jsx # 프로젝트 생성/수정
│   │   └── PostEditor.jsx   # 블로그 글 작성/수정
│   ├── Projects.jsx         # 공개 프로젝트 목록
│   └── Blog.jsx             # 공개 블로그 목록
└── App.jsx                  # 라우팅 설정
```

---

## 데이터베이스 스키마

### profiles 테이블
```sql
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,              -- auth.users와 연결
  username text UNIQUE,             -- 사용자명
  full_name text,                   -- 이름
  avatar_url text,                  -- 프로필 이미지
  role text DEFAULT 'member',       -- 역할 (admin/member)
  updated_at timestamp with time zone
);
```

### projects 테이블
```sql
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,              -- 프로젝트명 (필수)
  description text,                 -- 설명
  status text DEFAULT 'Planning',   -- 상태 (Planning/In Progress/Completed)
  tech_stack text[],                -- 기술 스택 (배열)
  image_url text,                   -- 이미지 URL
  author_id uuid NOT NULL,          -- 작성자 ID (profiles 참조)
  created_at timestamp with time zone DEFAULT now()
);
```

### posts 테이블
```sql
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,              -- 제목 (필수)
  content text,                     -- 내용 (마크다운)
  tags text[],                      -- 태그 (배열)
  author_id uuid NOT NULL,          -- 작성자 ID
  published boolean DEFAULT false,  -- 발행 여부
  created_at timestamp with time zone DEFAULT now()
);
```

### RLS 정책 요약
| 테이블 | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| profiles | 모든 사용자 | 본인만 | 본인만 | - |
| projects | 모든 사용자 | 로그인 사용자 | 작성자만 | 작성자만 |
| posts | 발행된 글 + 본인 글 | 로그인 사용자 | 작성자만 | 작성자만 |

---

## API 레이어

### 파일: `src/lib/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
);
```

**설명**: Supabase 클라이언트를 초기화합니다. 환경 변수가 없으면 placeholder를 사용하여 빌드 에러를 방지합니다.

---

### 파일: `src/lib/database.js`

#### projectsApi - 프로젝트 CRUD

```javascript
export const projectsApi = {
    // 1. 전체 조회 (공개)
    async getAll() {
        const { data, error } = await supabase
            .from('projects')
            .select(`*, profiles:author_id (full_name, avatar_url)`)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // 2. 단일 조회
    async getById(id) {
        const { data, error } = await supabase
            .from('projects')
            .select(`*, profiles:author_id (full_name, avatar_url)`)
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    // 3. 내 프로젝트 조회
    async getMyProjects(userId) {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // 4. 생성
    async create(project) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('projects')
            .insert({
                title: project.title,
                description: project.description,
                status: project.status || 'Planning',
                tech_stack: project.techStack
                    ? project.techStack.split(',').map(t => t.trim())
                    : [],
                image_url: project.imageUrl || null,
                author_id: user.id
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 5. 수정
    async update(id, project) {
        const { data, error } = await supabase
            .from('projects')
            .update({
                title: project.title,
                description: project.description,
                status: project.status,
                tech_stack: project.techStack
                    ? project.techStack.split(',').map(t => t.trim())
                    : [],
                image_url: project.imageUrl || null
            })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 6. 삭제
    async delete(id) {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    }
};
```

#### postsApi - 블로그 CRUD

```javascript
export const postsApi = {
    // 1. 발행된 글 조회 (공개)
    async getPublished() {
        const { data, error } = await supabase
            .from('posts')
            .select(`*, profiles:author_id (full_name, avatar_url)`)
            .eq('published', true)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // 2. 내 글 조회 (임시저장 포함)
    async getMyPosts(userId) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('author_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    // 3. 생성
    async create(post) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('posts')
            .insert({
                title: post.title,
                content: post.content,
                tags: post.tags ? post.tags.split(',').map(t => t.trim()) : [],
                published: post.published || false,
                author_id: user.id
            })
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // 4. 삭제
    async delete(id) {
        const { error } = await supabase
            .from('posts')
            .delete()
            .eq('id', id);
        if (error) throw error;
        return true;
    },

    // 5. 발행 토글
    async togglePublish(id, published) {
        const { data, error } = await supabase
            .from('posts')
            .update({ published })
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};
```

---

## 페이지별 상세 설명

### 1. 로그인 페이지 (`/member/login`)

**파일**: `src/pages/Member/Login.jsx`

**기능**:
- 이메일/비밀번호 로그인
- 회원가입 (토글 방식)
- 회원가입 시 자동 프로필 생성 (DB 트리거)

**핵심 로직**:
```javascript
// 회원가입
const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
        data: {
            full_name: fullName,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`,
        },
    },
});

// 로그인
const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
});

// 성공 시 대시보드로 이동
if (data.user) navigate('/member/dashboard');
```

---

### 2. 멤버 대시보드 (`/member/dashboard`)

**파일**: `src/pages/Member/Dashboard.jsx`

**기능**:
- 내 프로젝트 목록 조회
- 내 블로그 글 목록 조회
- 프로젝트 삭제
- 블로그 글 삭제
- 블로그 발행/비공개 토글

**핵심 로직**:
```javascript
// 데이터 로딩
const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const [projects, posts] = await Promise.all([
            projectsApi.getMyProjects(user.id),
            postsApi.getMyPosts(user.id)
        ]);
        setMyProjects(projects || []);
        setMyPosts(posts || []);
    }
};

// 프로젝트 삭제
const handleDeleteProject = async (id) => {
    if (!window.confirm('정말 이 프로젝트를 삭제하시겠습니까?')) return;
    await projectsApi.delete(id);
    setMyProjects(prev => prev.filter(p => p.id !== id));
};

// 발행 토글
const handleTogglePublish = async (id, currentStatus) => {
    await postsApi.togglePublish(id, !currentStatus);
    setMyPosts(prev => prev.map(p =>
        p.id === id ? { ...p, published: !currentStatus } : p
    ));
};
```

---

### 3. 프로젝트 에디터 (`/member/projects/new`)

**파일**: `src/pages/Member/ProjectEditor.jsx`

**기능**:
- 새 프로젝트 생성
- 폼 유효성 검사
- 저장 후 대시보드로 자동 이동

**입력 필드**:
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | text | ✅ | 프로젝트명 |
| status | select | - | 상태 (기획/진행/완료) |
| techStack | text | - | 기술 스택 (쉼표 구분) |
| description | textarea | - | 설명 |

**핵심 로직**:
```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        if (!formData.title.trim()) {
            throw new Error('프로젝트 명을 입력해주세요.');
        }
        await projectsApi.create(formData);
        setSuccess(true);
        setTimeout(() => navigate('/member/dashboard'), 1500);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
```

---

### 4. 블로그 에디터 (`/member/posts/new`)

**파일**: `src/pages/Member/PostEditor.jsx`

**기능**:
- 새 블로그 글 작성
- 마크다운 에디터 (실시간 미리보기)
- 임시저장 / 발행 선택

**입력 필드**:
| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| title | text | ✅ | 제목 |
| tags | text | - | 태그 (쉼표 구분) |
| content | MDEditor | ✅ | 마크다운 내용 |

**핵심 로직**:
```javascript
const handleSave = async (publish = false) => {
    setLoading(true);
    try {
        if (!title.trim()) throw new Error('제목을 입력해주세요.');
        if (!content.trim()) throw new Error('내용을 입력해주세요.');

        await postsApi.create({
            title,
            content,
            tags,
            published: publish  // false = 임시저장, true = 발행
        });
        setSuccess(true);
        setTimeout(() => navigate('/member/dashboard'), 1500);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
};
```

---

### 5. 공개 프로젝트 페이지 (`/projects`)

**파일**: `src/pages/Projects.jsx`

**기능**:
- 모든 프로젝트 공개 조회
- 작성자 정보 표시
- 상태별 라벨 표시

**핵심 로직**:
```javascript
const loadProjects = async () => {
    const data = await projectsApi.getAll();
    setProjects(data || []);
};
```

---

### 6. 공개 블로그 페이지 (`/blog`)

**파일**: `src/pages/Blog.jsx`

**기능**:
- 발행된 글만 조회 (`published = true`)
- 클릭 시 모달로 전체 내용 표시
- 마크다운 미리보기 (첫 150자)

**핵심 로직**:
```javascript
const loadPosts = async () => {
    const data = await postsApi.getPublished();
    setPosts(data || []);
};
```

---

## 테스트 방법

### 1. 회원가입/로그인 테스트

```
1. https://sensemaker-eight.vercel.app/#/member/login 접속
2. "계정이 없으신가요? 회원가입" 클릭
3. 이름, 이메일, 비밀번호 입력 후 회원가입
4. 대시보드로 자동 이동 확인
```

**예상 결과**:
- 회원가입 성공 메시지 표시
- `/member/dashboard`로 리다이렉트
- Supabase > Authentication > Users에서 사용자 확인

---

### 2. 프로젝트 생성 테스트

```
1. 로그인 상태에서 대시보드 접속
2. "+ 새 프로젝트" 버튼 클릭
3. 폼 입력:
   - 프로젝트명: "AI 구조해석 자동화"
   - 상태: "진행 중"
   - 기술 스택: "Python, TensorFlow, React"
   - 설명: "구조 해석 자동화 시스템 개발"
4. "프로젝트 저장" 클릭
```

**예상 결과**:
- 성공 메시지 표시
- 1.5초 후 대시보드로 이동
- 대시보드에 새 프로젝트 표시
- `/projects` 페이지에서 공개 확인

---

### 3. 프로젝트 삭제 테스트

```
1. 대시보드에서 프로젝트 카드에 마우스 호버
2. 휴지통 아이콘 클릭
3. 확인 다이얼로그에서 "확인" 클릭
```

**예상 결과**:
- 목록에서 즉시 제거
- `/projects` 페이지에서도 제거 확인

---

### 4. 블로그 글 작성 테스트

```
1. 대시보드에서 "+ 새 글 쓰기" 클릭
2. 폼 입력:
   - 제목: "React 18 새로운 기능 정리"
   - 태그: "React, Frontend, JavaScript"
   - 내용: (마크다운 형식으로 작성)
3. "임시저장" 또는 "발행하기" 클릭
```

**예상 결과**:
- 임시저장: 대시보드에 "임시저장" 라벨과 함께 표시
- 발행하기: `/blog` 페이지에서 공개 확인

---

### 5. 발행 토글 테스트

```
1. 대시보드에서 블로그 글 카드에 마우스 호버
2. 눈 아이콘 클릭
```

**예상 결과**:
- 발행 → 비공개: `/blog`에서 사라짐
- 비공개 → 발행: `/blog`에서 표시됨

---

### 6. API 직접 테스트 (브라우저 콘솔)

```javascript
// 브라우저 개발자 도구 콘솔에서 실행

// 1. Supabase 접근 확인
console.log(window.supabase); // undefined면 모듈 로드 필요

// 2. 프로젝트 목록 조회
const { data: projects } = await supabase
    .from('projects')
    .select('*');
console.log(projects);

// 3. 현재 사용자 확인
const { data: { user } } = await supabase.auth.getUser();
console.log(user);
```

---

### 7. Supabase 대시보드에서 데이터 확인

```
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. Table Editor 메뉴에서:
   - profiles: 회원가입한 사용자 확인
   - projects: 생성된 프로젝트 확인
   - posts: 작성된 글 확인
```

---

## 에러 처리

### 공통 에러 메시지

| 에러 | 원인 | 해결 방법 |
|------|------|----------|
| "User not authenticated" | 로그인 안 됨 | 로그인 후 재시도 |
| "duplicate key value" | 중복 데이터 | 다른 값으로 입력 |
| "violates foreign key constraint" | 참조 무결성 위반 | 관련 데이터 먼저 생성 |
| "new row violates row-level security" | RLS 정책 위반 | 권한 확인 |

---

## 추가 개발 가이드

### 프로젝트 수정 기능 추가 예시

```javascript
// 1. App.jsx에 라우트 추가
<Route path="/member/projects/:id/edit" element={<ProjectEditor />} />

// 2. ProjectEditor.jsx 수정
import { useParams } from 'react-router-dom';

const { id } = useParams();
const isEdit = !!id;

useEffect(() => {
    if (id) {
        loadProject(id);
    }
}, [id]);

const loadProject = async (id) => {
    const data = await projectsApi.getById(id);
    setFormData({
        title: data.title,
        description: data.description,
        status: data.status,
        techStack: data.tech_stack?.join(', ') || ''
    });
};

const handleSubmit = async (e) => {
    e.preventDefault();
    if (isEdit) {
        await projectsApi.update(id, formData);
    } else {
        await projectsApi.create(formData);
    }
};
```

---

## 환경 변수

```env
# .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**주의**: `.env` 파일은 `.gitignore`에 포함되어 있어 GitHub에 커밋되지 않습니다.
